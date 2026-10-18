import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: "participante" | "instituicao" | "admin";
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  const userMetaRole = user?.user_metadata?.role;
  const userMetaTipo = (user?.user_metadata as any)?.tipo_usuario;
  let hasCachedEmpresa = false;
  try {
    hasCachedEmpresa = Boolean(sessionStorage.getItem("empresa_ativa"));
  } catch (e) {}

  const isInst =
    profile?.role === "instituicao" ||
    profile?.role === "admin" ||
    userMetaRole === "instituicao" ||
    userMetaRole === "admin" ||
    userMetaTipo === "EMPRESA" ||
    Boolean(profile?.company_id) ||
    Boolean((profile as any)?.tipo_usuario === "EMPRESA") ||
    hasCachedEmpresa;

  const hasAccess =
    !requireRole ||
    (requireRole === "instituicao" ? isInst : (profile?.role === requireRole || profile?.role === "admin" || userMetaRole === requireRole));

  if (!hasAccess) {
    // Redireciona para / se o usuário não tiver permissão para a área
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
