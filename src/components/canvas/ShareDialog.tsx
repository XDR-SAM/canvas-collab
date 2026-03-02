import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Share2 } from "lucide-react";

interface ShareDialogProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareDialog = ({ boardId, open, onOpenChange }: ShareDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("viewer");

  const { data: collaborators } = useQuery({
    queryKey: ["collaborators", boardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_collaborators")
        .select("*")
        .eq("board_id", boardId);
      if (error) throw error;
      // Fetch profiles for each collaborator
      const profiles = await Promise.all(
        data.map(async (c) => {
          const { data: p } = await supabase.from("profiles").select("*").eq("id", c.user_id).single();
          return { ...c, profile: p };
        })
      );
      return profiles;
    },
    enabled: open,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) throw new Error("Please enter an email");

      // Look up user by email using our secure function
      const { data: found, error: lookupErr } = await supabase.rpc("find_user_by_email", { _email: trimmedEmail });
      if (lookupErr) throw lookupErr;
      if (!found || found.length === 0) throw new Error("No user found with that email");

      const targetUser = found[0];
      if (targetUser.id === user?.id) throw new Error("You can't invite yourself");

      // Check if already a collaborator
      const existing = collaborators?.find((c) => c.user_id === targetUser.id);
      if (existing) throw new Error("User is already a collaborator");

      const { error } = await supabase.from("board_collaborators").insert({
        board_id: boardId,
        user_id: targetUser.id,
        role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators", boardId] });
      toast.success("Collaborator invited!");
      setEmail("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (collabId: string) => {
      const { error } = await supabase.from("board_collaborators").delete().eq("id", collabId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators", boardId] });
      toast.success("Collaborator removed!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from("board_collaborators").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators", boardId] });
      toast.success("Role updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Share Board
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && inviteMutation.mutate()}
            />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon" onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isPending}>
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Collaborators</Label>
            {collaborators && collaborators.length > 0 ? (
              <div className="space-y-2">
                {collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={c.profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {(c.profile?.full_name || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{c.profile?.full_name || "User"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Select
                        value={c.role}
                        onValueChange={(v) => updateRoleMutation.mutate({ id: c.id, role: v })}
                      >
                        <SelectTrigger className="h-7 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMutation.mutate(c.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No collaborators yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
