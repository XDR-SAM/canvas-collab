import { useRef, useEffect, useCallback, useState } from "react";
import rough from "roughjs";
import getStroke from "perfect-freehand";
import { useCanvasStore, CanvasElement, Tool } from "@/stores/canvasStore";

const genId = () => crypto.randomUUID();

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

function drawElement(ctx: CanvasRenderingContext2D, rc: any, el: CanvasElement, zoom: number) {
  ctx.save();
  ctx.globalAlpha = el.opacity;
  const dash = getStrokeDash(el.strokeStyle);

  if (el.type === "pencil" && el.points) {
    const outlinePoints = getStroke(el.points, {
      size: el.strokeWidth * 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });
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
    const lines = (el.text || "").split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, el.x, el.y + i * (el.fontSize || 20) * 1.2);
    });
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
    case "rectangle":
      rc.rectangle(el.x, el.y, el.width, el.height, options);
      break;
    case "circle":
      rc.ellipse(
        el.x + el.width / 2,
        el.y + el.height / 2,
        Math.abs(el.width),
        Math.abs(el.height),
        options
      );
      break;
    case "diamond": {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const hw = el.width / 2;
      const hh = el.height / 2;
      rc.polygon(
        [[cx, el.y], [el.x + el.width, cy], [cx, el.y + el.height], [el.x, cy]],
        options
      );
      break;
    }
    case "line":
      rc.line(el.x, el.y, el.x + el.width, el.y + el.height, options);
      break;
    case "arrow": {
      const x2 = el.x + el.width;
      const y2 = el.y + el.height;
      rc.line(el.x, el.y, x2, y2, options);
      // arrowhead
      const angle = Math.atan2(el.height, el.width);
      const headLen = 15;
      rc.line(
        x2, y2,
        x2 - headLen * Math.cos(angle - Math.PI / 6),
        y2 - headLen * Math.sin(angle - Math.PI / 6),
        options
      );
      rc.line(
        x2, y2,
        x2 - headLen * Math.cos(angle + Math.PI / 6),
        y2 - headLen * Math.sin(angle + Math.PI / 6),
        options
      );
      break;
    }
  }
  ctx.restore();
}

