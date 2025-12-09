/**
 * Instances API Endpoints
 */

import { api } from '../client';
import type {
  Instance,
  CreateInstanceRequest,
  UpdateInstanceRequest,
  QRCodeResponse,
  PaircodeRequest,
  PaircodeResponse,
  InstanceStatus,
  InstanceBehavior,
} from '../types/instance.types';

export const instancesApi = {
  /**
   * List all instances for current tenant
   */
  list: async (): Promise<Instance[]> => {
    const { data } = await api.get<{ instances: Instance[] }>('/instances');
    return data.instances; // Extract array from wrapper
  },

  /**
   * Get instance by ID
   */
  get: async (id: string): Promise<Instance> => {
    const { data } = await api.get<Instance>(`/instances/${id}`);
    return data;
  },

  /**
   * Create new instance
   */
  create: async (payload: CreateInstanceRequest): Promise<Instance> => {
    const { data } = await api.post<Instance>('/instances', payload);
    return data;
  },

  /**
   * Update instance
   */
  update: async (id: string, payload: UpdateInstanceRequest): Promise<Instance> => {
    const { data } = await api.put<Instance>(`/instances/${id}`, payload);
    return data;
  },

  /**
   * Delete instance
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/instances/${id}`);
  },

  /**
   * Generate QR code for instance connection
   */
  generateQRCode: async (id: string): Promise<QRCodeResponse> => {
    const { data } = await api.get<QRCodeResponse>(`/instances/${id}/qrcode`);
    return data;
  },

  /**
   * Generate paircode for instance connection
   */
  generatePaircode: async (id: string, payload: PaircodeRequest): Promise<PaircodeResponse> => {
    const { data } = await api.post<PaircodeResponse>(`/instances/${id}/paircode`, payload);
    return data;
  },

  /**
   * Get real-time instance status
   */
  getStatus: async (id: string): Promise<InstanceStatus> => {
    const { data } = await api.get<InstanceStatus>(`/instances/${id}/status`);
    return data;
  },

  /**
   * Get instance behavior settings
   */
  getBehavior: async (id: string): Promise<InstanceBehavior> => {
    const { data } = await api.get<InstanceBehavior>(`/instances/${id}/behavior`);
    return data;
  },

  /**
   * Update instance behavior settings
   */
  updateBehavior: async (id: string, payload: Partial<InstanceBehavior>): Promise<InstanceBehavior> => {
    const { data } = await api.put<InstanceBehavior>(`/instances/${id}/behavior`, payload);
    return data;
  },
};
