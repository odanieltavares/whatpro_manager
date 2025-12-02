'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Image, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MessagesPage() {
  const [number, setNumber] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendText = async () => {
    if (!number || !text) {
      toast.error('Preencha o número e a mensagem');
      return;
    }

    setLoading(true);
    try {
      // Simulação
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Mensagem enviada com sucesso!');
      setText('');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
        <p className="text-muted-foreground">Envie mensagens via WhatsApp</p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList>
          <TabsTrigger value="text">
            <Send className="mr-2 h-4 w-4" />
            Texto
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="mr-2 h-4 w-4" />
            Mídia
          </TabsTrigger>
          <TabsTrigger value="document">
            <FileText className="mr-2 h-4 w-4" />
            Documento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem de Texto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número (com DDI)</Label>
                <Input
                  id="number"
                  placeholder="5511999999999"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: DDI + DDD + Número (apenas números)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Mensagem</Label>
                <Textarea
                  id="text"
                  placeholder="Digite sua mensagem..."
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <Button onClick={handleSendText} disabled={loading} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <Image className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Envio de Mídia</h3>
                  <p className="text-sm text-muted-foreground">
                    Em desenvolvimento - Em breve você poderá enviar imagens e vídeos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Envio de Documentos</h3>
                  <p className="text-sm text-muted-foreground">
                    Em desenvolvimento - Em breve você poderá enviar PDFs e documentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
