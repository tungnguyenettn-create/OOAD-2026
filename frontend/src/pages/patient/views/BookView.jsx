import PageTitle from "../../../components/patient/PageTitle";
import BookingForm from "../../../components/patient/BookingForm";
import BookingSummary from "../../../components/patient/BookingSummary";

export default function BookView({ patient, booking, specializationsState, onCancel }) {
  return (
    <>
      <PageTitle
        eyebrow="ĐẶT LỊCH"
        title="Đặt lịch khám"
        subtitle="Chọn chuyên khoa, bác sĩ và khung giờ phù hợp."
      />

      <div className="pt-book-grid">
        <BookingForm booking={booking} specializationsState={specializationsState} onCancel={onCancel} />
        <div>
          <BookingSummary patientName={patient?.full_name} form={booking.form} selectedDoctor={booking.selectedDoctor} />
        </div>
      </div>
    </>
  );
}
