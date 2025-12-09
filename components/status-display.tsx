'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { instancesApi } from '@/lib/api/endpoints/instances';
import { toast } from 'sonner';

interface StatusDisplayProps {
  instanceId: string;
  onStatusChange?: () => void;
  autoRefresh?: boolean;
  loadOnMount?: boolean;
  initialStatus?: any;
}

export function StatusDisplay({
  instanceId,
  onStatusChange,
  autoRefresh = false,
  loadOnMount = true,
  initialStatus,
}: StatusDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(initialStatus || { status: 'unknown' });

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await instancesApi.getStatus(instanceId);
      setStatus(data);
      
      // Se status mudou para connected, notifica parent
      if (data.status === 'connected' && onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao buscar status';
      toast.error(msg);
      console.error(error);
      // mantém último status, mas registra erro para exibir
      setStatus((prev: any) => ({ ...(prev || {}), error: msg }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (loadOnMount) {
      loadStatus();
    }

    if (!autoRefresh) return;
    // Auto-refresh a cada 30 segundos para evitar excesso de chamadas
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [instanceId, autoRefresh, loadOnMount]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Status da Conexão</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado</span>
          <Badge variant={status.status === 'connected' ? 'default' : 'destructive'}>
            {status.status === 'connected' ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {status.status === 'connected' ? 'Conectado' : status.status || 'Desconhecido'}
          </Badge>
        </div>

        {status.profileName && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nome do Perfil</span>
            <span className="text-sm text-muted-foreground">{status.profileName}</span>
          </div>
        )}

        {status.isBusiness !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tipo de Conta</span>
            <Badge variant="outline">
              {status.isBusiness ? 'Business' : 'Pessoal'}
            </Badge>
          </div>
        )}

        {status.status === 'connected' && (
          <div className="pt-4 border-t">
            <p className="text-sm text-green-600 font-medium">
              ✓ Instância conectada e pronta para uso!
            </p>
          </div>
        )}

        {status.error && (
          <div className="pt-4 border-t">
            <p className="text-sm text-yellow-600">
              ⚠ {status.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
