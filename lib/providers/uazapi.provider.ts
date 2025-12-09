/**
 * UAZ API Provider Implementation
 * Implements WhatsApp provider interface for UAZ API Go
 */

import {
  IWhatsAppProvider,
  InstanceData,
  QRCodeResponse,
  PaircodeResponse,
  CreateInstanceRequest
} from './base-provider';

export class UazapiProvider implements IWhatsAppProvider {
  private baseUrl: string;
  private adminToken?: string;
  private instanceToken?: string;

  constructor(
    baseUrl: string | { baseUrl: string; adminToken?: string; instanceToken?: string },
    adminToken?: string,
  ) {
    if (typeof baseUrl === 'string') {
      this.baseUrl = baseUrl;
      this.adminToken = adminToken;
    } else {
      this.baseUrl = baseUrl.baseUrl;
      this.adminToken = baseUrl.adminToken;
      this.instanceToken = baseUrl.instanceToken;
    }
  }

  async listInstances(): Promise<InstanceData[]> {
    const response = await fetch(`${this.baseUrl}/instance/all`, {
      headers: { 'admintoken': this.adminToken || '' }
    });

    if (!response.ok) {
      throw new Error(`Failed to list UAZ instances: ${response.statusText}`);
    }

    const instances = await response.json();
    return instances.map((inst: any) => this.mapToStandard(inst));
  }

  async createInstance(request: CreateInstanceRequest): Promise<InstanceData> {
    const response = await fetch(`${this.baseUrl}/instance/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'admintoken': this.adminToken || ''
      },
      body: JSON.stringify({
        name: request.name,
        systemName: request.systemName || 'WhatPro Manager',
        adminField01: request.adminField01,
        adminField02: request.adminField02
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create UAZ instance: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToStandard(data.instance);
  }

  async getStatus(instanceToken: string): Promise<InstanceData> {
    const response = await fetch(`${this.baseUrl}/instance/status`, {
      headers: { 'token': instanceToken }
    });

    if (!response.ok) {
      throw new Error(`Failed to get UAZ instance status: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToStandard(data.instance);
  }

  async generateQRCode(instanceToken: string): Promise<QRCodeResponse> {
    // Algumas versões exigem POST /instance/connect, outras GET /instance/qrcode
    const doPost = async () => {
      return fetch(`${this.baseUrl}/instance/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': instanceToken
        },
        body: JSON.stringify({ instancetoken: instanceToken })
      });
    };

    const doGet = async () => {
      return fetch(`${this.baseUrl}/instance/qrcode`, {
        method: 'GET',
        headers: {
          'token': instanceToken
        },
      });
    };

    let response = await doPost();
    if (!response.ok && (response.status === 404 || response.status === 409 || response.status === 429)) {
      // Fallback para GET ou já conectado/limitado
      response = await doGet();
    }

    const text = await response.text();

    if (!response.ok) {
      throw new Error(text || `Failed to generate QR code: ${response.statusText}`);
    }

    let data: any = {};
    try {
      data = JSON.parse(text || '{}');
    } catch (e) {
      // if not JSON, still proceed
    }

    const qrcode = data?.instance?.qrcode || data?.qrcode;
    if (!qrcode) {
      throw new Error(data?.error || 'Provider não retornou QR code');
    }
    
    return {
      qrcode,
      expiresIn: data?.expiresIn || 60 // 1 minute default
    };
  }

  async generatePaircode(instanceToken: string, phone: string): Promise<PaircodeResponse> {
    // Algumas versões da Uazapi expõem paircode via POST com body, outras GET com query ou path param.
    const endpoints = [
      { method: 'POST', url: `${this.baseUrl}/instance/paircode`, body: { phone } },
      { method: 'GET', url: `${this.baseUrl}/instance/paircode?phone=${encodeURIComponent(phone)}` },
      { method: 'GET', url: `${this.baseUrl}/instance/paircode/${encodeURIComponent(phone)}` },
    ] as const;

    let lastError: string | undefined;

    for (const ep of endpoints) {
      const init: RequestInit = {
        method: ep.method,
        headers: {
          'Content-Type': 'application/json',
          'token': instanceToken,
        },
      };
      if (ep.method === 'POST') {
        init.body = JSON.stringify(ep.body);
      }

      const response = await fetch(ep.url, init);
      if (response.ok) {
        const data = await response.json();
        return {
          code: data.paircode || data.code,
          expiresIn: data.expiresIn || 300,
        };
      }

      lastError = `${response.status} ${response.statusText}`;
      // tenta próximo formato
    }

    throw new Error(`Failed to generate paircode: ${lastError || 'unknown error'}`);
  }

  async disconnect(instanceToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/instance/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': instanceToken
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Failed to disconnect: ${response.statusText}`);
    }
  }

  async deleteInstance(instanceToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/instance/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'admintoken': this.adminToken || '',
        'token': instanceToken
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Failed to delete instance from Uazapi: ${response.statusText}`);
    }
  }

  async rejectCall(number: string, callId: string, instanceToken?: string): Promise<{ success: boolean; message?: string }> {
    const token = instanceToken || this.instanceToken;
    if (!token) {
      throw new Error('Instance token is required to reject call');
    }

    const response = await fetch(`${this.baseUrl}/call/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({
        number,
        id: callId,
      }),
    });

    if (!response.ok) {
      return { success: false, message: await response.text() };
    }

    const data = await response.json().catch(() => ({}));
    return { success: true, message: data?.response || 'Call rejected' };
  }

  /**
   * Map UAZ API response to standard format
   */
  private mapToStandard(raw: any): InstanceData {
    return {
      id: raw.id,
      name: raw.name,
      // ✅ Fix: Check multiple token field variants
      token: raw.apikey || raw.token || raw.apiToken,
      status: raw.status,
      profileName: raw.profileName,
      profilePicUrl: raw.profilePicUrl,
      phoneNumber: raw.owner,
      isBusiness: raw.isBusiness,
      systemName: raw.systemName,
      owner: raw.owner,
      // ✅ Fix: Add ownerJid extraction
      ownerJid: raw.ownerJid || raw.jid || raw.owner,
      lastDisconnect: raw.lastDisconnect,
      lastDisconnectReason: raw.lastDisconnectReason
    };
  }
}
