/**
 * Evolution API Provider Implementation
 * Implements WhatsApp provider interface for Evolution API v2
 */

import {
  IWhatsAppProvider,
  InstanceData,
  QRCodeResponse,
  PaircodeResponse,
  CreateInstanceRequest
} from './base-provider';

export class EvolutionProvider implements IWhatsAppProvider {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  /**
   * Parâmetros esperados para pairing code (Evolution):
   * - exatamente 8 caracteres alfanuméricos (letras/números), ex: WZYEH1YY
   * - remove espaços e valida formato
   */
  private normalizePairingCode(raw: any): string | null {
    const code = (raw ?? '').toString().trim().replace(/\s+/g, '');
    if (/^[A-Za-z0-9]{8}$/.test(code)) {
      return code;
    }
    return null;
  }

  async listInstances(): Promise<InstanceData[]> {
    const response = await fetch(`${this.baseUrl}/instance/fetchInstances`, {
      headers: { 'apikey': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Failed to list Evolution instances: ${response.statusText}`);
    }

    const instances = await response.json();
    return instances.map((inst: any) => this.mapToStandard(inst));
  }

  async createInstance(request: CreateInstanceRequest): Promise<InstanceData> {
    const response = await fetch(`${this.baseUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey
      },
      body: JSON.stringify({
        instanceName: request.name,
        token: '', // Will be generated
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create Evolution instance: ${response.statusText}`);  
    }

    const data = await response.json();
    return this.mapToStandard(data.instance);
  }

  async getStatus(instanceName: string): Promise<InstanceData> {
    const response = await fetch(`${this.baseUrl}/instance/connectionState/${instanceName}`, {
      headers: { 'apikey': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Failed to get Evolution instance status: ${response.statusText}`);
    }

    const data = await response.json();
    const payload = data.instance || data;
    return this.mapToStandard(payload);
  }

  async generateQRCode(instanceName: string): Promise<QRCodeResponse> {
    const response = await fetch(`${this.baseUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': this.apiKey }
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Failed to generate QR code: ${response.statusText}`);
    }

    let data: any = {};
    try {
      data = JSON.parse(text || '{}');
    } catch (e) {
      // não era JSON, segue
    }

    // Evolution responde com várias formas:
    // - base64 (data:image/png;base64,...)
    // - code (string do QR)
    // - pairingCode (8 caracteres)
    const qrcode =
      data.base64 ||
      data.qrcode?.code ||
      data.qrcode ||
      data.code ||
      null;

    const pairingCode = this.normalizePairingCode(
      data.pairingCode || data.response?.pairingCode || data.paircode
    );

    return {
      qrcode,
      pairingCode: pairingCode || undefined,
      expiresIn: data?.expiresIn || 60
    };
  }

  async generatePaircode(instanceName: string, _phone: string): Promise<PaircodeResponse> {
    // Evolution retorna pairingCode no mesmo endpoint de connect
    const response = await fetch(`${this.baseUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': this.apiKey }
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Failed to generate pairing code: ${response.statusText}`);
    }

    let data: any = {};
    try {
      data = JSON.parse(text || '{}');
    } catch (e) {
      // ignore parse errors
    }

    // Prioriza pairingCode (ex.: "WZYEH1YY"); se não vier, tenta usar `code` quando for alfanumérico curto.
    const pairingCode =
      this.normalizePairingCode(
        data.pairingCode || data.response?.pairingCode || data.paircode
      ) ||
      this.normalizePairingCode(data.code);

    if (!pairingCode) {
      throw new Error('Pairing code (8 caracteres alfanuméricos) não retornado pelo provider');
    }

    return {
      code: pairingCode,
      expiresIn: data?.expiresIn || 300,
    };
  }

  async disconnect(instanceName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: { 'apikey': this.apiKey }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Failed to disconnect: ${response.statusText}`);
    }
  }

  /**
   * Map Evolution API response to standard format
   */
  private mapToStandard(raw: any): InstanceData {
    const statusRaw = raw?.connectionStatus || raw?.state || raw?.status;
    let status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

    if (typeof statusRaw === 'string') {
      const normalized = statusRaw.toLowerCase();
      if (['open', 'connected', 'ready'].includes(normalized)) {
        status = 'connected';
      } else if (['connecting', 'qrcode', 'pairing'].includes(normalized)) {
        status = 'connecting';
      }
    }

    return {
      id: raw.id || raw.instanceId || raw.instanceName || raw.name,
      name: raw.name || raw.instanceName,
      token: raw.token || raw.name || raw.instanceName,
      status,
      profileName: raw.profileName,
      profilePicUrl: raw.profilePicUrl,
      phoneNumber: raw.number,
      isBusiness: raw.businessId != null,
      ownerJid: raw.ownerJid,
      integration: raw.integration,
      businessId: raw.businessId
    };
  }
}
