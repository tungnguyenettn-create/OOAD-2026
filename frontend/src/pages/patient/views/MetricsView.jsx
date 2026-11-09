import PageTitle from "../../../components/patient/PageTitle";
import Panel from "../../../components/patient/Panel";
import RefreshButton from "../../../components/patient/RefreshButton";
import HealthMetricForm from "../../../components/patient/HealthMetricForm";
import HealthMetricList from "../../../components/patient/HealthMetricList";

export default function MetricsView({ metrics }) {
  return (
    <>
      <PageTitle
        eyebrow="SỨC KHOẺ"
        title="Chỉ số sức khoẻ"
        subtitle="Theo dõi các chỉ số đo tại nhà và do bác sĩ ghi nhận."
      />

      <div className="pt-stack">
        <HealthMetricForm metrics={metrics} />

        <Panel
          title="Lịch sử chỉ số"
          description={`${metrics.items.length} lần đo`}
          action={
            <RefreshButton
              loading={metrics.loading}
              onClick={metrics.load}
              title="Tải lại chỉ số sức khoẻ"
            />
          }
        >
          <HealthMetricList
            metrics={metrics.items}
            loading={metrics.loading}
            error={metrics.error}
          />
        </Panel>
      </div>
    </>
  );
}
