'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, Trash2, RefreshCw, Wifi, WifiOff, Server } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { UazapiInstance } from '@/types/uazapi';

export default function InstancesPage() {
  const [instances, setInstances] = useState<UazapiInstance[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<UazapiInstance | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [qrCode, setQRCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }

    setLoading(true);
    try {
      // Simulação - você substituirá pela chamada real da API
      const newInstance: UazapiInstance = {
        id: Math.random().toString(36).substring(7),
        token: Math.random().toString(36).substring(7),
        status: 'disconnected',
        name: instanceName,
      };

      setInstances([...instances, newInstance]);
      setShowCreateDialog(false);
      setInstanceName('');
      toast.success('Instância criada com sucesso!');
      
      // Mostrar QR Code
      setSelectedInstance(newInstance);
      setQRCode('https://via.placeholder.com/300?text=QR+Code');
      setShowQRDialog(true);
    } catch (error) {
      toast.error('Erro ao criar instância');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstance = async (instance: UazapiInstance) => {
    try {
      setInstances(instances.filter((i) => i.id !== instance.id));
      toast.success('Instância removida');
    } catch (error) {
      toast.error('Erro ao remover instância');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instâncias</h1>
          <p className="text-muted-foreground">Gerencie suas instâncias WhatsApp</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Instância
        </Button>
      </div>

      {instances.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-4">
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhuma instância criada</h3>
              <p className="text-sm text-muted-foreground">
                Crie sua primeira instância para começar a usar o WhatsApp
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Instância
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => (
            <Card key={instance.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{instance.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {instance.id}
                    </p>
                  </div>
                  <Badge variant={instance.status === 'connected' ? 'default' : 'secondary'}>
                    {instance.status === 'connected' ? (
                      <Wifi className="mr-1 h-3 w-3" />
                    ) : (
                      <WifiOff className="mr-1 h-3 w-3" />
                    )}
                    {instance.status}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedInstance(instance);
                      setQRCode('https://via.placeholder.com/300?text=QR+Code');
                      setShowQRDialog(true);
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInstance(instance)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Instância</DialogTitle>
            <DialogDescription>
              Crie uma nova instância WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Instância</Label>
              <Input
                id="name"
                placeholder="Ex: Atendimento Principal"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateInstance}
                disabled={loading}
              >
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com o aplicativo do WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-lg border p-4 bg-white">
              <img
                src={qrCode}
                alt="QR Code"
                className="h-64 w-64"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Abra o WhatsApp → Aparelhos conectados → Conectar um aparelho
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
