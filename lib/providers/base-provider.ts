/**
 * Base Provider Interface
 * Defines standard interface for WhatsApp providers (UAZ API, Evolution API)
 */

export interface InstanceData {
  id: string;
  name: string;
  token: string;
  status: 'connected' | 'disconnected' | 'connecting';
  profileName?: string;
  profilePicUrl?: string;
  phoneNumber?: string;
  isBusiness?: boolean;
  systemName?: string;
  owner?: string;
  ownerJid?: string;
  integration?: string;
  businessId?: string;
  lastDisconnect?: string;
  lastDisconnectReason?: string;
}

export interface QRCodeResponse {
  qrcode: string; // base64 data:image/png;base64,...
  expiresIn?: number; // seconds
  pairingCode?: string; // para providers que retornam código de pareamento junto (Evolution)
}

export interface PaircodeResponse {
  code: string; // 8-digit code
  expiresIn?: number; // seconds
}

export interface CreateInstanceRequest {
  name: string;
  systemName?: string;
  adminField01?: string;
  adminField02?: string;
}

/**
 * WhatsApp Provider Interface
 * All providers must implement these methods
 */
export interface IWhatsAppProvider {
  /**
   * List all instances from this provider
   */
  listInstances(): Promise<InstanceData[]>;

  /**
   * Create a new instance
   */
  createInstance(request: CreateInstanceRequest): Promise<InstanceData>;

  /**
   * Get instance status and details
   */
  getStatus(instanceToken: string): Promise<InstanceData>;

  /**
   * Generate QR Code for connection
   */
  generateQRCode(instanceToken: string): Promise<QRCodeResponse>;

  /**
   * Generate paircode for connection
   */
  generatePaircode(instanceToken: string, phone: string): Promise<PaircodeResponse>;

  /**
   * Disconnect instance
   */
  disconnect(instanceToken: string): Promise<void>;

  /**
   * Delete instance from provider API
   */
  deleteInstance(instanceToken: string): Promise<void>;
}
