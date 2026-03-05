import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Pencil, FolderOpen, HelpCircle, Users, LogIn } from "lucide-react";

interface Props {
  onOpenFile: () => void;
  onOpenHelp: () => void;
}

const WelcomeScreen = ({ onOpenFile, onOpenHelp }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-5 max-w-md text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Pencil className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">DrawBoard</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Your drawings are saved in your browser's storage.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onOpenFile}
            className="flex items-center gap-2 rounded-lg border bg-background/80 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <FolderOpen className="h-4 w-4" /> Open
          </button>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-2 rounded-lg border bg-background/80 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <HelpCircle className="h-4 w-4" /> Help
          </button>
          <button
            disabled
            className="flex items-center gap-2 rounded-lg border bg-background/80 px-4 py-2 text-sm text-muted-foreground opacity-60 cursor-not-allowed"
          >
            <Users className="h-4 w-4" /> Live collaboration
          </button>
          {!user && (
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 rounded-lg border bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <LogIn className="h-4 w-4" /> Sign up
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">↑</span>
          <span className="text-xs text-muted-foreground font-medium">
            Pick a tool & Start drawing!
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