function isPointInElement(x: number, y: number, el: CanvasElement): boolean {
  if (el.type === "pencil" && el.points) {
    return el.points.some(
      ([px, py]) => Math.hypot(px - x, py - y) < 10
    );
  }
  if (el.type === "text") {
    const w = (el.text?.length || 1) * ((el.fontSize || 20) * 0.6);
    const h = (el.fontSize || 20) * 1.4;
    return x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h;
  }
  if (el.type === "line" || el.type === "arrow") {
    const x2 = el.x + el.width;
    const y2 = el.y + el.height;
    const dist =
      Math.abs((y2 - el.y) * x - (x2 - el.x) * y + x2 * el.y - y2 * el.x) /
      Math.hypot(el.width, el.height);
    return dist < 10;
  }
  const minX = Math.min(el.x, el.x + el.width);
  const maxX = Math.max(el.x, el.x + el.width);
  const minY = Math.min(el.y, el.y + el.height);
  const maxY = Math.max(el.y, el.y + el.height);
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

const CanvasRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    elements, tool, selectedIds, panOffset, zoom, showGrid, gridSize, snapToGrid,
    strokeColor, fillColor, strokeWidth, strokeStyle, opacity, roughness, fontSize, fontFamily,
    setSelectedIds, addElement, updateElement, removeElements, setPanOffset, setZoom,
    pushHistory, setTool,
  } = useCanvasStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingElement, setDrawingElement] = useState<CanvasElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const toCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left - panOffset.x) / zoom,
        y: (clientY - rect.top - panOffset.y) / zoom,
      };
    },
    [panOffset, zoom]
  );

  const snap = useCallback(
    (v: number) => (snapToGrid ? Math.round(v / gridSize) * gridSize : v),
    [snapToGrid, gridSize]
  );

  // Render
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "hsl(var(--border))";
      ctx.lineWidth = 0.5;
      const startX = Math.floor(-panOffset.x / zoom / gridSize) * gridSize;
      const startY = Math.floor(-panOffset.y / zoom / gridSize) * gridSize;
      const endX = startX + canvas.clientWidth / zoom + gridSize;
      const endY = startY + canvas.clientHeight / zoom + gridSize;
      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    const rc = rough.canvas(canvas);

    // Draw elements
    elements.forEach((el) => drawElement(ctx, rc, el, zoom));

    // Draw in-progress element
    if (drawingElement) drawElement(ctx, rc, drawingElement, zoom);

    // Selection highlight
    selectedIds.forEach((id) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;
      ctx.strokeStyle = "hsl(217, 91%, 60%)";
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      if (el.type === "pencil" && el.points?.length) {
        const xs = el.points.map((p) => p[0]);
        const ys = el.points.map((p) => p[1]);
        const padding = 5;
        ctx.strokeRect(
          Math.min(...xs) - padding,
          Math.min(...ys) - padding,
          Math.max(...xs) - Math.min(...xs) + padding * 2,
          Math.max(...ys) - Math.min(...ys) + padding * 2
        );
      } else {
        const padding = 5;
        ctx.strokeRect(
          Math.min(el.x, el.x + el.width) - padding,
          Math.min(el.y, el.y + el.height) - padding,
          Math.abs(el.width) + padding * 2,
          Math.abs(el.height) + padding * 2
        );
      }
      ctx.setLineDash([]);
    });

    ctx.restore();
  }, [elements, drawingElement, panOffset, zoom, showGrid, gridSize, selectedIds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (editingTextId) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") { e.preventDefault(); useCanvasStore.getState().undo(); }
        if (e.key === "y") { e.preventDefault(); useCanvasStore.getState().redo(); }
        if (e.key === "d") { e.preventDefault(); const ids = Array.from(selectedIds); if (ids.length) useCanvasStore.getState().duplicateElements(ids); }
        return;
      }

      const keyMap: Record<string, Tool> = {
        v: "select", h: "pan", r: "rectangle", o: "circle", d: "diamond",
        a: "arrow", l: "line", p: "pencil", t: "text", e: "eraser",
      };
      if (keyMap[e.key.toLowerCase()]) setTool(keyMap[e.key.toLowerCase()]);
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0) {
        removeElements(Array.from(selectedIds));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIds, editingTextId, setTool, removeElements]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const { x, y } = toCanvas(e.clientX, e.clientY);

      if (tool === "pan" || (e.button === 1)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        return;
      }

      if (tool === "eraser") {
        const hit = [...elements].reverse().find((el) => isPointInElement(x, y, el));
        if (hit) removeElements([hit.id]);
        return;
      }

      if (tool === "select") {
        const hit = [...elements].reverse().find((el) => isPointInElement(x, y, el));
        if (hit) {
          if (e.shiftKey) {
            const newSet = new Set(selectedIds);
            if (newSet.has(hit.id)) newSet.delete(hit.id);
            else newSet.add(hit.id);
            setSelectedIds(newSet);
          } else {
            if (!selectedIds.has(hit.id)) setSelectedIds(new Set([hit.id]));
          }
          setDragStart({ x, y });
          setDragOffset({ x: 0, y: 0 });
        } else {
          setSelectedIds(new Set());
        }
        return;
      }

      if (tool === "text") {
        const newEl: CanvasElement = {
          id: genId(),
          type: "text",
          x: snap(x), y: snap(y),
          width: 0, height: 0,
          text: "",
          strokeColor, fillColor, strokeWidth, strokeStyle, opacity, fontSize, fontFamily,
          roughness: 0, seed: Math.floor(Math.random() * 2 ** 31),
        };
        addElement(newEl);
        setEditingTextId(newEl.id);
        setSelectedIds(new Set([newEl.id]));
        setTimeout(() => textInputRef.current?.focus(), 50);
        return;
      }

      setIsDrawing(true);
      const seed = Math.floor(Math.random() * 2 ** 31);
      const newEl: CanvasElement = {
        id: genId(),
        type: tool === "pencil" ? "pencil" : tool as any,
        x: snap(x), y: snap(y),
        width: 0, height: 0,
        points: tool === "pencil" ? [[x, y]] : undefined,
        strokeColor, fillColor, strokeWidth, strokeStyle, opacity, roughness, seed,
        fontSize, fontFamily,
      };
      setDrawingElement(newEl);
    },
    [tool, toCanvas, elements, selectedIds, panOffset, snap, strokeColor, fillColor, strokeWidth, strokeStyle, opacity, roughness, fontSize, fontFamily, addElement, removeElements, setSelectedIds, setPanOffset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }

      if (dragStart && selectedIds.size > 0) {
        const { x, y } = toCanvas(e.clientX, e.clientY);
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;
        selectedIds.forEach((id) => {
          const el = elements.find((e) => e.id === id);
          if (el) {
            updateElement(id, {
              x: el.x + dx - (dragOffset?.x || 0),
              y: el.y + dy - (dragOffset?.y || 0),
              points: el.points?.map(([px, py]) => [px + dx - (dragOffset?.x || 0), py + dy - (dragOffset?.y || 0)]),
            });
          }
        });
        setDragOffset({ x: dx, y: dy });
        return;
      }

      if (!isDrawing || !drawingElement) return;
      const { x, y } = toCanvas(e.clientX, e.clientY);

      if (drawingElement.type === "pencil") {
        setDrawingElement({
          ...drawingElement,
          points: [...(drawingElement.points || []), [x, y]],
        });
      } else {
        setDrawingElement({
          ...drawingElement,
          width: snap(x) - drawingElement.x,
          height: snap(y) - drawingElement.y,
        });
      }
    },
    [isPanning, isDrawing, drawingElement, panStart, dragStart, dragOffset, toCanvas, selectedIds, elements, snap, updateElement, setPanOffset]
  );

  const handlePointerUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (dragStart) {
      setDragStart(null);
      setDragOffset(null);
      if (dragOffset && (dragOffset.x !== 0 || dragOffset.y !== 0)) {
        pushHistory();
      }
      return;
    }

    if (isDrawing && drawingElement) {
      addElement(drawingElement);
      pushHistory();
      setDrawingElement(null);
      setIsDrawing(false);
    }
  }, [isPanning, isDrawing, drawingElement, dragStart, dragOffset, addElement, pushHistory]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoom + delta);
      } else {
        setPanOffset({
          x: panOffset.x - e.deltaX,
          y: panOffset.y - e.deltaY,
        });
      }
    },
    [zoom, panOffset, setZoom, setPanOffset]
  );

  const handleTextFinish = () => {
    if (editingTextId) {
      const el = elements.find((e) => e.id === editingTextId);
      if (el && (!el.text || el.text.trim() === "")) {
        removeElements([editingTextId]);
      } else {
        pushHistory();
      }
      setEditingTextId(null);
    }
  };

  // Find editing text element for the overlay input
  const editingEl = editingTextId ? elements.find((e) => e.id === editingTextId) : null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{
          cursor: tool === "pan" ? "grab" : tool === "select" ? "default" : tool === "eraser" ? "cell" : "crosshair",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />
      {editingEl && (
        <textarea
          ref={textInputRef}
          value={editingEl.text || ""}
          onChange={(e) => updateElement(editingEl.id, { text: e.target.value })}
          onBlur={handleTextFinish}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleTextFinish();
          }}
          className="absolute border-none outline-none bg-transparent resize-none"
          style={{
            left: editingEl.x * zoom + panOffset.x,
            top: editingEl.y * zoom + panOffset.y,
            fontSize: (editingEl.fontSize || 20) * zoom,
            fontFamily: editingEl.fontFamily || "sans-serif",
            color: editingEl.strokeColor,
            lineHeight: 1.2,
            minWidth: 100,
            minHeight: 30,
          }}
          autoFocus
        />
      )}
    </div>
  );
};

export default CanvasRenderer;
