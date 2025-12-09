'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { instancesApi } from '@/lib/api/endpoints/instances';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateInstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateInstanceDialog({ open, onOpenChange, onSuccess }: CreateInstanceDialogProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<'EVOLUTION' | 'UAZAPI'>('EVOLUTION');
  const [baseUrl, setBaseUrl] = useState('https://evo.whatpro.com.br');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await instancesApi.create({
        provider,
        name: name.trim(),
      });

      toast.success('Instância criada com sucesso!');
      setName('');
      setProvider('EVOLUTION');
      setBaseUrl('https://evo.whatpro.com.br');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create instance:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar instância');
    } finally {
      setLoading(false);
    }
  };

  // Auto-preencher Base URL quando provider mudar
  const handleProviderChange = (value: 'EVOLUTION' | 'UAZAPI') => {
    setProvider(value);
    // Auto-preencher com URL padrão, mas permite edição
    if (value === 'EVOLUTION') {
      setBaseUrl('https://evo.whatpro.com.br');
    } else if (value === 'UAZAPI') {
      setBaseUrl('https://whatpro.uazapi.com');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Instância</DialogTitle>
          <DialogDescription>
            Crie uma nova instância do WhatsApp para gerenciar seus contatos e mensagens.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Instância <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="whatpro_demo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Identificador único para esta instância
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">
              Provider <span className="text-red-500">*</span>
            </Label>
            <Select
              value={provider}
              onValueChange={handleProviderChange}
              disabled={loading}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EVOLUTION">Evolution API</SelectItem>
                <SelectItem value="UAZAPI">Uazapi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">
              Base URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="baseUrl"
              placeholder="https://evo.whatpro.com.br"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              URL do servidor do provider (preenchido automaticamente)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Token de API:</strong> Será gerado automaticamente pelo provider após a criação.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Instância'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
