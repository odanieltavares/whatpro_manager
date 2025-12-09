'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Copy, Check } from 'lucide-react';
import { instancesApi } from '@/lib/api/endpoints/instances';
import { toast } from 'sonner';
import Image from 'next/image';

interface QRCodeDisplayProps {
  instanceId: string;
}

export function QRCodeDisplay({ instanceId }: QRCodeDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isImage = qrCode ? qrCode.startsWith('data:image') || qrCode.startsWith('http') : false;

  const loadQRCode = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      setPairingCode(null); // Clear previous pairing code
      const data = await instancesApi.generateQRCode(instanceId);
      let code = data.qrcode as string | undefined;
      const pairing = data.pairingCode as string | undefined;

      if (!code && !pairing) {
        throw new Error('QR Code não retornado pelo provider');
      }

      // If it doesn't start with data:image and looks like base64 PNG, prefix it.
      if (code && !code.startsWith('data:image') && /^[A-Za-z0-9+/]+=*$/.test(code)) {
        code = `data:image/png;base64,${code}`;
      }

      setQrCode(code || null);
      setPairingCode(pairing || null);
      toast.success(data.message || 'QR/Pairing code gerado!');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error?.message ||
        'Erro ao gerar QR code';
      setError(msg);
      toast.error(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-muted/50">
      {qrCode ? (
        <>
      <div className="bg-white p-4 rounded-lg">
        {isImage ? (
          <Image
            src={qrCode}
            alt="QR Code"
            width={256}
            height={256}
            className="w-64 h-64"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-lg font-mono font-bold break-all text-center">{qrCode}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(qrCode);
                setCopied(true);
                toast.success('Código copiado');
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copiar código
            </Button>
          </div>
        )}
      </div>
          <p className="text-sm text-muted-foreground text-center">
            Abra o WhatsApp no seu celular → Menu (⋮) → Aparelhos conectados → Conectar um aparelho
          </p>
          <Button onClick={loadQRCode} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Gerar Novo QR Code
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full">
          {error && (
            <p className="text-sm text-yellow-700 text-center">
              ⚠ {error}
            </p>
          )}
          {pairingCode && !qrCode && (
            <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border w-full">
              <p className="text-lg font-mono font-bold break-all text-center">{pairingCode}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(pairingCode);
                  setCopied(true);
                  toast.success('Pairing code copiado');
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copiar pairing code
              </Button>
            </div>
          )}
          <Button onClick={loadQRCode} disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Gerando...' : 'Gerar QR Code'}
          </Button>
        </div>
      )}
    </div>
  );
}
