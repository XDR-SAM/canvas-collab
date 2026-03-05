import { create } from "zustand";

export type Tool =
  | "select"
  | "pan"
  | "rectangle"
  | "circle"
  | "diamond"
  | "arrow"
  | "line"
  | "pencil"
  | "text"
  | "eraser";

export interface CanvasElement {
  id: string;
  type: "rectangle" | "circle" | "diamond" | "arrow" | "line" | "pencil" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  points?: number[][];
  text?: string;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  roughness: number;
  seed: number;
  flipX?: boolean;
  flipY?: boolean;
}

interface CanvasState {
  elements: CanvasElement[];
  selectedIds: Set<string>;
  tool: Tool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  opacity: number;
  fontSize: number;
  fontFamily: string;
  roughness: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  panOffset: { x: number; y: number };
  zoom: number;
  history: CanvasElement[][];
  historyIndex: number;
  zenMode: boolean;
  viewMode: boolean;
  lockTool: boolean;
  canvasBackground: string;

  setTool: (tool: Tool) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeStyle: (style: "solid" | "dashed" | "dotted") => void;
  setOpacity: (opacity: number) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setRoughness: (roughness: number) => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setSelectedIds: (ids: Set<string>) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElements: (ids: string[]) => void;
  setElements: (elements: CanvasElement[]) => void;
  duplicateElements: (ids: string[]) => void;
  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setZenMode: (zen: boolean) => void;
  setViewMode: (view: boolean) => void;
  setLockTool: (lock: boolean) => void;
  setCanvasBackground: (bg: string) => void;
  selectAll: () => void;
  flipElements: (ids: string[], axis: "horizontal" | "vertical") => void;
}

const genId = () => crypto.randomUUID();

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  selectedIds: new Set(),
  tool: "select",
  strokeColor: "#1e1e1e",
  fillColor: "transparent",
  strokeWidth: 2,
  strokeStyle: "solid",
  opacity: 1,
  fontSize: 20,
  fontFamily: "sans-serif",
  roughness: 1,
  showGrid: false,
  snapToGrid: false,
  gridSize: 20,
  panOffset: { x: 0, y: 0 },
  zoom: 1,
  history: [[]],
  historyIndex: 0,
  zenMode: false,
  viewMode: false,
  lockTool: false,
  canvasBackground: "#ffffff",

  setTool: (tool) => set({ tool, selectedIds: new Set() }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setStrokeStyle: (strokeStyle) => set({ strokeStyle }),
  setOpacity: (opacity) => set({ opacity }),
  setFontSize: (fontSize) => set({ fontSize }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setRoughness: (roughness) => set({ roughness }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  setPanOffset: (panOffset) => set({ panOffset }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  setZenMode: (zenMode) => set({ zenMode }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLockTool: (lockTool) => set({ lockTool }),
  setCanvasBackground: (canvasBackground) => set({ canvasBackground }),

  addElement: (element) => {
    const { elements } = get();
    set({ elements: [...elements, element] });
  },

  updateElement: (id, updates) => {
    const { elements } = get();
    set({ elements: elements.map((el) => (el.id === id ? { ...el, ...updates } : el)) });
  },

  removeElements: (ids) => {
    const { elements } = get();
    set({ elements: elements.filter((el) => !ids.includes(el.id)), selectedIds: new Set() });
    get().pushHistory();
  },

  setElements: (elements) => set({ elements }),

  duplicateElements: (ids) => {
    const { elements } = get();
    const toDup = elements.filter((el) => ids.includes(el.id));
    const newEls = toDup.map((el) => ({
      ...el,
      id: genId(),
      x: el.x + 20,
      y: el.y + 20,
      seed: Math.floor(Math.random() * 2 ** 31),
    }));
    set({
      elements: [...elements, ...newEls],
      selectedIds: new Set(newEls.map((e) => e.id)),
    });
    get().pushHistory();
  },

  bringToFront: (ids) => {
    const { elements } = get();
    const selected = elements.filter((el) => ids.includes(el.id));
    const rest = elements.filter((el) => !ids.includes(el.id));
    set({ elements: [...rest, ...selected] });
    get().pushHistory();
  },

  sendToBack: (ids) => {
    const { elements } = get();
    const selected = elements.filter((el) => ids.includes(el.id));
    const rest = elements.filter((el) => !ids.includes(el.id));
    set({ elements: [...selected, ...rest] });
    get().pushHistory();
  },

  selectAll: () => {
    const { elements } = get();
    set({ selectedIds: new Set(elements.map((e) => e.id)), tool: "select" });
  },

  flipElements: (ids, axis) => {
    const { elements } = get();
    set({
      elements: elements.map((el) => {
        if (!ids.includes(el.id)) return el;
        if (axis === "horizontal") return { ...el, flipX: !el.flipX };
        return { ...el, flipY: !el.flipY };
      }),
    });
    get().pushHistory();
  },

  pushHistory: () => {
    const { elements, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(elements)));
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        elements: JSON.parse(JSON.stringify(history[newIndex])),
        historyIndex: newIndex,
        selectedIds: new Set(),
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        elements: JSON.parse(JSON.stringify(history[newIndex])),
        historyIndex: newIndex,
        selectedIds: new Set(),
      });
    }
  },
}));
