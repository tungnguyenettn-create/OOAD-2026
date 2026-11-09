import PageTitle from "../../../components/patient/PageTitle";
import Panel from "../../../components/patient/Panel";
import RefreshButton from "../../../components/patient/RefreshButton";
import PrescriptionList from "../../../components/patient/PrescriptionList";

export default function PrescriptionsView({ prescriptions }) {
  return (
    <>
      <PageTitle
        eyebrow="ĐƠN THUỐC"
        title="Đơn thuốc của tôi"
        subtitle="Các đơn thuốc được bác sĩ kê sau mỗi lần khám."
      />
      <Panel
        title="Danh sách đơn thuốc"
        description={`${prescriptions.items.length} đơn thuốc`}
        action={
          <RefreshButton
            loading={prescriptions.loading}
            onClick={prescriptions.load}
            title="Tải lại đơn thuốc"
          />
        }
      >
        <PrescriptionList
          prescriptions={prescriptions.items}
          loading={prescriptions.loading}
          error={prescriptions.error}
        />
      </Panel>
    </>
  );
}
