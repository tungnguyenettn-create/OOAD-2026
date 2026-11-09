import PageTitle from "../../../components/patient/PageTitle";
import ProfileForm from "../../../components/patient/ProfileForm";
import PasswordForm from "../../../components/patient/PasswordForm";

export default function ProfileView({ patient, profile, password }) {
  return (
    <>
      <PageTitle eyebrow="TÀI KHOẢN" title="Thông tin cá nhân" subtitle="Cập nhật họ tên, thông tin liên hệ và địa chỉ của bạn." />
      <div className="pt-stack">
        <ProfileForm patient={patient} profile={profile} />
        <PasswordForm password={password} />
      </div>
    </>
  );
}
