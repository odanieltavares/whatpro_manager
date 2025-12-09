/**
 * Instance Types
 */

export interface Instance {
  id: string;
  tenantId: string;
  projectId?: string | null;
  provider: string;
  instanceIdentifier: string;
  status: string;
  baseUrl: string;
  apiToken?: string; // Optional, sanitized in responses
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
  behavior?: InstanceBehavior;
  instanceChatwootConfig?: InstanceChatwootConfig;
}

export interface InstanceBehavior {
  id: string;
  instanceId: string;
  rejectCall: boolean;
  msgCall?: string | null;
  groupsIgnore: boolean;
  alwaysOnline: boolean;
  readMessages: boolean;
  readStatus: boolean;
  syncFullHistory: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstanceChatwootConfig {
  id: string;
  instanceId: string;
  chatwootUrl?: string | null;
  chatwootAccountId?: number | null;
  chatwootUserToken?: string | null;
  inboxId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstanceRequest {
  provider: 'EVOLUTION' | 'UAZAPI';
  name: string;
  systemName?: string;
  adminField01?: string;
  adminField02?: string;
  projectId?: string;
}

export interface UpdateInstanceRequest {
  instanceIdentifier?: string;
  baseUrl?: string;
  apiToken?: string;
  status?: string;
}

export interface QRCodeResponse {
  qrcode: string;
  pairingCode?: string;
  message?: string;
  expiresIn?: number;
}

export interface PaircodeRequest {
  phoneNumber: string;
}

export interface PaircodeResponse {
  code: string;
  expiresIn?: number;
}

export interface InstanceStatus {
  status: string;
  profileName?: string;
  profilePictureUrl?: string;
  accountType?: 'personal' | 'business';
}
