import { queryOptions } from '@tanstack/react-query';
import { getCatalog, getStoreDetails } from './catalog.functions';
import { getCustomerOrders, getNotifications } from './customer.functions';
export const catalogQuery = queryOptions({ queryKey: ['catalog'], queryFn: () => getCatalog(), staleTime: 60_000, revalidateIfStale: true });
export const storeDetailsQuery = (storeId: string) => queryOptions({ queryKey: ['store-details', storeId], queryFn: () => getStoreDetails({ data: { storeId } }), staleTime: 30_000, revalidateIfStale: true });
export const customerOrdersQuery = queryOptions({ queryKey: ['customer-orders'], queryFn: () => getCustomerOrders(), refetchInterval: 15_000 });
export const notificationsQuery = queryOptions({ queryKey: ['notifications'], queryFn: () => getNotifications(), refetchInterval: 20_000 });
export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
