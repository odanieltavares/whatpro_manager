'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check } from 'lucide-react';
import { instancesApi } from '@/lib/api/endpoints/instances';
import { toast } from 'sonner';

interface PaircodeGeneratorProps {
  instanceId: string;
  provider: string;
}

export function PaircodeGenerator({ instanceId, provider }: PaircodeGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [paircode, setPaircode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isSupported = ['uazapi', 'evolution'].includes(provider.toLowerCase());

  async function generatePaircode() {
    if (!isSupported) {
      toast.error('Paircode não suportado para este provider');
      return;
    }

    if (!phone || phone.length < 10) {
      toast.error('Digite um número de telefone válido');
      return;
    }

    try {
      setLoading(true);
      const data = await instancesApi.generatePaircode(instanceId, {
        phoneNumber: phone.replace(/\D/g, ''), // Remove não-dígitos
      });
      setPaircode(data.code);
      toast.success('Código de pareamento gerado!');
    } catch (error: unknown) {
      toast.error('Erro ao gerar código');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function copyPaircode() {
    if (paircode) {
      await navigator.clipboard.writeText(paircode);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <Label htmlFor="phone">Número do WhatsApp</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="5511999999999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading || !!paircode || !isSupported}
        />
        <p className="text-xs text-muted-foreground">
          {isSupported
            ? 'Digite o número com código do país (ex: 5511999999999)'
            : 'Paircode não suportado para este provider'}
        </p>
      </div>

      {paircode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 p-6 bg-background rounded-lg border-2">
            <span className="text-4xl font-mono font-bold tracking-widest">
              {paircode}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={copyPaircode}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Abra o WhatsApp no celular</p>
            <p>2. Vá em Menu (⋮) → Aparelhos conectados</p>
            <p>3. Toque em "Conectar um aparelho"</p>
            <p>4. Selecione "Conectar com número de telefone"</p>
            <p>5. Digite o código acima</p>
          </div>
          <Button
            onClick={() => {
              setPaircode(null);
              setPhone('');
            }}
            variant="outline"
            className="w-full"
          >
            Gerar Novo Código
          </Button>
        </div>
      ) : (
        <Button onClick={generatePaircode} disabled={loading || !isSupported} className="w-full">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSupported ? (loading ? 'Gerando...' : 'Gerar Código') : 'Indisponível'}
        </Button>
      )}
    </div>
  );
}
