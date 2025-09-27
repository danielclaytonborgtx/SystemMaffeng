import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visão geral do sistema de gestão
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <DashboardCharts />
        <div className="space-y-4 md:space-y-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
