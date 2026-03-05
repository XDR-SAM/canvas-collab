import { useCanvasStore } from "@/stores/canvasStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown,
} from "lucide-react";
import { useState, useEffect } from "react";

const STROKE_COLORS = [
  "#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#000000",
];
const BG_COLORS = [
  "transparent", "#a5d8ff", "#b2f2bb", "#ffec99", "#ffc9c9", "#eee",
];

const PropertiesPanel = () => {
  const {
    selectedIds, elements, tool,
    strokeColor, setStrokeColor,
    fillColor, setFillColor,
    strokeWidth, setStrokeWidth,
    opacity, setOpacity,
    removeElements, duplicateElements, bringToFront, sendToBack,
    updateElement,
  } = useCanvasStore();

  const [visible, setVisible] = useState(false);
  const selectedArr = Array.from(selectedIds);
  const hasSelection = selectedArr.length > 0;
  const selectedElement = hasSelection ? elements.find((e) => e.id === selectedArr[0]) : null;

  // Show panel when drawing tool is active or element selected
  const drawingTools = ["rectangle", "circle", "diamond", "arrow", "line", "pencil", "text"];
  const showForTool = drawingTools.includes(tool);

  useEffect(() => {
    if (hasSelection || showForTool) setVisible(true);
    else setVisible(false);
  }, [hasSelection, showForTool]);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("open-properties", handler);
    return () => window.removeEventListener("open-properties", handler);
  }, []);

  if (!visible) return null;

  const currentStroke = selectedElement?.strokeColor ?? strokeColor;
  const currentFill = selectedElement?.fillColor ?? fillColor;
  const currentWidth = selectedElement?.strokeWidth ?? strokeWidth;
  const currentOpacity = selectedElement?.opacity ?? opacity;

  return (
    <div className="absolute left-3 top-16 z-20 w-48 rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-lg space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Stroke colors */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Stroke</Label>
        <div className="flex gap-1.5 flex-wrap">
          {STROKE_COLORS.map((c) => (
            <button
              key={c}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${currentStroke === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border hover:scale-105"}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                setStrokeColor(c);
                if (selectedElement) updateElement(selectedElement.id, { strokeColor: c });
              }}
            />
          ))}
          <label className="w-7 h-7 rounded-lg border-2 border-border overflow-hidden cursor-pointer hover:scale-105 transition-all relative">
            <input
              type="color"
              value={currentStroke}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                if (selectedElement) updateElement(selectedElement.id, { strokeColor: e.target.value });
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-full h-full" style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }} />
          </label>
        </div>
      </div>

      {/* Background colors */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Background</Label>
        <div className="flex gap-1.5 flex-wrap">
          {BG_COLORS.map((c) => (
            <button
              key={c}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${currentFill === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border hover:scale-105"}`}
              style={{
                backgroundColor: c === "transparent" ? undefined : c,
                backgroundImage: c === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)" : undefined,
                backgroundSize: c === "transparent" ? "8px 8px" : undefined,
                backgroundPosition: c === "transparent" ? "0 0, 4px 4px" : undefined,
              }}
              onClick={() => {
                setFillColor(c);
                if (selectedElement) updateElement(selectedElement.id, { fillColor: c });
              }}
            />
          ))}
          <label className="w-7 h-7 rounded-lg border-2 border-border overflow-hidden cursor-pointer hover:scale-105 transition-all relative">
            <input
              type="color"
              value={currentFill === "transparent" ? "#ffffff" : currentFill}
              onChange={(e) => {
                setFillColor(e.target.value);
                if (selectedElement) updateElement(selectedElement.id, { fillColor: e.target.value });
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-full h-full" style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }} />
          </label>
        </div>
      </div>

      {/* Stroke width */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Stroke width</Label>
        <div className="flex gap-1.5">
          {[1, 2, 4].map((w) => (
            <button
              key={w}
              className={`flex-1 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${currentWidth === w ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              onClick={() => {
                setStrokeWidth(w);
                if (selectedElement) updateElement(selectedElement.id, { strokeWidth: w });
              }}
            >
              <div className="rounded-full bg-foreground" style={{ width: `${w * 8 + 8}px`, height: `${w}px` }} />
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-medium text-muted-foreground">Opacity</Label>
          <span className="text-[10px] text-muted-foreground">{Math.round(currentOpacity * 100)}</span>
        </div>
        <Slider
          value={[currentOpacity * 100]}
          onValueChange={([v]) => {
            const val = v / 100;
            setOpacity(val);
            if (selectedElement) updateElement(selectedElement.id, { opacity: val });
          }}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Layers */}
      {hasSelection && (
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-muted-foreground">Layers</Label>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => sendToBack(selectedArr)}>
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Send to back</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => sendToBack(selectedArr)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Send backward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => bringToFront(selectedArr)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Bring forward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => bringToFront(selectedArr)}>
                  <ArrowUpToLine className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Bring to front</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
