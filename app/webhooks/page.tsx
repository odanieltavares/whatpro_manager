'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Webhook, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Digite a URL do webhook');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Webhook configurado com sucesso!');
    } catch (error) {
      toast.error('Erro ao configurar webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground">Configure webhooks para receber eventos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurar Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://seu-dominio.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                URL que receberá os eventos do WhatsApp
              </p>
            </div>

            <Button onClick={handleSaveWebhook} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mensagem Recebida</span>
              <Badge variant="secondary">message</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Status da Mensagem</span>
              <Badge variant="secondary">message.status</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conexão</span>
              <Badge variant="secondary">connection</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">QR Code Atualizado</span>
              <Badge variant="secondary">qrcode</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            <Webhook className="mx-auto h-8 w-8 mb-2" />
            <p>Nenhum evento recebido ainda</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
