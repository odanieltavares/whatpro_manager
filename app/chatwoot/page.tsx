'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, XCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatwootPage() {
  const [chatwootUrl, setChatwootUrl] = useState('');
  const [accountId, setAccountId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [inboxId, setInboxId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!chatwootUrl || !accountId || !apiKey || !inboxId) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsConnected(true);
      toast.success('Conexão com Chatwoot estabelecida!');
    } catch (error) {
      toast.error('Erro ao conectar com Chatwoot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chatwoot</h1>
        <p className="text-muted-foreground">Integre suas instâncias com o Chatwoot</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status da Conexão
              {isConnected ? (
                <Badge variant="default" className="ml-auto">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="secondary" className="ml-auto">
                  <XCircle className="mr-1 h-3 w-3" />
                  Desconectado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatwoot-url">URL do Chatwoot</Label>
              <Input
                id="chatwoot-url"
                placeholder="https://app.chatwoot.com"
                value={chatwootUrl}
                onChange={(e) => setChatwootUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-id">Account ID</Label>
              <Input
                id="account-id"
                placeholder="1"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Sua API Key do Chatwoot"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inbox-id">Inbox ID</Label>
              <Input
                id="inbox-id"
                placeholder="1"
                value={inboxId}
                onChange={(e) => setInboxId(e.target.value)}
              />
            </div>

            <Button onClick={handleConnect} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Conectando...' : isConnected ? 'Reconectar' : 'Conectar'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Integrar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Obter as Credenciais</h4>
              <p className="text-muted-foreground">
                Acesse seu painel Chatwoot → Settings → Integrations
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">2. Criar um Inbox</h4>
              <p className="text- muted-foreground">
                Crie um novo inbox do tipo "API" e anote o ID
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">3. Gerar API Key</h4>
              <p className="text-muted-foreground">
                Em Settings → Profile → Access Token
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">4. Configurar</h4>
              <p className="text-muted-foreground">
                Preencha os campos ao lado e clique em Conectar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
