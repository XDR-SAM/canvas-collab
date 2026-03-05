import { useCanvasStore, Tool } from "@/stores/canvasStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MousePointer2, Hand, Square, Circle, Diamond, ArrowUpRight,
  Minus, Pencil, Type, Eraser, Lock, Unlock,
} from "lucide-react";

const tools: { tool: Tool; icon: any; label: string; shortcut: string }[] = [
  { tool: "pan", icon: Hand, label: "Hand (panning)", shortcut: "H" },
  { tool: "select", icon: MousePointer2, label: "Selection", shortcut: "V / 1" },
  { tool: "rectangle", icon: Square, label: "Rectangle", shortcut: "R / 2" },
  { tool: "diamond", icon: Diamond, label: "Diamond", shortcut: "D / 3" },
  { tool: "circle", icon: Circle, label: "Ellipse", shortcut: "O / 4" },
  { tool: "arrow", icon: ArrowUpRight, label: "Arrow", shortcut: "A / 5" },
  { tool: "line", icon: Minus, label: "Line", shortcut: "L / 6" },
  { tool: "pencil", icon: Pencil, label: "Draw", shortcut: "P / 7" },
  { tool: "text", icon: Type, label: "Text", shortcut: "T / 8" },
  { tool: "eraser", icon: Eraser, label: "Eraser", shortcut: "E / 0" },
];

const Toolbar = () => {
  const { tool, setTool, lockTool, setLockTool } = useCanvasStore();

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 rounded-xl border bg-background/95 backdrop-blur-sm p-1 shadow-lg">
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
            {t.label} <kbd className="ml-1 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">{t.shortcut}</kbd>
          </TooltipContent>
        </Tooltip>
      ))}

      <div className="mx-0.5 h-5 w-px bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={lockTool ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLockTool(!lockTool)}
          >
            {lockTool ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Keep tool active <kbd className="ml-1 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">Q</kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Toolbar;
