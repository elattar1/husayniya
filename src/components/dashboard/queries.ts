import { queryOptions } from "@tanstack/react-query";
import { getDashboard, getDashboardProducts, getDashboardOrderItems } from "@/lib/dashboard.functions";

export const dashboardQuery = (admin: boolean) => queryOptions({
  queryKey: ["dashboard", admin], queryFn: () => getDashboard({ data: { admin } }), staleTime: 15_000, revalidateIfStale: true, refetchInterval: 15_000,
});
export const dashboardProductsQuery = (storeId: string) => queryOptions({ queryKey: ['dashboard', 'products', storeId], queryFn: () => getDashboardProducts({ data: { storeId } }), staleTime: 60_000, revalidateIfStale: true });
export const dashboardOrderItemsQuery = (orderId: string, admin: boolean) => queryOptions({ queryKey: ['dashboard', 'order-items', orderId, admin], queryFn: () => getDashboardOrderItems({ data: { orderId, admin } }), staleTime: 60_000 });
export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
export type DashboardProduct = Awaited<ReturnType<typeof getDashboardProducts>>[number];