import axios, { AxiosInstance } from 'axios';
import type { UazapiInstance, CreateInstanceRequest, SendTextMessage, SendMediaMessage, WebhookConfig } from '@/types/uazapi';

export class UazapiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private adminToken?: string;

  constructor(baseURL: string = 'https://free.uazapi.com', adminToken?: string) {
    this.baseURL = baseURL;
    this.adminToken = adminToken;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Instance Management
  async createInstance(data: CreateInstanceRequest): Promise<UazapiInstance> {
    const response = await this.client.post('/instance/create', data, {
      headers: { admintoken: this.adminToken },
    });
    return response.data;
  }

  async listInstances(): Promise<UazapiInstance[]> {
    const response = await this.client.get('/instances', {
      headers: { admintoken: this.adminToken },
    });
    return response.data;
  }

  async getInstance(instanceId: string, token: string): Promise<UazapiInstance> {
    const response = await this.client.get(`/instance/${instanceId}`, {
      headers: { token },
    });
    return response.data;
  }

  async deleteInstance(instanceId: string, token: string): Promise<void> {
    await this.client.delete(`/instance/${instanceId}`, {
      headers: { token },
    });
  }

  async getQRCode(token: string): Promise<{ qrcode: string }> {
    const response = await this.client.get('/instance/qrcode', {
      headers: { token },
    });
    return response.data;
  }

  async getPairCode(token: string): Promise<{ paircode: string }> {
    const response = await this.client.get('/instance/paircode', {
      headers: { token },
    });
    return response.data;
  }

  async disconnect(token: string): Promise<void> {
    await this.client.post('/instance/disconnect', {}, {
      headers: { token },
    });
  }

  // Messages
  async sendText(token: string, data: SendTextMessage): Promise<void> {
    await this.client.post('/send/text', data, {
      headers: { token },
    });
  }

  async sendImage(token: string, data: SendMediaMessage): Promise<void> {
    const formData = new FormData();
    formData.append('number', data.number);
    if (data.caption) formData.append('caption', data.caption);
    if (typeof data.media === 'string') {
      formData.append('url', data.media);
    } else {
      formData.append('file', data.media);
    }

    await this.client.post('/send/image', formData, {
      headers: { 
        token,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Webhooks
  async setWebhook(token: string, config: WebhookConfig): Promise<void> {
    await this.client.post('/instance/webhook', config, {
      headers: { token },
    });
  }

  async getWebhook(token: string): Promise<WebhookConfig> {
    const response = await this.client.get('/instance/webhook', {
      headers: { token },
    });
    return response.data;
  }
}

// Singleton instance
let uazapiClient: UazapiClient | null = null;

export function getUazapiClient(baseURL?: string, adminToken?: string): UazapiClient {
  if (!uazapiClient) {
    uazapiClient = new UazapiClient(
      baseURL || process.env.NEXT_PUBLIC_UAZAPI_URL || 'https://free.uazapi.com',
      adminToken || process.env.NEXT_PUBLIC_UAZAPI_ADMIN_TOKEN
    );
  }
  return uazapiClient;
}
