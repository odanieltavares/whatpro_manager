'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MaskedTokenDisplayProps {
  token: string;
  label?: string;
}

export function MaskedTokenDisplay({ token, label = 'Token' }: MaskedTokenDisplayProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskToken = (token: string) => {
    if (!token || token.length < 8) return '***';
    return `${token.slice(0, 4)}...${token.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success('Token copiado para área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar token');
    }
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm select-all">
          {visible ? token : maskToken(token)}
        </code>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setVisible(!visible)}
          title={visible ? 'Ocultar token' : 'Mostrar token'}
          type="button"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          title="Copiar token"
          type="button"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
