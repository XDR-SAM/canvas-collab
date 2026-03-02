import { useCanvasStore, CanvasElement } from "@/stores/canvasStore";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import rough from "roughjs";
import getStroke from "perfect-freehand";

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
}

function getStrokeDash(style: string): number[] {
  if (style === "dashed") return [12, 8];
  if (style === "dotted") return [2, 6];
  return [];
}

function getBounds(elements: CanvasElement[]) {
  if (!elements.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  elements.forEach((el) => {
    if (el.type === "pencil" && el.points) {
      el.points.forEach(([px, py]) => {
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      });
    } else {
      const x1 = Math.min(el.x, el.x + el.width);
      const x2 = Math.max(el.x, el.x + el.width);
      const y1 = Math.min(el.y, el.y + el.height);
      const y2 = Math.max(el.y, el.y + el.height);
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    }
  });
  return { minX: minX - 20, minY: minY - 20, maxX: maxX + 20, maxY: maxY + 20 };
}

function drawElementToCanvas(ctx: CanvasRenderingContext2D, rc: any, el: CanvasElement) {
  ctx.save();
  ctx.globalAlpha = el.opacity;
  const dash = getStrokeDash(el.strokeStyle);

  if (el.type === "pencil" && el.points) {
    const outlinePoints = getStroke(el.points, { size: el.strokeWidth * 2, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
    const pathData = getSvgPathFromStroke(outlinePoints);
    const path = new Path2D(pathData);
    ctx.fillStyle = el.strokeColor;
    ctx.fill(path);
    ctx.restore();
    return;
  }

  if (el.type === "text") {
    ctx.font = `${el.fontSize || 20}px ${el.fontFamily || "sans-serif"}`;
    ctx.fillStyle = el.strokeColor;
    ctx.textBaseline = "top";
    (el.text || "").split("\n").forEach((line, i) => ctx.fillText(line, el.x, el.y + i * (el.fontSize || 20) * 1.2));
    ctx.restore();
    return;
  }

  const options: any = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    fill: el.fillColor === "transparent" ? undefined : el.fillColor,
    fillStyle: "solid",
    roughness: el.roughness,
    seed: el.seed,
    strokeLineDash: dash.length ? dash : undefined,
  };

  switch (el.type) {
    case "rectangle": rc.rectangle(el.x, el.y, el.width, el.height, options); break;
    case "circle": rc.ellipse(el.x + el.width / 2, el.y + el.height / 2, Math.abs(el.width), Math.abs(el.height), options); break;
    case "diamond": {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
      rc.polygon([[cx, el.y], [el.x + el.width, cy], [cx, el.y + el.height], [el.x, cy]], options);
      break;
    }
    case "line": rc.line(el.x, el.y, el.x + el.width, el.y + el.height, options); break;
    case "arrow": {
      const x2 = el.x + el.width, y2 = el.y + el.height;
      rc.line(el.x, el.y, x2, y2, options);
      const angle = Math.atan2(el.height, el.width);
      rc.line(x2, y2, x2 - 15 * Math.cos(angle - Math.PI / 6), y2 - 15 * Math.sin(angle - Math.PI / 6), options);
      rc.line(x2, y2, x2 - 15 * Math.cos(angle + Math.PI / 6), y2 - 15 * Math.sin(angle + Math.PI / 6), options);
      break;
    }
  }
  ctx.restore();
}

export function exportToPNG(elements: CanvasElement[], filename: string) {
  const { minX, minY, maxX, maxY } = getBounds(elements);
  const w = maxX - minX, h = maxY - minY;
  const canvas = document.createElement("canvas");
  canvas.width = w * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.translate(-minX, -minY);
  const rc = rough.canvas(canvas);
  elements.forEach((el) => drawElementToCanvas(ctx, rc, el));
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  toast.success("Exported as PNG!");
}

export function exportToSVG(elements: CanvasElement[], filename: string) {
  const { minX, minY, maxX, maxY } = getBounds(elements);
  const w = maxX - minX, h = maxY - minY;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(h));
  svg.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const rc = rough.svg(svg);
  elements.forEach((el) => {
    if (el.type === "text") {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(el.x));
      text.setAttribute("y", String(el.y + (el.fontSize || 20)));
      text.setAttribute("fill", el.strokeColor);
      text.setAttribute("font-size", String(el.fontSize || 20));
      text.setAttribute("font-family", el.fontFamily || "sans-serif");
      text.setAttribute("opacity", String(el.opacity));
      text.textContent = el.text || "";
      svg.appendChild(text);
      return;
    }
    if (el.type === "pencil" && el.points) {
      const outlinePoints = getStroke(el.points, { size: el.strokeWidth * 2, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
      const pathData = getSvgPathFromStroke(outlinePoints);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", el.strokeColor);
      path.setAttribute("opacity", String(el.opacity));
      svg.appendChild(path);
      return;
    }
    const options: any = {
      stroke: el.strokeColor, strokeWidth: el.strokeWidth, roughness: el.roughness, seed: el.seed,
      fill: el.fillColor === "transparent" ? undefined : el.fillColor, fillStyle: "solid",
    };
    let node: SVGElement | null = null;
    switch (el.type) {
      case "rectangle": node = rc.rectangle(el.x, el.y, el.width, el.height, options) as unknown as SVGElement; break;
      case "circle": node = rc.ellipse(el.x + el.width / 2, el.y + el.height / 2, Math.abs(el.width), Math.abs(el.height), options) as unknown as SVGElement; break;
      case "diamond": {
        const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
        node = rc.polygon([[cx, el.y], [el.x + el.width, cy], [cx, el.y + el.height], [el.x, cy]], options) as unknown as SVGElement;
        break;
      }
      case "line": node = rc.line(el.x, el.y, el.x + el.width, el.y + el.height, options) as unknown as SVGElement; break;
      case "arrow": {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const x2 = el.x + el.width, y2 = el.y + el.height;
        g.appendChild(rc.line(el.x, el.y, x2, y2, options) as unknown as SVGElement);
        const angle = Math.atan2(el.height, el.width);
        g.appendChild(rc.line(x2, y2, x2 - 15 * Math.cos(angle - Math.PI / 6), y2 - 15 * Math.sin(angle - Math.PI / 6), options) as unknown as SVGElement);
        g.appendChild(rc.line(x2, y2, x2 - 15 * Math.cos(angle + Math.PI / 6), y2 - 15 * Math.sin(angle + Math.PI / 6), options) as unknown as SVGElement);
        node = g;
        break;
      }
    }
    if (node) {
      node.setAttribute("opacity", String(el.opacity));
      svg.appendChild(node);
    }
  });

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const link = document.createElement("a");
  link.download = `${filename}.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  toast.success("Exported as SVG!");
}

export function exportToJSON(elements: CanvasElement[], filename: string) {
  const json = JSON.stringify(elements, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.download = `${filename}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  toast.success("Exported as JSON!");
}

export function importFromJSON(file: File, setElements: (els: CanvasElement[]) => void, pushHistory: () => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string);
      if (Array.isArray(parsed)) {
        setElements(parsed);
        pushHistory();
        toast.success(`Imported ${parsed.length} elements!`);
      } else {
        toast.error("Invalid JSON format");
      }
    } catch {
      toast.error("Failed to parse JSON file");
    }
  };
  reader.readAsText(file);
}

const ExportImportButtons = ({ boardName }: { boardName: string }) => {
  const { elements, setElements, pushHistory } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportToPNG(elements, boardName)}>Export as PNG</DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToSVG(elements, boardName)}>Export as SVG</DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToJSON(elements, boardName)}>Export as JSON</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" className="h-8" onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-1 h-3.5 w-3.5" /> Import
      </Button>
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
    </>
  );
};

export default ExportImportButtons;
