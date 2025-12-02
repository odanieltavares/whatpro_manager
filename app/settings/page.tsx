'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [adminToken, setAdminToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://free.uazapi.com');
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    if (!adminToken) {
      toast.error('Digite o Admin Token');
      return;
    }

    setLoading(true);
    try {
      // Salvar no localStorage
      localStorage.setItem('uazapi_admin_token', adminToken);
      localStorage.setItem('uazapi_base_url', baseUrl);
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Configure suas credenciais Uazapi</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Credenciais da API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="base-url">URL Base</Label>
              <Input
                id="base-url"
                placeholder="https://free.uazapi.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                URL do servidor Uazapi (use https://free.uazapi.com para a versão gratuita)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-token">Admin Token</Label>
              <Input
                id="admin-token"
                type="password"
                placeholder="Seu token administrativo"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Token de administrador fornecido pelo Uazapi
              </p>
            </div>

            <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sobre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Produto:</strong> Whatpro Manager</p>
            <p><strong>API:</strong> Uazapi WhatsApp API</p>
            <p><strong>Stack:</strong> Next.js 14 + TypeScript + TailwindCSS</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
