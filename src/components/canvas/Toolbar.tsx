import { useCanvasStore, Tool } from "@/stores/canvasStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  MousePointer2, Hand, Square, Circle, Diamond, ArrowUpRight,
  Minus, Pencil, Type, Eraser, Undo2, Redo2, Grid3X3, Magnet, ZoomIn, ZoomOut,
} from "lucide-react";

const tools: { tool: Tool; icon: any; label: string; shortcut: string }[] = [
  { tool: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { tool: "pan", icon: Hand, label: "Pan", shortcut: "H" },
  { tool: "rectangle", icon: Square, label: "Rectangle", shortcut: "R" },
  { tool: "circle", icon: Circle, label: "Circle", shortcut: "O" },
  { tool: "diamond", icon: Diamond, label: "Diamond", shortcut: "D" },
  { tool: "arrow", icon: ArrowUpRight, label: "Arrow", shortcut: "A" },
  { tool: "line", icon: Minus, label: "Line", shortcut: "L" },
  { tool: "pencil", icon: Pencil, label: "Pencil", shortcut: "P" },
  { tool: "text", icon: Type, label: "Text", shortcut: "T" },
  { tool: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
];

const Toolbar = () => {
  const { tool, setTool, undo, redo, showGrid, setShowGrid, snapToGrid, setSnapToGrid, zoom, setZoom, historyIndex, history } = useCanvasStore();

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-xl border bg-background/95 backdrop-blur-sm p-1.5 shadow-lg">
      {tools.map((t) => (
        <Tooltip key={t.tool}>
          <TooltipTrigger asChild>
            <Button
              variant={tool === t.tool ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setTool(t.tool)}
            >
              <t.icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t.label} ({t.shortcut})
          </TooltipContent>
        </Tooltip>
      ))}

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIndex <= 0}>
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Redo (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={showGrid ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setShowGrid(!showGrid)}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Toggle Grid</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={snapToGrid ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setSnapToGrid(!snapToGrid)}>
            <Magnet className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Snap to Grid</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(zoom - 0.1)}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-xs w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(zoom + 0.1)}>
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Toolbar;
