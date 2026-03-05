import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, Shield, LayoutDashboard, Save, Share2 } from "lucide-react";

interface Props {
  onSaveToCloud?: () => void;
  boardName?: string;
  showBack?: boolean;
  onBack?: () => void;
  savePending?: boolean;
  onSave?: () => void;
  onShare?: () => void;
}

const CanvasNavbar = ({ boardName = "Scratch Pad", showBack, onBack, savePending, onSave, onShare }: Props) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
      {showBack && onBack && (
        <Button variant="outline" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur-sm" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Button>
      )}

      {onShare && (
        <Button variant="outline" size="sm" className="h-8 bg-background/90 backdrop-blur-sm" onClick={onShare}>
          <Share2 className="mr-1 h-3.5 w-3.5" /> Share
        </Button>
      )}

      {onSave && (
        <Button variant="outline" size="sm" className="h-8 bg-background/90 backdrop-blur-sm" onClick={onSave} disabled={savePending}>
          <Save className="mr-1 h-3.5 w-3.5" />
          {savePending ? "Saving..." : "Save"}
        </Button>
      )}

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-sm">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> My Boards
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <Shield className="mr-2 h-4 w-4" /> Admin Panel
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="sm" className="h-8 bg-background/90 backdrop-blur-sm" asChild>
          <Link to="/login">Sign In</Link>
        </Button>
      )}
    </div>
  );
};

export default CanvasNavbar;
