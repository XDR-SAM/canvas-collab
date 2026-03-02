import { useAppSettings } from "@/hooks/use-app-settings";
import { X } from "lucide-react";
import { useState } from "react";

const AnnouncementBanner = () => {
  const { announcementBanner } = useAppSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!announcementBanner || dismissed) return null;

  return (
    <div className="relative z-50 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground">
      <span>{announcementBanner}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 rounded p-0.5 hover:bg-primary-foreground/20"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
