"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const validCredentials = [
      { email: "admin@construcao.com", password: "admin123" },
      { email: "gestor@construcao.com", password: "gestor123" },
      { email: "demo@construcao.com", password: "demo123" },
    ]

    const isValidUser = validCredentials.some((cred) => cred.email === email && cred.password === password)

    setTimeout(() => {
      setIsLoading(false)
      if (isValidUser) {
        router.push("/dashboard")
      } else {
        setError("Email ou senha incorretos. Tente: admin@construcao.com / admin123")
      }
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertDescription>
          <strong>Credenciais para demonstração:</strong>
          <br />
          Email: admin@construcao.com | Senha: admin123
          <br />
          Email: gestor@construcao.com | Senha: gestor123
          <br />
          Email: demo@construcao.com | Senha: demo123
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}
