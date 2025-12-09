/**
 * Instances Page (Simplified - No Auth)
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Server, Wifi, WifiOff, Loader2, RefreshCcw } from 'lucide-react';
import { instancesApi } from '@/lib/api/endpoints/instances';
import type { Instance } from '@/lib/api/types/instance.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateInstanceDialog } from '@/components/create-instance-dialog';

export default function InstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const data = await instancesApi.list();
      setInstances(data || []); // Ensure we always have an array
    } catch (error: unknown) {
      console.error('Failed to load instances:', error);
      setInstances([]); // Set empty array on error to prevent undefined
      toast.error('Erro ao carregar instâncias. Verifique se o banco de dados está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  const handleInstanceCreated = () => {
    setShowCreateDialog(false);
    loadInstances();
  };

  const handleSyncInstances = async () => {
    try {
      setSyncing(true);
      // Note: This endpoint needs to be added to instancesApi or a separate sync API
      const response = await fetch('/api/sync-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      await loadInstances();
      toast.success(
        `Sincronizado: ${result.created} criadas, ${result.updated} atualizadas, ${result.removed} removidas`
      );
      if (result.errors && result.errors.length > 0) {
        toast.error(`Erros na sync: ${result.errors.join('; ')}`);
      }
    } catch (error: unknown) {
      console.error('Failed to sync instances:', error);
      toast.error('Erro ao sincronizar instâncias');
    } finally {
      setSyncing(false);
    }
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
          <h1 className="text-3xl font-bold">Instâncias</h1>
          <p className="text-muted-foreground">
            Gerencie suas instâncias WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncInstances} disabled={syncing}>
            {syncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4 mr-2" />
            )}
            Sincronizar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Instância
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando instâncias...</span>
        </div>
      ) : !instances || instances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma instância encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              {!instances
                ? 'Erro ao carregar instâncias. Verifique se o banco de dados está rodando.'
                : 'Crie sua primeira instância para começar a usar o WhatPro Manager.'
              }
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Instância
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => (
            <Card key={instance.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    <CardTitle className="text-lg">{instance.instanceIdentifier}</CardTitle>
                  </div>
                  {instance.status === 'connected' ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  {instance.provider.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={instance.status === 'connected' ? 'text-green-500' : ''}>
                    {instance.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/instances/${instance.id}`)}
                  >
                    Configurar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/instances/${instance.id}?tab=connection`)}
                  >
                    Ver QR
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateInstanceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleInstanceCreated}
      />
    </div>
  );
}
