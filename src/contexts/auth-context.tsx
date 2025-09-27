"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao verificar sessão:", error);
          // Limpar dados de sessão corrompidos
          localStorage.removeItem("sb-auth-token");
          sessionStorage.removeItem("sb-auth-token");
          return;
        }

        if (session?.user) {
          console.log("Sessão encontrada, usuário:", session.user.email);
          await handleUser(session.user);
        } else {
          // Verificar se há dados de sessão no localStorage
          const savedUser = localStorage.getItem("maffeng-user");
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              console.log(
                "Usuário restaurado do localStorage:",
                userData.email
              );

              // Tentar refresh da sessão em background
              setTimeout(async () => {
                await refreshSession();
              }, 1000);
            } catch (parseError) {
              console.error(
                "Erro ao restaurar usuário do localStorage:",
                parseError
              );
              localStorage.removeItem("maffeng-user");
            }
          }
        }
      } catch (error) {
        console.error("Erro ao obter sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (session?.user) {
        await handleUser(session.user);
      } else {
        setUser(null);
        // Limpar dados salvos ao fazer logout
        localStorage.removeItem("maffeng-user");
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUser = async (supabaseUser: SupabaseUser) => {
    try {
      // Aqui você pode buscar dados adicionais do usuário da sua tabela de usuários
      // Por enquanto, vamos usar os dados básicos do Supabase
      const userData: User = {
        email: supabaseUser.email || "",
        name:
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split("@")[0] ||
          "Usuário",
        role: supabaseUser.user_metadata?.role || "user",
      };

      setUser(userData);

      // Salvar dados do usuário no localStorage para persistência
      localStorage.setItem("maffeng-user", JSON.stringify(userData));
      console.log("Usuário salvo no localStorage:", userData.email);
    } catch (error) {
      console.error("Erro ao processar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await handleUser(data.user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      throw new Error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: "user",
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Usuário criado com sucesso
        // O Supabase enviará um email de confirmação
        console.log(
          "Usuário criado com sucesso. Verifique seu email para confirmar a conta."
        );
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      throw new Error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Limpar dados salvos primeiro
      localStorage.removeItem("maffeng-user");
      sessionStorage.clear();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      router.push("/");
    } catch (error: any) {
      console.error("Erro no logout:", error);
      // Mesmo com erro, limpar dados locais
      localStorage.removeItem("maffeng-user");
      setUser(null);
      throw new Error(error.message || "Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Erro ao refresh da sessão:", error);
        localStorage.removeItem("maffeng-user");
        setUser(null);
        return false;
      }

      if (data.session?.user) {
        await handleUser(data.session.user);
        console.log("Sessão renovada com sucesso");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao tentar refresh da sessão:", error);
      localStorage.removeItem("maffeng-user");
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
