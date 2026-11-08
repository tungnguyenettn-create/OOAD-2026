import { useEffect, useMemo, useState, useContext } from "react";
import { Search, UserPlus, Stethoscope, RefreshCw, X, Pencil, Building2 } from "lucide-react";
import { AuthContext } from "../../auth/AuthContext";
import "../../styles/DoctorsPage.css";

const EMPTY_FORM = {
  full_name: "", username: "", email: "", password: "",
  specialization: "", license_number: "", phone: "", department: "", department_id: "",
};

function DoctorsPage() {
  const { token, logout } = useContext(AuthContext);

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Modal tạo phòng ban mới
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", specialization: "", description: "" });
  const [savingDept, setSavingDept] = useState(false);

  async function loadDepartments() {
    if (!token) return;
    try {
      const res = await fetch("/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDepartments(data);
      }
    } catch {
      // ignore
    }
  }

  async function loadDoctors() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) return logout();
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || `Không thể tải danh sách bác sĩ (HTTP ${response.status}).`);
      if (!Array.isArray(result)) throw new Error("Dữ liệu bác sĩ từ API không đúng định dạng.");
      setDoctors(result);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách bác sĩ.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
    loadDepartments();
  }, [token]);

  const filteredDoctors = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return doctors;
    return doctors.filter((doctor) => [
      doctor.full_name, doctor.username, doctor.email, doctor.specialization, doctor.department, doctor.phone,
    ].some((v) => String(v ?? "").toLowerCase().includes(keyword)));
  }, [doctors, search]);

  function getErrorMessage(detail, fallback) {
    const messages = {
      "Username already exists": "Tên đăng nhập đã tồn tại. Hãy chọn tên khác.",
      "Email already exists": "Email đã được sử dụng. Hãy nhập email khác.",
      "License number already exists": "Số giấy phép hành nghề đã tồn tại.",
      "Doctor not found": "Không tìm thấy hồ sơ bác sĩ.",
      "Doctor account not found": "Không tìm thấy tài khoản đăng nhập của bác sĩ.",
    };
    return messages[detail] || `${detail || fallback}`;
  }

  async function handleCreateDepartment(e) {
    e.preventDefault();
    if (!token || !newDept.name) return;
    setSavingDept(true);
    setError("");
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newDept.name.trim(),
          specialization: newDept.specialization.trim() || null,
          description: newDept.description.trim() || null,
        }),
      });
      if (res.status === 401) return logout();
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.detail || "Không thể tạo phòng khoa.");
      setNotice(`Đã thêm khoa "${result.name}" thành công.`);
      setShowDeptModal(false);
      setNewDept({ name: "", specialization: "", description: "" });
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Không thể tạo phòng khoa.");
    } finally {
      setSavingDept(false);
    }
  }

  async function createDoctor(event) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    setSaving(true); setError(""); setNotice("");
    const payload = Object.fromEntries(new FormData(form).entries());
    for (const key of ["specialization", "license_number", "phone", "department"]) payload[key] = String(payload[key] || "").trim() || null;
    for (const key of ["full_name", "username", "email"]) payload[key] = String(payload[key] || "").trim();
    payload.email = payload.email.toLowerCase();

    if (payload.department_id) {
      payload.department_id = Number(payload.department_id);
      const chosenDept = departments.find((d) => d.id === payload.department_id);
      if (chosenDept) {
        if (!payload.department) payload.department = chosenDept.name;
        if (!payload.specialization && chosenDept.specialization) payload.specialization = chosenDept.specialization;
      }
    } else {
      delete payload.department_id;
    }

    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) return logout();
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(getErrorMessage(typeof result.detail === "string" ? result.detail : "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.", `Không thể tạo bác sĩ (HTTP ${response.status}).`));
      
      setNotice(`Đã tạo tài khoản bác sĩ ${result.doctor?.full_name || payload.full_name} thành công.`);
      setShowForm(false);
      form.reset();
      await loadDoctors();
    } catch (err) {
      setError(err.message || "Không thể tạo bác sĩ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  function openEditForm(doctor) { setError(""); setNotice(""); setEditingDoctor(doctor); }

  async function updateDoctor(event) {
    event.preventDefault();
    if (!editingDoctor || !token) return;
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.full_name = String(payload.full_name || "").trim();
    payload.email = String(payload.email || "").trim().toLowerCase();
    for (const key of ["specialization", "license_number", "phone", "department"]) payload[key] = String(payload[key] || "").trim() || null;

    if (payload.department_id) {
      payload.department_id = Number(payload.department_id);
      const chosenDept = departments.find((d) => d.id === payload.department_id);
      if (chosenDept) {
        if (!payload.department) payload.department = chosenDept.name;
        if (!payload.specialization && chosenDept.specialization) payload.specialization = chosenDept.specialization;
      }
    } else {
      payload.department_id = null;
    }

    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/doctors/${editingDoctor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) return logout();
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(getErrorMessage(typeof result.detail === "string" ? result.detail : "", `Không thể cập nhật bác sĩ (HTTP ${response.status}).`));

      setNotice(`Đã cập nhật thông tin bác sĩ ${result.doctor?.full_name || payload.full_name} thành công.`);
      setEditingDoctor(null);
      await loadDoctors();
    } catch (err) {
      setError(err.message || "Không thể cập nhật thông tin bác sĩ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="doctors-page">
      <div className="doctors-heading">
        <div>
          <p className="doctors-eyebrow">QUẢN LÝ NHÂN SỰ Y TẾ</p>
          <h1>Quản lý bác sĩ & Khoa phòng</h1>
          <p className="doctors-description">Quản lý tài khoản đăng nhập, khoa phòng và thông tin chuyên môn của bác sĩ.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="doctors-primary-button" style={{ backgroundColor: "#0284c7" }} onClick={() => { setError(""); setNotice(""); setShowDeptModal(true); }}>
            <Building2 size={18} /> Thêm khoa phòng
          </button>
          <button className="doctors-primary-button" onClick={() => { setError(""); setNotice(""); setShowForm(true); }}>
            <UserPlus size={18} /> Thêm bác sĩ
          </button>
        </div>
      </div>

      <div className="doctors-summary">
        <div className="doctors-summary-icon"><Stethoscope size={24} /></div>
        <div><span>Tổng số bác sĩ</span><strong>{doctors.length}</strong></div>
        <div style={{ marginLeft: "2rem", borderLeft: "1px solid #e2e8f0", paddingLeft: "1.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Số chuyên khoa / Khoa phòng</span>
          <div><strong>{departments.length} khoa</strong></div>
        </div>
      </div>

      {notice && <div className="doctors-notice" role="status">{notice}<button onClick={() => setNotice("")}><X size={16} /></button></div>}
      {error && !showForm && !editingDoctor && !showDeptModal && (
        <div className="doctors-error" role="alert">{error}<button onClick={loadDoctors}><RefreshCw size={15} /> Thử lại</button></div>
      )}

      <div className="doctors-panel">
        <div className="doctors-toolbar">
          <div className="doctors-search"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, username, email, chuyên khoa..." /></div>
          <button className="doctors-refresh-button" onClick={() => { loadDoctors(); loadDepartments(); }} disabled={loading}><RefreshCw size={17} /></button>
        </div>
        {loading ? <div className="doctors-empty">Đang tải danh sách bác sĩ...</div> : error && doctors.length === 0 ? <div className="doctors-empty">Không thể tải dữ liệu. Hãy kiểm tra kết nối và thử lại.</div> : (
          <div className="doctors-table-scroll">
            <table className="doctors-table">
              <thead><tr><th>BÁC SĨ</th><th>TÀI KHOẢN</th><th>CHUYÊN KHOA</th><th>KHOA / PHÒNG BAN</th><th>SỐ ĐIỆN THOẠI</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td><div className="doctors-person"><div className="doctors-avatar">{(doctor.full_name || "B").trim().split(/\s+/).pop().charAt(0).toUpperCase()}</div><div><strong>{doctor.full_name}</strong><span>{doctor.license_number ? `GPLH: ${doctor.license_number}` : "Chưa có số giấy phép"}</span></div></div></td>
                    <td><strong>{doctor.username}</strong><span className="doctors-secondary">{doctor.email}</span></td>
                    <td>{doctor.specialization || "—"}</td><td>{doctor.department || "—"}</td><td>{doctor.phone || "—"}</td>
                    <td><span className={`doctors-status ${doctor.is_active ? "active" : "inactive"}`}>{doctor.is_active ? "Đang hoạt động" : "Đã khóa"}</span></td>
                    <td><button type="button" className="doctors-edit-button" onClick={() => openEditForm(doctor)}><Pencil size={15} /> Chỉnh sửa</button></td>
                  </tr>
                ))}
                {filteredDoctors.length === 0 && <tr><td colSpan="7" className="doctors-empty">Không tìm thấy bác sĩ phù hợp.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="doctors-table-footer">Hiển thị {filteredDoctors.length} / {doctors.length} bác sĩ</div>
      </div>

      {showDeptModal && (
        <div className="doctors-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !savingDept) setShowDeptModal(false); }}>
          <form className="doctors-modal" onSubmit={handleCreateDepartment}>
            <div className="doctors-modal-heading">
              <div><p className="doctors-eyebrow">DANH MỤC KHOA PHÒNG</p><h2>Thêm khoa phòng mới</h2></div>
              <button type="button" className="doctors-close-button" onClick={() => setShowDeptModal(false)} disabled={savingDept}><X size={20} /></button>
            </div>
            {error && <div className="doctors-error" role="alert">{error}</div>}
            <div className="doctors-form-grid">
              <label>Tên khoa phòng *
                <input required value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} placeholder="Ví dụ: Khoa Da liễu" />
              </label>
              <label>Chuyên khoa
                <input value={newDept.specialization} onChange={(e) => setNewDept({ ...newDept, specialization: e.target.value })} placeholder="Ví dụ: Da liễu" />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>Mô tả
                <textarea rows={3} value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} placeholder="Khám và điều trị..." />
              </label>
            </div>
            <div className="doctors-form-actions">
              <button type="button" className="doctors-cancel-button" onClick={() => setShowDeptModal(false)} disabled={savingDept}>Hủy</button>
              <button type="submit" className="doctors-primary-button" disabled={savingDept}>{savingDept ? "Đang lưu..." : "Tạo khoa"}</button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="doctors-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setShowForm(false); }}>
          <form className="doctors-modal" onSubmit={createDoctor}>
            <div className="doctors-modal-heading"><div><p className="doctors-eyebrow">TÀI KHOẢN MỚI</p><h2>Thêm bác sĩ</h2></div><button type="button" className="doctors-close-button" onClick={() => setShowForm(false)} disabled={saving}><X size={20} /></button></div>
            <p className="doctors-form-note">Các trường có dấu * là bắt buộc.</p>
            {error && <div className="doctors-error" role="alert">{error}</div>}
            <div className="doctors-form-grid">
              <label>Họ và tên *<input name="full_name" required maxLength="100" defaultValue={EMPTY_FORM.full_name} /></label>
              <label>Username *<input name="username" required minLength="3" maxLength="50" autoComplete="off" /></label>
              <label>Email *<input name="email" type="email" required maxLength="100" /></label>
              <label>Mật khẩu *<input name="password" type="password" required minLength="8" maxLength="128" autoComplete="new-password" /></label>
              
              <label>Khoa phòng (Danh mục)
                <select name="department_id" defaultValue="">
                  <option value="">-- Chọn khoa phòng có sẵn --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {dept.specialization ? `(${dept.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>Chuyên khoa (hoặc ghi đè)<input name="specialization" maxLength="100" placeholder="Ví dụ: Tim mạch" /></label>
              <label>Tên Khoa tùy chỉnh (nếu không chọn danh mục)<input name="department" maxLength="100" placeholder="Ví dụ: Khoa Tim Mạch K1" /></label>
              <label>Số giấy phép hành nghề<input name="license_number" maxLength="50" /></label>
              <label>Số điện thoại<input name="phone" type="tel" maxLength="20" /></label>
            </div>
            <div className="doctors-form-actions"><button type="button" className="doctors-cancel-button" onClick={() => setShowForm(false)} disabled={saving}>Hủy</button><button type="submit" className="doctors-primary-button" disabled={saving}>{saving ? "Đang tạo..." : "Tạo tài khoản bác sĩ"}</button></div>
          </form>
        </div>
      )}

      {editingDoctor && (
        <div className="doctors-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setEditingDoctor(null); }}>
          <form className="doctors-modal" onSubmit={updateDoctor}>
            <div className="doctors-modal-heading"><div><p className="doctors-eyebrow">CẬP NHẬT HỒ SƠ</p><h2>Chỉnh sửa bác sĩ</h2></div><button type="button" className="doctors-close-button" onClick={() => setEditingDoctor(null)} disabled={saving}><X size={20} /></button></div>
            <p className="doctors-form-note">Username và mật khẩu không thay đổi trong biểu mẫu này.</p>
            {error && <div className="doctors-error" role="alert">{error}</div>}
            <div className="doctors-form-grid">
              <label>Username<input value={editingDoctor.username || ""} readOnly disabled /></label>
              <label>Họ và tên *<input name="full_name" required defaultValue={editingDoctor.full_name || ""} /></label>
              <label>Email *<input name="email" type="email" required defaultValue={editingDoctor.email || ""} /></label>
              
              <label>Khoa phòng (Danh mục)
                <select name="department_id" defaultValue={editingDoctor.department_id || ""}>
                  <option value="">-- Chọn khoa phòng có sẵn --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {dept.specialization ? `(${dept.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>Chuyên khoa<input name="specialization" defaultValue={editingDoctor.specialization || ""} /></label>
              <label>Tên khoa tùy chỉnh<input name="department" defaultValue={editingDoctor.department || ""} /></label>
              <label>Số giấy phép hành nghề<input name="license_number" defaultValue={editingDoctor.license_number || ""} /></label>
              <label>Số điện thoại<input name="phone" defaultValue={editingDoctor.phone || ""} /></label>
            </div>
            <div className="doctors-form-actions"><button type="button" className="doctors-cancel-button" onClick={() => setEditingDoctor(null)} disabled={saving}>Hủy</button><button type="submit" className="doctors-primary-button" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

export default DoctorsPage;
