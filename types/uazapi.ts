// Uazapi API Types
export interface UazapiInstance {
  id: string;
  token: string;
  status: 'disconnected' | 'connecting' | 'connected';
  paircode?: string;
  qrcode?: string;
  name: string;
  profileName?: string;
  profilePicUrl?: string;
  isBusiness?: boolean;
  plataform?: string;
  systemName?: string;
  owner?: string;
  lastDisconnect?: string;
  createdAt?: string;
}

export interface CreateInstanceRequest {
  name: string;
  owner?: string;
}

export interface SendTextMessage {
  number: string;
  text: string;
}

export interface SendMediaMessage {
  number: string;
  caption?: string;
  media: string | File;
}

export interface WebhookConfig {
  url: string;
  events?: string[];
}

export interface ChatwootConfig {
  accountId: string;
  inboxId: string;
  apiKey: string;
  url: string;
}

export interface MessageEvent {
  id: string;
  from: string;
  to: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  timestamp: number;
}
