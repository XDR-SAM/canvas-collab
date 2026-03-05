import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCanvasStore } from "@/stores/canvasStore";
import { supabase } from "@/integrations/supabase/client";
import { importFromJSON } from "@/components/canvas/ExportImport";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import Toolbar from "@/components/canvas/Toolbar";
import PropertiesPanel from "@/components/canvas/PropertiesPanel";
import CanvasNavbar from "@/components/CanvasNavbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import HamburgerMenu from "@/components/canvas/HamburgerMenu";
import WelcomeScreen from "@/components/canvas/WelcomeScreen";
import BottomControls from "@/components/canvas/BottomControls";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { elements, setElements, pushHistory, zenMode } = useCanvasStore();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveToCloud = async () => {
    if (!user) {
      toast("Sign in to save your work to the cloud", {
        action: { label: "Sign In", onClick: () => navigate("/login") },
      });
      return;
    }
    const { data, error } = await supabase
      .from("boards")
      .insert({ name: "Untitled Board", owner_id: user.id, canvas_data: elements as any })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    toast.success("Saved! Redirecting to your board...");
    navigate(`/board/${data.id}`);
  };

  // Listen for custom events
  useEffect(() => {
    const onShortcuts = () => setShortcutsOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) setShortcutsOpen(true);
    };
    window.addEventListener("open-shortcuts", onShortcuts);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("open-shortcuts", onShortcuts);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const showWelcome = elements.length === 0;

  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      <AnnouncementBanner />

      {/* Top-left: hamburger menu */}
      {!zenMode && (
        <div className="absolute top-3 left-3 z-30">
          <HamburgerMenu boardName="Scratch Pad" onSaveToCloud={handleSaveToCloud} />
        </div>
      )}

      {/* Top-center: toolbar */}
      {!zenMode && <Toolbar />}

      {/* Top-right: navbar (simplified) */}
      {!zenMode && <CanvasNavbar onSaveToCloud={handleSaveToCloud} boardName="Scratch Pad" />}

      {/* Properties panel */}
      {!zenMode && <PropertiesPanel />}

      {/* Canvas */}
      <CanvasRenderer />

      {/* Welcome screen */}
      {showWelcome && !zenMode && (
        <WelcomeScreen
          onOpenFile={() => fileInputRef.current?.click()}
          onOpenHelp={() => setShortcutsOpen(true)}
        />
      )}

      {/* Bottom controls */}
      {!zenMode && (
        <BottomControls onOpenShortcuts={() => setShortcutsOpen(true)} />
      )}

      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importFromJSON(f, setElements, pushHistory);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default Index;
