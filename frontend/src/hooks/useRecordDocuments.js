import { useCallback, useState } from "react";
import { API_MEDICAL_RECORDS } from "../utils/constants";

/**
 * Tải tài liệu PDF của từng hồ sơ bệnh án và tải file về máy.
 * Dùng fetch trực tiếp cho file nhị phân vì useApi.request luôn parse JSON.
 */
export default function useRecordDocuments({ request, token, notify }) {
  const [byRecord, setByRecord] = useState({});
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(
    async (records) => {
      if (!records?.length) {
        setByRecord({});
        return;
      }

      setLoading(true);
      try {
        const entries = await Promise.all(
          records.map(async (record) => {
            try {
              const data = await request(`${API_MEDICAL_RECORDS}/${record.id}/documents`);
              return [record.id, Array.isArray(data) ? data : []];
            } catch {
              return [record.id, []];
            }
          })
        );
        setByRecord(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    },
    [request]
  );

  const download = useCallback(
    async (document) => {
      try {
        const response = await fetch(`/api/medical-documents/${document.id}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Không thể tải tài liệu.");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = document.file_name || "tai-lieu.pdf";
        anchor.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        notify(error.message || "Không thể tải tài liệu.", "error");
      }
    },
    [token, notify]
  );

  return { byRecord, loading, loadAll, download };
}
