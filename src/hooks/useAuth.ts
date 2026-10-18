import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  role: "participante" | "instituicao" | "admin";
  full_name?: string;
  company_id?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Obter a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? "");
      } else {
        setLoading(false);
      }
    });

    // 2. Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email ?? "");
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar perfil:", error);
      }

      // Checar se o usuário está associado a alguma empresa em companies
      let companyLinkedId = data?.company_id || null;
      let isCompanyUser = data?.role === "instituicao" || data?.tipo_usuario === "EMPRESA" || !!companyLinkedId;

      if (!companyLinkedId) {
        const { data: comp } = await supabase
          .from("companies")
          .select("id")
          .or(`user_id.eq.${userId},contact_email.eq.${cleanEmail}`)
          .limit(1)
          .maybeSingle();

        if (comp) {
          companyLinkedId = comp.id;
          isCompanyUser = true;

          // Sincronizar de volta com profiles se possível
          supabase.from("profiles").upsert([{
            id: userId,
            email: cleanEmail,
            role: "instituicao",
            tipo_usuario: "EMPRESA",
            company_id: comp.id,
          }]).then();
        }
      }

      const metaRole = (session?.user?.user_metadata?.role as "instituicao" | "participante" | "admin") || null;
      const finalRole: "instituicao" | "participante" | "admin" = isCompanyUser || metaRole === "instituicao" ? "instituicao" : (data?.role || metaRole || "participante");

      if (data) {
        setProfile({
          id: data.id,
          email: data.email || cleanEmail,
          role: finalRole,
          full_name: data.full_name || data.nome,
          company_id: companyLinkedId,
        });
      } else {
        // Fallback se perfil não existir ainda no profiles
        setProfile({
          id: userId,
          email: cleanEmail,
          role: finalRole,
          company_id: companyLinkedId,
        });
      }
    } catch (e) {
      console.error("Exceção ao carregar perfil:", e);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isInstituicao: profile?.role === "instituicao",
    isAdmin: profile?.role === "admin",
    signOut,
  };
}
