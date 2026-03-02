import { useCanvasStore } from "@/stores/canvasStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, ArrowUpToLine, ArrowDownToLine } from "lucide-react";

const PropertiesPanel = () => {
  const {
    selectedIds, elements,
    strokeColor, setStrokeColor,
    fillColor, setFillColor,
    strokeWidth, setStrokeWidth,
    strokeStyle, setStrokeStyle,
    opacity, setOpacity,
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    roughness, setRoughness,
    removeElements, duplicateElements, bringToFront, sendToBack,
    updateElement,
  } = useCanvasStore();

  const selectedArr = Array.from(selectedIds);
  const hasSelection = selectedArr.length > 0;
  const selectedElement = hasSelection ? elements.find((e) => e.id === selectedArr[0]) : null;

  return (
    <div className="absolute right-3 top-16 z-20 w-56 rounded-xl border bg-background/95 backdrop-blur-sm p-4 shadow-lg space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h3 className="text-sm font-semibold">Properties</h3>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Stroke</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={selectedElement?.strokeColor ?? strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                if (selectedElement) updateElement(selectedElement.id, { strokeColor: e.target.value });
              }}
              className="h-8 w-8 rounded border cursor-pointer"
            />
            <Input
              value={selectedElement?.strokeColor ?? strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                if (selectedElement) updateElement(selectedElement.id, { strokeColor: e.target.value });
              }}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Fill</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={selectedElement?.fillColor === "transparent" ? "#ffffff" : (selectedElement?.fillColor ?? fillColor === "transparent" ? "#ffffff" : fillColor)}
              onChange={(e) => {
                setFillColor(e.target.value);
                if (selectedElement) updateElement(selectedElement.id, { fillColor: e.target.value });
              }}
              className="h-8 w-8 rounded border cursor-pointer"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setFillColor("transparent");
                if (selectedElement) updateElement(selectedElement.id, { fillColor: "transparent" });
              }}
            >
              None
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Stroke Width</Label>
          <div className="flex gap-2">
            {[1, 2, 4].map((w) => (
              <Button
                key={w}
                variant={(selectedElement?.strokeWidth ?? strokeWidth) === w ? "default" : "outline"}
                size="sm"
                className="h-8 flex-1 text-xs"
                onClick={() => {
                  setStrokeWidth(w);
                  if (selectedElement) updateElement(selectedElement.id, { strokeWidth: w });
                }}
              >
                {w === 1 ? "Thin" : w === 2 ? "Med" : "Thick"}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Stroke Style</Label>
          <Select
            value={selectedElement?.strokeStyle ?? strokeStyle}
            onValueChange={(v: any) => {
              setStrokeStyle(v);
              if (selectedElement) updateElement(selectedElement.id, { strokeStyle: v });
            }}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Opacity: {Math.round((selectedElement?.opacity ?? opacity) * 100)}%</Label>
          <Slider
            value={[selectedElement?.opacity ?? opacity]}
            onValueChange={([v]) => {
              setOpacity(v);
              if (selectedElement) updateElement(selectedElement.id, { opacity: v });
            }}
            min={0.1}
            max={1}
            step={0.05}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Roughness: {(selectedElement?.roughness ?? roughness).toFixed(1)}</Label>
          <Slider
            value={[selectedElement?.roughness ?? roughness]}
            onValueChange={([v]) => {
              setRoughness(v);
              if (selectedElement) updateElement(selectedElement.id, { roughness: v });
            }}
            min={0}
            max={3}
            step={0.5}
          />
        </div>

        {selectedElement?.type === "text" && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Font Size</Label>
              <Input
                type="number"
                value={selectedElement.fontSize ?? fontSize}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFontSize(v);
                  updateElement(selectedElement.id, { fontSize: v });
                }}
                className="h-8 text-xs"
                min={8}
                max={128}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Font Family</Label>
              <Select
                value={selectedElement.fontFamily ?? fontFamily}
                onValueChange={(v) => {
                  setFontFamily(v);
                  updateElement(selectedElement.id, { fontFamily: v });
                }}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans-serif">Sans Serif</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {hasSelection && (
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs font-semibold">Actions</Label>
          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => duplicateElements(selectedArr)}>
              <Copy className="mr-1 h-3 w-3" /> Duplicate
            </Button>
            <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => removeElements(selectedArr)}>
              <Trash2 className="mr-1 h-3 w-3" /> Delete
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => bringToFront(selectedArr)}>
              <ArrowUpToLine className="mr-1 h-3 w-3" /> Front
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => sendToBack(selectedArr)}>
              <ArrowDownToLine className="mr-1 h-3 w-3" /> Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
