import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCanvasStore } from "@/stores/canvasStore";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import Toolbar from "@/components/canvas/Toolbar";
import PropertiesPanel from "@/components/canvas/PropertiesPanel";
import LiveCursors from "@/components/canvas/LiveCursors";
import CanvasNavbar from "@/components/CanvasNavbar";
import ShareDialog from "@/components/canvas/ShareDialog";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import { toast } from "sonner";

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { elements, setElements, pushHistory, panOffset, zoom } = useCanvasStore();
  const hasLoaded = useRef(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

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

  // Save on Ctrl+S, ? for shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveMutation.mutate();
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        setShortcutsOpen(true);
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
      <AnnouncementBanner />
      <CanvasNavbar
        boardName={board?.name || "Board"}
        showBack
        onBack={() => navigate("/dashboard")}
        onSave={() => saveMutation.mutate()}
        savePending={saveMutation.isPending}
        onShare={() => setShareOpen(true)}
      />
      <Toolbar />
      <PropertiesPanel />
      <CanvasRenderer />
      <LiveCursors boardId={id!} panOffset={panOffset} zoom={zoom} />
      <ShareDialog boardId={id!} open={shareOpen} onOpenChange={setShareOpen} />
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
};

export default Board;
