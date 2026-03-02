import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCanvasStore } from "@/stores/canvasStore";
import { supabase } from "@/integrations/supabase/client";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import Toolbar from "@/components/canvas/Toolbar";
import PropertiesPanel from "@/components/canvas/PropertiesPanel";
import CanvasNavbar from "@/components/CanvasNavbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import { toast } from "sonner";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { elements } = useCanvasStore();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleSaveToCloud = async () => {
    if (!user) {
      toast("Sign in to save your work to the cloud", {
        action: {
          label: "Sign In",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }
    const { data, error } = await supabase
      .from("boards")
      .insert({ name: "Untitled Board", owner_id: user.id, canvas_data: elements as any })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved! Redirecting to your board...");
    navigate(`/board/${data.id}`);
  };

  // ? key for shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      <AnnouncementBanner />
      <CanvasNavbar onSaveToCloud={handleSaveToCloud} boardName="Scratch Pad" />
      <Toolbar />
      <PropertiesPanel />
      <CanvasRenderer />
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
};

export default Index;
