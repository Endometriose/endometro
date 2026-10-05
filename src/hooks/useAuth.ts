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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar perfil:", error);
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email || email,
          role: data.role || (data.tipo_usuario === "EMPRESA" ? "instituicao" : "participante"),
          full_name: data.full_name || data.nome,
          company_id: data.company_id,
        });
      } else {
        // Fallback se perfil não existir ainda
        setProfile({
          id: userId,
          email,
          role: "participante",
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
