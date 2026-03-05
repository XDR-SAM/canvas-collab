import { useCanvasStore } from "@/stores/canvasStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, Undo2, Redo2, HelpCircle } from "lucide-react";

interface Props {
  onOpenShortcuts?: () => void;
}

const BottomControls = ({ onOpenShortcuts }: Props) => {
  const { zoom, setZoom, undo, redo, historyIndex, history } = useCanvasStore();

  return (
    <>
      {/* Bottom-left: zoom + undo/redo */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-xl border bg-background/95 backdrop-blur-sm p-1 shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIndex <= 0}>
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <div className="mx-0.5 h-5 w-px bg-border" />

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom - 0.1)}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <button
          className="px-1.5 text-xs font-mono text-foreground min-w-[40px] text-center hover:bg-accent rounded transition-colors"
          onClick={() => setZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom + 0.1)}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Bottom-right: help */}
      {onOpenShortcuts && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-3 right-3 z-20 h-8 w-8 rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg"
              onClick={onOpenShortcuts}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Shortcuts & help (?)</TooltipContent>
        </Tooltip>
      )}
    </>
  );
};

export default BottomControls;
