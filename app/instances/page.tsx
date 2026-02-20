/**
 * Instances Page (Simplified - No Auth)
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Server, Wifi, WifiOff, Loader2, RefreshCcw, Search, MoreVertical, Trash2, Settings, QrCode } from 'lucide-react';
import { instancesApi } from '@/lib/api/endpoints/instances';
import type { Instance } from '@/lib/api/types/instance.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateInstanceDialog } from '@/components/create-instance-dialog';
import { DeleteInstanceDialog } from '@/components/delete-instance-dialog';

export default function InstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<Instance | null>(null);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const data = await instancesApi.list();
      setInstances(data || []); 
    } catch (error: unknown) {
      console.error('Failed to load instances:', error);
      setInstances([]);
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

  const handleInstanceDeleted = () => {
    setInstanceToDelete(null);
    loadInstances();
  };

  const handleSyncInstances = async () => {
    try {
      setSyncing(true);
      const result = await instancesApi.sync();
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

  // Filter instances based on search term
  const filteredInstances = instances.filter(instance => {
    const searchLower = searchTerm.toLowerCase();
    return (
      instance.instanceIdentifier.toLowerCase().includes(searchLower) ||
      instance.profileName?.toLowerCase().includes(searchLower) ||
      instance.phoneNumber?.includes(searchLower) ||
      instance.provider.toLowerCase().includes(searchLower)
    );
  });

  if (loading && !instances.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instâncias</h1>
          <p className="text-muted-foreground">
            Gerencie suas conexões do WhatsApp
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
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

      {/* Search Bar */}
      {instances.length > 0 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, número ou provider..."
            className="pl-9 max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && instances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Server className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma instância encontrada</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Crie sua primeira instância para começar a gerenciar mensagens e automações do WhatsApp.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Instância
            </Button>
          </CardContent>
        </Card>
      ) : filteredInstances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Search className="w-10 h-10 mb-4 opacity-20" />
          <p>Nenhuma instância encontrada para &quot;{searchTerm}&quot;</p>
          <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2">
            Limpar filtro
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredInstances.map((instance) => {
             const isConnected = instance.status === 'connected' || instance.status === 'open';
             const isConnecting = instance.status === 'connecting';
             
             return (
              <Card key={instance.id} className="group hover:shadow-md transition-all border-l-4" style={{ 
                borderLeftColor: isConnected ? '#22c55e' : isConnecting ? '#eab308' : '#ef4444' 
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`p-1.5 rounded-full ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <CardTitle className="text-base truncate" title={instance.instanceIdentifier}>
                          {instance.instanceIdentifier}
                        </CardTitle>
                        <CardDescription className="text-xs truncate">
                          {instance.provider}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/instances/${instance.id}`)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/instances/${instance.id}?tab=connection`)}>
                          <QrCode className="w-4 h-4 mr-2" />
                          Ver QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="focus:bg-red-50 dark:focus:bg-red-950/20 text-red-600 focus:text-red-700"
                          onClick={() => setInstanceToDelete(instance)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Status Indicator */}
                    <div className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded-md">
                      <span className="text-muted-foreground text-xs">Status</span>
                      <div className="flex items-center gap-1.5">
                        {isConnected ? (
                          <Wifi className="w-3.5 h-3.5 text-green-500" />
                        ) : isConnecting ? (
                          <Wifi className="w-3.5 h-3.5 text-yellow-500" />
                        ) : (
                          <WifiOff className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className={`font-medium text-xs ${
                          isConnected ? 'text-green-600 dark:text-green-400' : 
                          isConnecting ? 'text-yellow-600 dark:text-yellow-400' : 
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {instance.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Quick Info */}
                    {instance.profileName && (
                      <div className="text-xs text-muted-foreground truncate">
                        <span className="font-medium text-foreground">{instance.profileName}</span>
                        {instance.phoneNumber && <span className="ml-1 opacity-70">({instance.phoneNumber})</span>}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => router.push(`/instances/${instance.id}`)}
                      >
                        Gerenciar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateInstanceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleInstanceCreated}
      />
      
      {instanceToDelete && (
        <DeleteInstanceDialog 
          open={!!instanceToDelete}
          onOpenChange={(open) => !open && setInstanceToDelete(null)}
          instanceName={instanceToDelete.instanceIdentifier}
          provider={instanceToDelete.provider}
          onConfirm={async (deleteFromApi) => {
            try {
              await instancesApi.delete(instanceToDelete.id, deleteFromApi);
              toast.success('Instância removida com sucesso');
              handleInstanceDeleted();
            } catch (error) {
              console.error(error);
              toast.error('Erro ao remover instância');
            }
          }}
        />
      )}
    </div>
  );
}
