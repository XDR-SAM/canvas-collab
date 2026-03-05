import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections: { title: string; shortcuts: { keys: string[]; desc: string }[] }[] = [
  {
    title: "Tools",
    shortcuts: [
      { keys: ["H"], desc: "Hand (panning tool)" },
      { keys: ["V", "1"], desc: "Selection" },
      { keys: ["R", "2"], desc: "Rectangle" },
      { keys: ["D", "3"], desc: "Diamond" },
      { keys: ["O", "4"], desc: "Ellipse" },
      { keys: ["A", "5"], desc: "Arrow" },
      { keys: ["L", "6"], desc: "Line" },
      { keys: ["P", "7"], desc: "Draw" },
      { keys: ["T", "8"], desc: "Text" },
      { keys: ["E", "0"], desc: "Eraser" },
      { keys: ["Q"], desc: "Keep tool active after drawing" },
      { keys: ["S"], desc: "Show stroke color picker" },
      { keys: ["G"], desc: "Show background color picker" },
      { keys: ["Enter"], desc: "Edit text / add label" },
      { keys: ["Esc"], desc: "Finish editing" },
    ],
  },
  {
    title: "View",
    shortcuts: [
      { keys: ["Ctrl", "+"], desc: "Zoom in" },
      { keys: ["Ctrl", "-"], desc: "Zoom out" },
      { keys: ["Ctrl", "0"], desc: "Reset zoom" },
      { keys: ["Alt", "Z"], desc: "Zen mode" },
      { keys: ["Alt", "S"], desc: "Snap to objects" },
      { keys: ["Ctrl", "'"], desc: "Toggle grid" },
      { keys: ["Alt", "R"], desc: "View mode" },
      { keys: ["Alt", "Shift", "D"], desc: "Toggle theme" },
      { keys: ["Alt", "/"], desc: "Canvas & Shape properties" },
    ],
  },
  {
    title: "Editor",
    shortcuts: [
      { keys: ["Ctrl", "Z"], desc: "Undo" },
      { keys: ["Ctrl", "Y"], desc: "Redo" },
      { keys: ["Ctrl", "Shift", "Z"], desc: "Redo (alt)" },
      { keys: ["Ctrl", "A"], desc: "Select all" },
      { keys: ["Ctrl", "D"], desc: "Duplicate" },
      { keys: ["Del"], desc: "Delete" },
      { keys: ["Ctrl", "X"], desc: "Cut" },
      { keys: ["Ctrl", "C"], desc: "Copy" },
      { keys: ["Ctrl", "V"], desc: "Paste" },
      { keys: ["Ctrl", "Shift", "["], desc: "Send to back" },
      { keys: ["Ctrl", "Shift", "]"], desc: "Bring to front" },
      { keys: ["Shift", "H"], desc: "Flip horizontal" },
      { keys: ["Shift", "V"], desc: "Flip vertical" },
      { keys: ["Ctrl", "G"], desc: "Group selection" },
      { keys: ["Ctrl", "Shift", "G"], desc: "Ungroup selection" },
      { keys: ["Ctrl", "Shift", "L"], desc: "Lock/unlock" },
    ],
  },
];

const KeyboardShortcutsModal = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" /> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-2">{section.title}</h3>
              <div className="grid gap-0.5">
                {section.shortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between rounded px-2 py-1 hover:bg-muted/50">
                    <span className="text-sm text-muted-foreground">{s.desc}</span>
                    <div className="flex gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground">
                            {k}
                          </kbd>
                          {s.keys.length > 1 && i < s.keys.length - 1 && (
                            <span className="text-[10px] text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
