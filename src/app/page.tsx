import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl">
                <Logo size="lg" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Sistema de Gestão
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              Estoque e Frotas - Construção Civil
            </p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 shadow-2xl">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Acesso ao Sistema
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                Entre com suas credenciais para acessar o sistema de gestão
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
