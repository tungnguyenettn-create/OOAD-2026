import PageTitle from "../../../components/patient/PageTitle";
import ProfileForm from "../../../components/patient/ProfileForm";

export default function ProfileView({ patient, profile }) {
  return (
    <>
      <PageTitle eyebrow="TÀI KHOẢN" title="Thông tin cá nhân" subtitle="Cập nhật họ tên, thông tin liên hệ và địa chỉ của bạn." />
      <ProfileForm patient={patient} profile={profile} />
    </>
  );
}
