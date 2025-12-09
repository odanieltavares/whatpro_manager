'use client';

/**
 * Página de Detalhes da Instância
 * /instances/[id]
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Save, Trash2 } from 'lucide-react';
import { instancesApi } from '@/lib/api/endpoints/instances';
import type { Instance } from '@/lib/api/types/instance.types';
import { toast } from 'sonner';
import { QRCodeDisplay } from '@/components/qrcode-display';
import { PaircodeGenerator } from '@/components/paircode-generator';
import { StatusDisplay } from '@/components/status-display';

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const instanceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instance, setInstance] = useState<any>(null);
  const [behavior, setBehavior] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [chatwootConfig, setChatwootConfig] = useState<any>(null);
  const [savingChatwoot, setSavingChatwoot] = useState(false);
  const [tab, setTab] = useState<string>('overview');

  useEffect(() => {
    loadInstance();
  }, [instanceId]);

  async function loadInstance() {
    try {
      setLoading(true);
      const data = await instancesApi.get(instanceId);
      setInstance(data);
      
      if (data.behavior) {
        setBehavior(data.behavior);
      }
      if (data.instanceChatwootConfig) {
        setChatwootConfig(data.instanceChatwootConfig);
      }
    } catch (error: unknown) {
      setInstance(null);
      setBehavior(null);
      setChatwootConfig(null);
      toast.error('Erro ao carregar instância');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveBehavior() {
    try {
      setSaving(true);
      await instancesApi.updateBehavior(instanceId, behavior);
      toast.success('Comportamento atualizado!');
      loadInstance();
    } catch (error: unknown) {
      toast.error('Erro ao salvar');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function refreshStatus() {
    try {
      await instancesApi.getStatus(instanceId);
      await loadInstance();
      toast.success('Status atualizado');
    } catch (error: unknown) {
      toast.error('Erro ao atualizar status');
      console.error(error);
    }
  }

  async function generateQr() {
    try {
      await instancesApi.generateQRCode(instanceId);
      toast.success('QR Code atualizado');
      await loadInstance();
    } catch (error: unknown) {
      toast.error('Erro ao gerar QR');
      console.error(error);
    }
  }

  async function disconnectInstance() {
    try {
      await fetch(`/api/instances/${instanceId}/disconnect`, { method: 'POST' });
      await loadInstance();
      toast.success('Instância desconectada');
    } catch (error: unknown) {
      toast.error('Erro ao desconectar instância');
      console.error(error);
    }
  }

  function copyToClipboard(value: string, label: string) {
    if (!value) {
      toast.error(`Nada para copiar em ${label}`);
      return;
    }
    navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} copiado`),
      () => toast.error(`Falha ao copiar ${label}`)
    );
  }

  async function deleteInstance() {
    if (!window.confirm('Tem certeza que deseja excluir esta instância?')) return;
    try {
      setDeleting(true);
      await instancesApi.delete(instanceId);
      toast.success('Instância excluída');
      router.push('/instances');
    } catch (error: unknown) {
      toast.error('Erro ao excluir instância');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  async function saveChatwoot() {
    try {
      setSavingChatwoot(true);
      const payload = {
        chatwootUrl: chatwootConfig?.chatwootUrl || null,
        chatwootAccountId: chatwootConfig?.chatwootAccountId
          ? Number(chatwootConfig.chatwootAccountId)
          : null,
        chatwootUserToken: chatwootConfig?.chatwootUserToken || null,
        inboxId: chatwootConfig?.inboxId ? Number(chatwootConfig.inboxId) : null,
        inboxStatus: chatwootConfig?.inboxStatus || null,
        logInbox: chatwootConfig?.logInbox || false,
      };
      const response = await fetch(`/api/instances/${instanceId}/chatwoot`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saved = await response.json();
      setChatwootConfig(saved);
      toast.success('Chatwoot salvo');
    } catch (error: unknown) {
      toast.error('Erro ao salvar Chatwoot');
      console.error(error);
    } finally {
      setSavingChatwoot(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Instância não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/instances')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {instance.instanceIdentifier || instance.name || 'Instância'}
            </h1>
            <p className="text-muted-foreground">{instance.provider.toUpperCase()}</p>
          </div>
          <Badge variant={instance.status === 'connected' ? 'default' : 'destructive'}>
            {instance.status === 'connected' ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {instance.status}
          </Badge>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteInstance}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Excluir
          </Button>
        </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="chatwoot">Chatwoot</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">ID</Label>
                  <p className="font-mono text-sm">{instance.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Provider</Label>
                  <p>{instance.provider}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Base URL</Label>
                  <p className="text-sm">{instance.baseUrl}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{instance.status}</p>
                </div>
                {instance.tenant && (
                  <div>
                    <Label className="text-muted-foreground">Tenant</Label>
                    <p>{instance.tenant.name}</p>
                  </div>
                )}
                {instance.project && (
                  <div>
                    <Label className="text-muted-foreground">Projeto</Label>
                    <p>{instance.project.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connection */}
        <TabsContent value="connection" className="space-y-4">
          {/*
            Mostrar ações e QR apenas quando desconectada.
            Quando conectada, só permitem status/desc. (QR/Paircode ocultos).
          */}
          {(() => {
            const isConnected = instance.status === 'connected';
            return (
              <>
          <Card>
            <CardHeader>
              <CardTitle>Conectar Instância</CardTitle>
              <CardDescription>
                Conecte sua instância WhatsApp usando QR Code ou Código de Pareamento. Sempre visível para copiar token e dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Token da instância</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm break-all flex-1">{instance.apiToken || '---'}</p>
                    {instance.apiToken && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(instance.apiToken, 'Token')}
                      >
                        Copiar
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usuário / Owner JID</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm flex-1">
                      {instance.ownerJid || instance.phoneNumber || '---'}
                    </p>
                    {(instance.ownerJid || instance.phoneNumber) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            instance.ownerJid || instance.phoneNumber,
                            'Usuário/Owner JID'
                          )
                        }
                      >
                        Copiar
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" onClick={refreshStatus}>
                  Atualizar status
                </Button>
                <Button
                  variant="outline"
                  onClick={generateQr}
                  disabled={isConnected}
                >
                  Gerar/atualizar QR
                </Button>
                <Button variant="outline" onClick={disconnectInstance}>
                  Desconectar
                </Button>
              </div>

              {!isConnected && (
                <>
                  {/* QR Code Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Opção 1: QR Code</h3>
                        <p className="text-sm text-muted-foreground">
                          Escaneie o QR code com seu WhatsApp
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={generateQr}
                        disabled={isConnected}
                      >
                        Gerar/atualizar QR
                      </Button>
                    </div>
                    <QRCodeDisplay instanceId={instanceId} />
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Ou</span>
                    </div>
                  </div>

                  {/* Paircode Section (Uazapi + Evolution) */}
                  {['uazapi', 'evolution'].includes(instance.provider.toLowerCase()) && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Opção 2: Código de Pareamento</h3>
                          <p className="text-sm text-muted-foreground">
                            Use um código de 8 dígitos para conectar
                          </p>
                        </div>
                      </div>
                      <PaircodeGenerator instanceId={instanceId} provider={instance.provider} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <StatusDisplay
            instanceId={instanceId}
            onStatusChange={loadInstance}
            loadOnMount={!isConnected}
            autoRefresh={!isConnected}
            initialStatus={{
              status: instance.status,
              profileName: instance.profileName,
              profilePicUrl: instance.profilePicUrl,
              isBusiness: instance.isBusiness,
              ownerJid: instance.ownerJid,
              phoneNumber: instance.phoneNumber,
            }}
          />
              </>
            );
          })()}
        </TabsContent>

        {/* Behavior */}
        <TabsContent value="behavior" className="space-y-4">
          {behavior && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Comportamento Geral</CardTitle>
                  <CardDescription>
                    Configure como a instância deve se comportar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ignorar Grupos</Label>
                      <p className="text-sm text-muted-foreground">
                        Não processar mensagens de grupos
                      </p>
                    </div>
                    <Switch
                      checked={behavior.groupsIgnore}
                      onCheckedChange={(checked) =>
                        setBehavior({ ...behavior, groupsIgnore: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sempre Online</Label>
                      <p className="text-sm text-muted-foreground">
                        Manter status sempre online
                      </p>
                    </div>
                    <Switch
                      checked={behavior.alwaysOnline}
                      onCheckedChange={(checked) =>
                        setBehavior({ ...behavior, alwaysOnline: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ler Mensagens</Label>
                      <p className="text-sm text-muted-foreground">
                        Marcar mensagens como lidas automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={behavior.readMessages}
                      onCheckedChange={(checked) =>
                        setBehavior({ ...behavior, readMessages: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CallReject</CardTitle>
                  <CardDescription>
                    Rejeitar chamadas automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rejeitar Chamadas</Label>
                      <p className="text-sm text-muted-foreground">
                        Recusar chamadas automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={behavior.autoRejectCalls}
                      onCheckedChange={(checked) =>
                        setBehavior({ ...behavior, autoRejectCalls: checked })
                      }
                    />
                  </div>

                  {behavior.autoRejectCalls && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enviar Mensagens Automáticas</Label>
                          <p className="text-sm text-muted-foreground">
                            Após rejeitar, enviar mensagens
                          </p>
                        </div>
                        <Switch
                          checked={behavior.autoReplyCallsEnabled}
                          onCheckedChange={(checked) =>
                            setBehavior({ ...behavior, autoReplyCallsEnabled: checked })
                          }
                        />
                      </div>

                      {behavior.autoReplyCallsEnabled && (
                        <div className="space-y-2">
                          <Label>Mensagens</Label>
                          <Textarea
                            placeholder="Uma mensagem por linha"
                            rows={3}
                            value={
                              Array.isArray(behavior.autoReplyCallsMessages)
                                ? behavior.autoReplyCallsMessages.map((m: any) => m.text).join('\n')
                                : ''
                            }
                            onChange={(e) => {
                              const lines = e.target.value.split('\n');
                              setBehavior({
                                ...behavior,
                                autoReplyCallsMessages: lines.map((text, i) => ({
                                  order: i + 1,
                                  text,
                                })),
                              });
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveBehavior} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Chatwoot */}
        <TabsContent value="chatwoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Chatwoot</CardTitle>
              <CardDescription>Vincule esta instância a uma inbox do Chatwoot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chatwoot URL</Label>
                  <Input
                    value={chatwootConfig?.chatwootUrl || ''}
                    onChange={(e) =>
                      setChatwootConfig({ ...chatwootConfig, chatwootUrl: e.target.value })
                    }
                    placeholder="https://chatwoot.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account ID</Label>
                  <Input
                    type="number"
                    value={chatwootConfig?.chatwootAccountId || ''}
                    onChange={(e) =>
                      setChatwootConfig({
                        ...chatwootConfig,
                        chatwootAccountId: e.target.value,
                      })
                    }
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Token</Label>
                  <Input
                    value={chatwootConfig?.chatwootUserToken || ''}
                    onChange={(e) =>
                      setChatwootConfig({
                        ...chatwootConfig,
                        chatwootUserToken: e.target.value,
                      })
                    }
                    placeholder="token"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inbox ID</Label>
                  <Input
                    type="number"
                    value={chatwootConfig?.inboxId || ''}
                    onChange={(e) =>
                      setChatwootConfig({
                        ...chatwootConfig,
                        inboxId: e.target.value,
                      })
                    }
                    placeholder="456"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={chatwootConfig?.logInbox || false}
                  onCheckedChange={(checked) =>
                    setChatwootConfig({ ...chatwootConfig, logInbox: checked })
                  }
                />
                <Label>Log Inbox</Label>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveChatwoot} disabled={savingChatwoot}>
                  {savingChatwoot ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Chatwoot
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
