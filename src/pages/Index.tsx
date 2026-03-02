import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCanvasStore } from "@/stores/canvasStore";
import { supabase } from "@/integrations/supabase/client";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import Toolbar from "@/components/canvas/Toolbar";
import PropertiesPanel from "@/components/canvas/PropertiesPanel";
import ExportImportButtons from "@/components/canvas/ExportImport";
import CanvasNavbar from "@/components/CanvasNavbar";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { elements } = useCanvasStore();

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
    // Create a new board and save current canvas
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

  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      <CanvasNavbar onSaveToCloud={handleSaveToCloud} boardName="Scratch Pad" />
      <Toolbar />
      <PropertiesPanel />
      <CanvasRenderer />
    </div>
  );
};

export default Index;
