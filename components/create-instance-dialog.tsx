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
import { PROVIDERS } from '@/lib/constants';

interface CreateInstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateInstanceDialog({ open, onOpenChange, onSuccess }: CreateInstanceDialogProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<keyof typeof PROVIDERS>('EVOLUTION');
  const [baseUrl, setBaseUrl] = useState<string>(PROVIDERS.EVOLUTION.DEFAULT_URL);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    try {
      await instancesApi.create({
        provider,
        name: name.trim(),
        // We might want to pass baseUrl here if the API supported it in the create payload,
        // effectively overriding the default if needed. For now sticking to the interface.
      });

      toast.success('Instância criada com sucesso!');
      setName('');
      setProvider('EVOLUTION');
      setBaseUrl(PROVIDERS.EVOLUTION.DEFAULT_URL);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create instance:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar instância');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: keyof typeof PROVIDERS) => {
    setProvider(value);
    setBaseUrl(PROVIDERS[value].DEFAULT_URL);
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
              placeholder="ex: atendimento_comercial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Identificador único (sem espaços ou caracteres especiais)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">
              Provider <span className="text-red-500">*</span>
            </Label>
            <Select
              value={provider}
              onValueChange={(val) => handleProviderChange(val as keyof typeof PROVIDERS)}
              disabled={loading}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PROVIDERS).map((p) => (
                  <SelectItem key={p.NAME} value={p.NAME}>
                    {p.LABEL}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">
              Base URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Endpoint do serviço de integração
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <span className="text-base">ℹ️</span>
              <span>
                <strong>Token de API:</strong> Será gerado e configurado automaticamente.
              </span>
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
