/**
 * Executions Page (Simplified - No Auth)
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { instancesApi } from '@/lib/api/endpoints/instances';
import { toast } from 'sonner';

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (direction !== 'all') params.append('direction', direction);
      if (statusFilter !== 'all') params.append('statusFinal', statusFilter);
      
      const response = await fetch('/api/event-executions?' + params.toString());
      const data = await response.json();
      
      setExecutions(data.executions || []);
      setStats(data.stats || {});
    } catch (error: any) {
      console.error('Failed to load executions:', error);
      toast.error('Erro ao carregar execuções');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, [direction, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDirectionBadge = (dir: string) => {
    const colors: Record<string, string> = {
      'wa_to_cw': 'bg-blue-500',
      'cw_to_wa': 'bg-purple-500',
    };
    return colors[dir] || 'bg-muted';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Execuções</h1>
          <p className="text-muted-foreground">
            Histórico de execuções de eventos
          </p>
        </div>
        <Button onClick={loadExecutions} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.ok || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Erros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.error || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Direção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="wa_to_cw">WhatsApp → Chatwoot</SelectItem>
              <SelectItem value="cw_to_wa">Chatwoot → WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ok">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Executions List */}
      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
          <CardDescription>
            {executions.length} execuções encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {executions.map((execution) => (
              <div
                key={execution.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(execution.statusFinal)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDirectionBadge(execution.direction)}>
                        {execution.direction}
                      </Badge>
                      <span className="text-sm font-medium">
                        {execution.instanceIdentifier}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(execution.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                {execution.errorMessage && (
                  <p className="text-sm text-red-500">{execution.errorMessage}</p>
                )}
              </div>
            ))}
            {executions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma execução encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
