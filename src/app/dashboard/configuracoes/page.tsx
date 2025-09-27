"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Palette, Eye, Settings } from "lucide-react";

export default function ConfiguracoesPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as preferências do sistema
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "light":
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "Tema Escuro";
      case "light":
        return "Tema Claro";
      default:
        return "Sistema";
    }
  };

  const getThemeDescription = () => {
    switch (theme) {
      case "dark":
        return "Interface escura para ambientes com pouca luz";
      case "light":
        return "Interface clara para ambientes bem iluminados";
      default:
        return `Segue o tema do sistema (${
          systemTheme === "dark" ? "Escuro" : "Claro"
        })`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Configure as preferências do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tema Atual */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {getThemeIcon()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">
                    {getThemeLabel()}
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    Ativo
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getThemeDescription()}
                </p>
              </div>
            </div>
          </div>

          {/* Controles de Tema */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Escolher Tema</Label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Tema Claro */}
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Claro</div>
                  <div className="text-xs text-muted-foreground">
                    Tema claro
                  </div>
                </div>
              </Button>

              {/* Tema Escuro */}
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Escuro</div>
                  <div className="text-xs text-muted-foreground">
                    Tema escuro
                  </div>
                </div>
              </Button>

              {/* Tema Sistema */}
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Sistema</div>
                  <div className="text-xs text-muted-foreground">
                    Automático
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Preview do Tema */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Preview */}
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="text-sm font-medium">Card de Exemplo</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Este é um exemplo de como os cards aparecem no tema atual.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="default">
                    Primário
                  </Button>
                  <Button size="sm" variant="outline">
                    Secundário
                  </Button>
                </div>
              </div>

              {/* Texto Preview */}
              <div className="space-y-2">
                <div className="text-lg font-semibold text-foreground">
                  Texto Principal
                </div>
                <div className="text-sm text-muted-foreground">
                  Texto secundário com menor contraste
                </div>
                <div className="text-xs text-muted-foreground">
                  Texto de apoio com contraste mínimo
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="default">Badge</Badge>
                  <Badge variant="secondary">Secundário</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
