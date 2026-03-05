

## Excalidraw-Style UI Overhaul

Comparing the reference screenshots with the current app, here's what needs to change:

### 1. Hamburger Menu (Top-Left)
Replace the logo/branding cluster with a single hamburger menu icon (like Excalidraw's `≡` button) containing:
- Open (Ctrl+O) - triggers JSON import
- Save to... - save to cloud or file
- Export image (Ctrl+Shift+E) - PNG/SVG export
- Live collaboration...
- Help (?)
- Reset the canvas
- Sign up / My Boards (auth-dependent)
- Preferences submenu (theme toggle, canvas background color)
- Theme switcher (light/dark/system) inline

### 2. Toolbar Redesign
Move toolbar to match Excalidraw layout:
- Position: top-center, single row of icon-only buttons with number shortcuts shown
- Add missing tool slots: image insert placeholder (9), frame tool (F), laser pointer (K)
- Keep lock/hand/select/rect/diamond/ellipse/arrow/line/pencil/text/eraser
- Add the "lock tool" toggle (Q key) to keep selected tool active after drawing

### 3. Welcome/Help Screen (Center Canvas)
When canvas is empty, show a centered welcome overlay (like Excalidraw):
- App logo + name
- "Your drawings are saved in your browser's storage" message
- Quick links: Open, Help, Live collaboration, Sign up
- Hint text: "Pick a tool & Start drawing!" with arrow pointing to toolbar
- Disappears once user starts drawing

### 4. Bottom-Left Controls
Move zoom controls and undo/redo from the toolbar to bottom-left corner:
- `[-] 100% [+]` zoom widget
- Undo/Redo buttons beside it

### 5. Bottom-Right Shortcuts & Help
Add a "Shortcuts & help" button (bottom-right corner) that opens the keyboard shortcuts modal.

### 6. Right-Click Context Menu
Add a canvas context menu with:
- Paste, Select All
- Toggle grid (Ctrl+'), Snap to objects (Alt+S)
- Zen mode (Alt+Z) - hides all UI except canvas
- View mode (Alt+R) - read-only mode
- Canvas & Shape properties (Alt+/)

### 7. Extended Keyboard Shortcuts
Add missing shortcuts to `CanvasRenderer.tsx`:
- `Ctrl+Shift+[` / `]` for send to back / bring to front
- `Ctrl+A` select all
- `Shift+H` / `Shift+V` flip horizontal/vertical (store flipX/flipY on elements)
- `Alt+Z` zen mode, `Alt+R` view mode
- `S` / `G` keys to quickly focus stroke/fill color pickers
- `Q` to toggle "lock tool" mode

### 8. Store Additions
Add to `canvasStore.ts`:
- `zenMode: boolean` - hides toolbar, properties, navbar
- `viewMode: boolean` - disables all editing
- `lockTool: boolean` - keeps tool active after drawing
- `canvasBackground: string` - background color
- `selectAll()` action
- `flipElements(ids, axis)` action

### 9. Canvas Background
Support changing the canvas background color (white, light variants, transparent) from the hamburger menu preferences.

### Technical Changes

**Files to create:**
- `src/components/canvas/HamburgerMenu.tsx` - left menu with all options
- `src/components/canvas/WelcomeScreen.tsx` - centered overlay for empty canvas
- `src/components/canvas/BottomControls.tsx` - zoom + undo/redo bottom-left
- `src/components/canvas/CanvasContextMenu.tsx` - right-click menu

**Files to modify:**
- `src/stores/canvasStore.ts` - add zenMode, viewMode, lockTool, canvasBackground, selectAll, flipElements
- `src/components/canvas/Toolbar.tsx` - strip down to tool icons only (no zoom/undo/grid), reposition
- `src/components/canvas/CanvasRenderer.tsx` - add context menu, canvas background, extended shortcuts, lock tool behavior
- `src/pages/Index.tsx` - integrate welcome screen, hamburger menu, bottom controls, zen mode hiding
- `src/pages/Board.tsx` - same layout changes
- `src/components/CanvasNavbar.tsx` - simplify to just top-right cluster (share button, user avatar) or hide in zen mode
- `src/components/KeyboardShortcutsModal.tsx` - expand with all Excalidraw shortcuts organized by category (Tools, View, Editor)

