"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export function useAuthPersistence() {
  const { user, refreshSession } = useAuth();

  useEffect(() => {
    // Verificar sessão quando a janela ganha foco
    const handleFocus = async () => {
      if (user) {
        console.log("Janela em foco - verificando sessão...");
        const isValid = await refreshSession();
        if (!isValid) {
          console.log("Sessão expirada, redirecionando para login...");
        }
      }
    };

    // Verificar sessão quando a página se torna visível
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && user) {
        console.log("Página visível - verificando sessão...");
        const isValid = await refreshSession();
        if (!isValid) {
          console.log("Sessão expirada, redirecionando para login...");
        }
      }
    };

    // Verificar sessão periodicamente (a cada 5 minutos)
    const intervalId = setInterval(async () => {
      if (user) {
        console.log("Verificação periódica da sessão...");
        const isValid = await refreshSession();
        if (!isValid) {
          console.log("Sessão expirada na verificação periódica...");
        }
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Adicionar listeners
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [user, refreshSession]);

  return {
    user,
  };
}
