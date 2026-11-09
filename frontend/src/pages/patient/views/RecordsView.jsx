import { useEffect } from "react";
import PageTitle from "../../../components/patient/PageTitle";
import Panel from "../../../components/patient/Panel";
import RefreshButton from "../../../components/patient/RefreshButton";
import MedicalRecordList from "../../../components/patient/MedicalRecordList";

export default function RecordsView({ records, documents }) {
  const { loadAll } = documents;

  useEffect(() => {
    loadAll(records.items);
  }, [records.items, loadAll]);

  return (
    <>
      <PageTitle eyebrow="HỒ SƠ" title="Lịch sử khám bệnh" subtitle="Chẩn đoán, hướng điều trị và tài liệu từ các lần khám trước." />
      <Panel
        title="Hồ sơ khám bệnh"
        description={`${records.items.length} hồ sơ`}
        action={<RefreshButton loading={records.loading} onClick={records.load} title="Tải lại lịch sử khám bệnh" />}
      >
        <MedicalRecordList
          records={records.items}
          loading={records.loading}
          error={records.error}
          documents={documents}
        />
      </Panel>
    </>
  );
}
