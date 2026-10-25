import { queryOptions } from "@tanstack/react-query";
import { getDashboard } from "@/lib/dashboard.functions";

export const dashboardQuery = (admin: boolean) => queryOptions({
  queryKey: ["dashboard", admin], queryFn: () => getDashboard({ data: { admin } }), staleTime: 15_000,
});
export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;