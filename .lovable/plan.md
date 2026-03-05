

## Fix Plan: Canvas Tool Behavior, Zoom, Text, and Eraser

### Root Causes Identified

1. **Ctrl+Scroll zooms entire page**: The `preventBrowserZoom` listener uses `document.addEventListener("wheel")` but React's synthetic `onWheel` cannot reliably call `preventDefault()` on passive wheel events. Fix: attach a native `wheel` listener directly on the canvas element with `{ passive: false }`.

2. **Tools auto-switch to Select after one use**: Line 533 does `if (!lockTool) setTool("select")`. User wants tools to stay active by default. Fix: change `lockTool` default to `true` in the store, and invert the lock button logic (lock icon = locked by default, unlock = single-use mode).

3. **Text tool broken / keyboard shortcuts fire while typing**: The keyboard shortcut handler (line 350) checks `editingTextId` but the text element is created and `editingTextId` is set in the same render cycle. The shortcut handler fires on keydown before the textarea captures focus. Also, the `?` shortcut listener in Index.tsx doesn't check if a textarea is focused. Fix: add `target.tagName` checks to ALL global keydown handlers, and ensure the textarea gets focus synchronously.

4. **Eraser not smooth**: `removeElements` calls `pushHistory()` on every single deletion (line 151 in store). During drag-erase this creates hundreds of history entries. Fix: remove the auto-`pushHistory` from `removeElements`, and call it once on pointer-up instead.

### Changes

**`src/stores/canvasStore.ts`**:
- Change `lockTool` default from `false` to `true`
- Remove `pushHistory()` call from inside `removeElements` (it's called externally)

**`src/components/canvas/CanvasRenderer.tsx`**:
- Replace `document.addEventListener("wheel", preventBrowserZoom)` with a native wheel listener attached directly to `canvasRef.current` using `{ passive: false }`, and move zoom logic into this native handler (bypassing React's synthetic events entirely)
- Remove the React `onWheel` prop from the canvas element
- In `handlePointerUp`, add `pushHistory()` after eraser drag ends
- Ensure text textarea gets `e.stopPropagation()` on keydown to prevent shortcut interference

**`src/pages/Index.tsx`**:
- Add `target.tagName` guard to the `?` key listener so it doesn't fire when typing in textarea

**`src/pages/Board.tsx`**:
- Same `target.tagName` guard for `?` key listener

**`src/components/canvas/Toolbar.tsx`**:
- Swap lock/unlock icon meaning: locked = tool stays active (default), unlocked = single-use mode

