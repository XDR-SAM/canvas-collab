import { useCanvasStore } from "@/stores/canvasStore";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ClipboardPaste, MousePointerClick, Grid3X3, Magnet,
  Eye, Maximize, SlidersHorizontal,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const CanvasContextMenu = ({ children }: Props) => {
  const {
    selectAll, showGrid, setShowGrid, snapToGrid, setSnapToGrid,
    zenMode, setZenMode, viewMode, setViewMode,
  } = useCanvasStore();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => navigator.clipboard.readText().catch(() => {})}>
          <ClipboardPaste className="mr-2 h-4 w-4" /> Paste
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={selectAll}>
          <MousePointerClick className="mr-2 h-4 w-4" /> Select All
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+A</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => setShowGrid(!showGrid)}>
          <Grid3X3 className="mr-2 h-4 w-4" />
          Toggle grid {showGrid && "✓"}
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+'</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setSnapToGrid(!snapToGrid)}>
          <Magnet className="mr-2 h-4 w-4" />
          Snap to objects {snapToGrid && "✓"}
          <span className="ml-auto text-xs text-muted-foreground">Alt+S</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => setZenMode(!zenMode)}>
          <Maximize className="mr-2 h-4 w-4" />
          Zen mode {zenMode && "✓"}
          <span className="ml-auto text-xs text-muted-foreground">Alt+Z</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setViewMode(!viewMode)}>
          <Eye className="mr-2 h-4 w-4" />
          View mode {viewMode && "✓"}
          <span className="ml-auto text-xs text-muted-foreground">Alt+R</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent("open-properties"))}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Canvas & Shape properties
          <span className="ml-auto text-xs text-muted-foreground">Alt+/</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default CanvasContextMenu;
