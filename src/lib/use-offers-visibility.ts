import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getOffersVisibility, toggleOffersVisibility as toggleFn } from "./offers.functions";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = "al_husayniya_offers_visible";

function getInitialLocalState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored !== null ? stored === "true" : true;
}

export function useOffersVisibility() {
  const queryClient = useQueryClient();
  const toggleServer = useServerFn(toggleFn);

  const { data, isLoading } = useQuery({
    queryKey: ["offers-visibility"],
    queryFn: async () => {
      try {
        const res = await getOffersVisibility();
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, String(res.visible));
        }
        return res.visible;
      } catch (e) {
        return getInitialLocalState();
      }
    },
    initialData: getInitialLocalState,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (nextVisible: boolean) => {
      // Optimistic client update
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, String(nextVisible));
      }
      queryClient.setQueryData(["offers-visibility"], nextVisible);
      return await toggleServer({ data: { visible: nextVisible } });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["offers-visibility"], result.visible);
      queryClient.invalidateQueries({ queryKey: ["offers-visibility"] });
      if (result.visible) {
        toast.success("تم إظهار تابة وقسم العروض لجميع المستخدمين والعملاء بنجاح 🎉");
      } else {
        toast.info("تم إخفاء تابة العروض من شريط التنقل والصفحة الرئيسية بنجاح 🔒");
      }
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ["offers-visibility"] });
      toast.error(error instanceof Error ? error.message : "فشل تغيير حالة تابة العروض");
    },
  });

  return {
    isVisible: Boolean(data),
    isLoading: isLoading || mutation.isPending,
    toggle: (nextVisible: boolean) => mutation.mutateAsync(nextVisible),
  };
}
