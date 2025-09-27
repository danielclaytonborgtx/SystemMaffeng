import type React from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { CacheMonitor } from "@/components/cache-monitor";
import { RealtimeToast } from "@/components/realtime-toast";
import { AuthPersistenceProvider } from "@/components/auth/auth-persistence-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AuthPersistenceProvider>
        <div className="h-screen bg-background overflow-hidden flex flex-col md:flex-row">
          <DashboardSidebar />
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-4 sm:p-4 md:p-4 lg:p-6 overflow-y-auto overflow-x-hidden">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
          <PerformanceMonitor />
          <CacheMonitor />
          <RealtimeToast />
        </div>
      </AuthPersistenceProvider>
    </ProtectedRoute>
  );
}
