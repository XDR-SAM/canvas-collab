import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Enums } from "@/integrations/supabase/types";

interface Props {
  children: React.ReactNode;
  requiredRole?: Enums<"app_role">;
}

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { session, loading, hasRole, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (profile?.is_banned) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-destructive text-lg font-semibold">Your account has been suspended.</p>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
