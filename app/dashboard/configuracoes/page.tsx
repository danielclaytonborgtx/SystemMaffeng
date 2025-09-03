import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configure as preferências do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Configurações básicas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Nome da Empresa</Label>
              <Input id="company" placeholder="Digite o nome da empresa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de Notificações</Label>
              <Input id="email" type="email" placeholder="email@empresa.com" />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Configure quando receber alertas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-alerts">Alertas de Manutenção</Label>
              <Switch id="maintenance-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="equipment-alerts">Alertas de Equipamentos</Label>
              <Switch id="equipment-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Notificações por Email</Label>
              <Switch id="email-notifications" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
