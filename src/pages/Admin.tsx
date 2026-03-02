import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, LayoutDashboard, Settings, BarChart3, Ban, CheckCircle, Search, Trash2 } from "lucide-react";
import type { Enums } from "@/integrations/supabase/types";

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState("");
  const [boardSearch, setBoardSearch] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<Enums<"app_role">>("free_user");

  // Fetch all profiles (admin RLS policy allows this)
  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all roles
  const { data: allRoles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all boards
  const { data: boards, isLoading: loadingBoards } = useQuery({
    queryKey: ["admin-boards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("boards").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch app settings
  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*");
      if (error) throw error;
      const map: Record<string, any> = {};
      data?.forEach((s) => (map[s.key] = s.value));
      return map;
    },
  });

  const toggleBan = useMutation({
    mutationFn: async ({ id, banned }: { id: string; banned: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_banned: banned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast.success("User updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteBoard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("boards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boards"] });
      toast.success("Board deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase.from("app_settings").upsert({ key, value });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      toast.success("Setting updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Enums<"app_role"> }) => {
      // Delete existing roles and insert new one
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role updated!");
      setRoleDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getRoleForUser = (userId: string) => allRoles?.find((r) => r.user_id === userId)?.role || "free_user";

  const filteredProfiles = profiles?.filter((p) =>
    (p.full_name || "").toLowerCase().includes(userSearch.toLowerCase()) || p.id.includes(userSearch)
  );

  const filteredBoards = boards?.filter((b) =>
    b.name.toLowerCase().includes(boardSearch.toLowerCase())
  );

  const totalUsers = profiles?.length || 0;
  const totalBoards = boards?.length || 0;
  const bannedUsers = profiles?.filter((p) => p.is_banned).length || 0;
  const proUsers = allRoles?.filter((r) => r.role === "pro_user").length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview"><BarChart3 className="mr-2 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="boards"><LayoutDashboard className="mr-2 h-4 w-4" />Boards</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalUsers}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Boards</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalBoards}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pro Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{proUsers}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Banned Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-destructive">{bannedUsers}</p></CardContent></Card>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10" />
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name || "Unnamed"}</TableCell>
                      <TableCell><Badge variant="secondary">{p.plan}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{getRoleForUser(p.id)}</Badge></TableCell>
                      <TableCell>{p.is_banned ? <Badge variant="destructive">Banned</Badge> : <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(p); setSelectedRole(getRoleForUser(p.id) as Enums<"app_role">); setRoleDialogOpen(true); }}>
                          Role
                        </Button>
                        <Button size="sm" variant={p.is_banned ? "default" : "destructive"} onClick={() => toggleBan.mutate({ id: p.id, banned: !p.is_banned })} disabled={p.id === user?.id}>
                          {p.is_banned ? <><CheckCircle className="mr-1 h-3 w-3" />Unban</> : <><Ban className="mr-1 h-3 w-3" />Ban</>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Boards */}
          <TabsContent value="boards">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search boards..." value={boardSearch} onChange={(e) => setBoardSearch(e.target.value)} className="pl-10" />
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Public</TableHead>
                    <TableHead>Starred</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBoards?.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.is_public ? <Badge>Public</Badge> : <Badge variant="secondary">Private</Badge>}</TableCell>
                      <TableCell>{b.is_starred ? "⭐" : "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(b.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" onClick={() => deleteBoard.mutate(b.id)}>
                          <Trash2 className="mr-1 h-3 w-3" />Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>App Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>App Name</Label>
                  <div className="flex gap-2">
                    <Input defaultValue={settings?.app_name as string || "DrawBoard"} id="app-name-input" />
                    <Button onClick={() => { const v = (document.getElementById("app-name-input") as HTMLInputElement).value; updateSetting.mutate({ key: "app_name", value: v }); }}>Save</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Announcement Banner</Label>
                  <div className="flex gap-2">
                    <Input defaultValue={settings?.announcement_banner as string || ""} id="announcement-input" placeholder="Leave empty to hide" />
                    <Button onClick={() => { const v = (document.getElementById("announcement-input") as HTMLInputElement).value; updateSetting.mutate({ key: "announcement_banner", value: v }); }}>Save</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable the app for non-admin users</p>
                  </div>
                  <Switch checked={!!settings?.maintenance_mode} onCheckedChange={(v) => updateSetting.mutate({ key: "maintenance_mode", value: v })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Role for {selectedUser?.full_name || "User"}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Enums<"app_role">)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free_user">Free User</SelectItem>
                <SelectItem value="pro_user">Pro User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedUser && changeRole.mutate({ userId: selectedUser.id, role: selectedRole })}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
