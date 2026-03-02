import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCanvasStore } from "@/stores/canvasStore";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import Toolbar from "@/components/canvas/Toolbar";
import PropertiesPanel from "@/components/canvas/PropertiesPanel";
import ExportImportButtons from "@/components/canvas/ExportImport";
import LiveCursors from "@/components/canvas/LiveCursors";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { elements, setElements, pushHistory, panOffset, zoom } = useCanvasStore();
  const hasLoaded = useRef(false);

  const { data: board, isLoading } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Load canvas data on mount
  useEffect(() => {
    if (board?.canvas_data && !hasLoaded.current) {
      const parsed = Array.isArray(board.canvas_data) ? board.canvas_data : [];
      setElements(parsed as any);
      pushHistory();
      hasLoaded.current = true;
    }
  }, [board, setElements, pushHistory]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("boards")
        .update({ canvas_data: elements as any })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Board saved!"),
    onError: (e: any) => toast.error(e.message),
  });

  // Auto-save every 30s
  useEffect(() => {
    if (!id || !hasLoaded.current) return;
    const interval = setInterval(() => {
      if (elements.length > 0) saveMutation.mutate();
    }, 30000);
    return () => clearInterval(interval);
  }, [id, elements]);

  // Save on Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveMutation.mutate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveMutation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      {/* Back + board name + save */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border">
          {board?.name || "Board"}
        </span>
        <Button variant="outline" size="sm" className="h-8" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="mr-1 h-3.5 w-3.5" />
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
        <ExportImportButtons boardName={board?.name || "board"} />
      </div>

      <Toolbar />
      <PropertiesPanel />
      <CanvasRenderer />
      <LiveCursors boardId={id!} panOffset={panOffset} zoom={zoom} />
    </div>
  );
};

export default Board;
