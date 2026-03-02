import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ["V"], desc: "Select tool" },
  { keys: ["H"], desc: "Pan tool" },
  { keys: ["R"], desc: "Rectangle" },
  { keys: ["O"], desc: "Circle" },
  { keys: ["D"], desc: "Diamond" },
  { keys: ["A"], desc: "Arrow" },
  { keys: ["L"], desc: "Line" },
  { keys: ["P"], desc: "Pencil" },
  { keys: ["T"], desc: "Text" },
  { keys: ["E"], desc: "Eraser" },
  { keys: ["Ctrl", "Z"], desc: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], desc: "Redo" },
  { keys: ["Ctrl", "S"], desc: "Save" },
  { keys: ["Ctrl", "D"], desc: "Duplicate" },
  { keys: ["Del"], desc: "Delete selected" },
  { keys: ["?"], desc: "Show shortcuts" },
];

const KeyboardShortcutsModal = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" /> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-1.5 max-h-80 overflow-y-auto">
          {shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
              <span className="text-sm text-muted-foreground">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded border bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground"
                  >
                    {k}
                  </kbd>
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
