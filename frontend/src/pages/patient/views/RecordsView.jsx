import PageTitle from "../../../components/patient/PageTitle";
import Panel from "../../../components/patient/Panel";
import RefreshButton from "../../../components/patient/RefreshButton";
import MedicalRecordList from "../../../components/patient/MedicalRecordList";

export default function RecordsView({ records }) {
  return (
    <>
      <PageTitle eyebrow="HỒ SƠ" title="Lịch sử khám bệnh" subtitle="Chẩn đoán và hướng điều trị từ các lần khám trước." />
      <Panel
        title="Hồ sơ khám bệnh"
        description={`${records.items.length} hồ sơ`}
        action={<RefreshButton loading={records.loading} onClick={records.load} title="Tải lại lịch sử khám bệnh" />}
      >
        <MedicalRecordList records={records.items} loading={records.loading} error={records.error} />
      </Panel>
    </>
  );
}
