import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCanvasStore } from "@/stores/canvasStore";
import { exportToPNG, exportToSVG, exportToJSON, importFromJSON } from "@/components/canvas/ExportImport";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Menu, FolderOpen, Save, Download, Users, HelpCircle, Trash2,
  LayoutDashboard, LogIn, Moon, Sun, Monitor, Palette,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";

interface Props {
  boardName?: string;
  onSaveToCloud?: () => void;
  onSave?: () => void;
}

const bgColors = [
  { label: "White", value: "#ffffff" },
  { label: "Light Gray", value: "#f5f5f5" },
  { label: "Warm", value: "#faf8f5" },
  { label: "Cool", value: "#f0f4f8" },
  { label: "Transparent", value: "transparent" },
];

const HamburgerMenu = ({ boardName = "Scratch Pad", onSaveToCloud, onSave }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { elements, setElements, pushHistory, canvasBackground, setCanvasBackground } = useCanvasStore();
  const { theme, setTheme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetCanvas = () => {
    if (elements.length === 0) return;
    setElements([]);
    pushHistory();
    toast.success("Canvas cleared");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-background/90 backdrop-blur-sm border shadow-sm">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <FolderOpen className="mr-2 h-4 w-4" /> Open
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+O</span>
          </DropdownMenuItem>

          {onSave && (
            <DropdownMenuItem onClick={onSave}>
              <Save className="mr-2 h-4 w-4" /> Save
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+S</span>
            </DropdownMenuItem>
          )}

          {onSaveToCloud && (
            <DropdownMenuItem onClick={onSaveToCloud}>
              <Save className="mr-2 h-4 w-4" /> Save to Cloud
            </DropdownMenuItem>
          )}

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Download className="mr-2 h-4 w-4" /> Export image
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => exportToPNG(elements, boardName)}>PNG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToSVG(elements, boardName)}>SVG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToJSON(elements, boardName)}>JSON</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem disabled>
            <Users className="mr-2 h-4 w-4" /> Live collaboration...
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => {
            const store = useCanvasStore.getState();
            store.setZenMode(false);
            store.setViewMode(false);
            // Open shortcuts via custom event
            window.dispatchEvent(new CustomEvent("open-shortcuts"));
          }}>
            <HelpCircle className="mr-2 h-4 w-4" /> Help
            <span className="ml-auto text-xs text-muted-foreground">?</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleResetCanvas} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Reset the canvas
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {user ? (
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> My Boards
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => navigate("/signup")}>
              <LogIn className="mr-2 h-4 w-4" /> Sign up
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" /> Canvas background
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {bgColors.map((c) => (
                <DropdownMenuItem key={c.value} onClick={() => setCanvasBackground(c.value)}>
                  <div
                    className="mr-2 h-4 w-4 rounded border"
                    style={{ backgroundColor: c.value === "transparent" ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px" : c.value }}
                  />
                  {c.label}
                  {canvasBackground === c.value && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <div className="flex items-center gap-1 px-2 py-1.5">
            <span className="text-sm mr-auto">Theme</span>
            <Button variant={theme === "light" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setTheme("light")}>
              <Sun className="h-3.5 w-3.5" />
            </Button>
            <Button variant={theme === "dark" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setTheme("dark")}>
              <Moon className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTheme} title="Toggle theme">
              <Monitor className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

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

export default HamburgerMenu;
