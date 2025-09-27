"use client";

import { useAuthPersistence } from "@/hooks/use-auth-persistence";

interface AuthPersistenceProviderProps {
  children: React.ReactNode;
}

export function AuthPersistenceProvider({
  children,
}: AuthPersistenceProviderProps) {
  // Este componente apenas executa o hook de persistência
  // O hook cuida de toda a lógica de verificação automática
  useAuthPersistence();

  return <>{children}</>;
}
