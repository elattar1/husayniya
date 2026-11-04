import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dashboard.functions', () => ({
  getDashboard: vi.fn(), getDashboardProducts: vi.fn(), getDashboardOrderItems: vi.fn(),
}));
vi.mock('@/lib/catalog.functions', () => ({ getCatalog: vi.fn(), getStoreDetails: vi.fn() }));
vi.mock('@/lib/customer.functions', () => ({ getCustomerOrders: vi.fn(), getNotifications: vi.fn() }));

import { dashboardQuery, dashboardProductsQuery } from '@/components/dashboard/queries';
import { catalogQuery, storeDetailsQuery } from '@/lib/customer-queries';
import { getDashboard, getDashboardProducts } from '@/lib/dashboard.functions';
import { getCatalog, getStoreDetails } from '@/lib/catalog.functions';

describe('lightweight navigation queries', () => {
  it('returns cached dashboard immediately while a stale refresh is pending', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const cached = { stores: [], categories: [], areas: [], orders: [], bookings: [], services: [] };
    client.setQueryData(dashboardQuery(false).queryKey, cached, { updatedAt: Date.now() - 20_000 });
    let finish: ((value: typeof cached) => void) | undefined;
    vi.mocked(getDashboard).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const returned = await client.ensureQueryData({ ...dashboardQuery(false), revalidateIfStale: true });
    expect(returned).toEqual(cached);
    expect(client.isFetching({ queryKey: dashboardQuery(false).queryKey })).toBe(1);
    finish?.({ ...cached, areas: [] });
    await client.fetchQuery(dashboardQuery(false));
    client.clear();
  });

  it('loads dashboard summaries without fetching products', async () => {
    vi.clearAllMocks();
    vi.mocked(getDashboard).mockResolvedValueOnce({ stores: [], categories: [], areas: [], orders: [], bookings: [], services: [] });
    const client = new QueryClient();
    await client.ensureQueryData(dashboardQuery(false));
    expect(getDashboardProducts).not.toHaveBeenCalled();
    expect(dashboardProductsQuery('store-a').queryKey).not.toEqual(dashboardProductsQuery('store-b').queryKey);
    client.clear();
  });

  it('loads catalog lists without fetching store products and isolates each store cache', async () => {
    vi.clearAllMocks();
    vi.mocked(getCatalog).mockResolvedValueOnce({ stores: [], categories: [], areas: [] });
    const client = new QueryClient();
    await client.ensureQueryData(catalogQuery);
    expect(getStoreDetails).not.toHaveBeenCalled();
    expect(storeDetailsQuery('store-a').queryKey).not.toEqual(storeDetailsQuery('store-b').queryKey);
    client.clear();
  });
});