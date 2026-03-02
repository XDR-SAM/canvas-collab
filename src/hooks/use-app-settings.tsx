import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAppSettings() {
  const { data: settings } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*");
      const map: Record<string, any> = {};
      data?.forEach((s) => (map[s.key] = s.value));
      return map;
    },
    staleTime: 60_000,
  });

  return {
    appName: (settings?.app_name as string) || "DrawBoard",
    logoUrl: (settings?.logo_url as string) || "",
    maintenanceMode: (settings?.maintenance_mode as boolean) || false,
    announcementBanner: (settings?.announcement_banner as string) || "",
    featureFlags: (settings?.feature_flags as Record<string, boolean>) || {},
  };
}
