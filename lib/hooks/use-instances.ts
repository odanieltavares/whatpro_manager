/**
 * Instances Custom Hooks
 * 
 * React Query hooks for instance management with caching and auto-invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instancesApi } from '@/lib/api/endpoints/instances';
import { toast } from 'sonner';
import type { 
  CreateInstanceRequest, 
  UpdateInstanceRequest,
  PaircodeRequest 
} from '@/lib/api/types/instance.types';

/**
 * Fetch all instances
 */
export const useInstances = () => {
  return useQuery({
    queryKey: ['instances'],
    queryFn: instancesApi.list,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

/**
 * Fetch single instance by ID
 */
export const useInstance = (id: string | undefined) => {
  return useQuery({
    queryKey: ['instances', id],
    queryFn: () => instancesApi.get(id!),
    enabled: !!id,
  });
};

/**
 * Create new instance
 */
export const useCreateInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInstanceRequest) => instancesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      toast.success('Instância criada com sucesso!');
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const message = error.response?.data?.error;

      if (status === 409) {
        toast.error('Instância já existe com este identificador');
      } else if (status === 400) {
        toast.error(message || 'Dados inválidos');
      } else {
        toast.error('Erro ao criar instância');
      }
    },
  });
};

/**
 * Update instance
 */
export const useUpdateInstance = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInstanceRequest) => instancesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      queryClient.invalidateQueries({ queryKey: ['instances', id] });
      toast.success('Instância atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar instância');
    },
  });
};

/**
 * Delete instance
 */
export const useDeleteInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => instancesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      toast.success('Instância removida');
    },
    onError: () => {
      toast.error('Erro ao remover instância');
    },
  });
};

/**
 * Generate QR code (manual trigger)
 */
export const useInstanceQRCode = (id: string | undefined) => {
  return useQuery({
    queryKey: ['instances', id, 'qrcode'],
    queryFn: () => instancesApi.generateQRCode(id!),
    enabled: false, // Manual trigger only
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
  });
};

/**
 * Generate paircode
 */
export const useGeneratePaircode = (id: string) => {
  return useMutation({
    mutationFn: (data: PaircodeRequest) => instancesApi.generatePaircode(id, data),
    onSuccess: () => {
      toast.success('Código gerado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao gerar código');
    },
  });
};

/**
 * Get instance status with auto-refresh
 */
export const useInstanceStatus = (id: string | undefined, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: ['instances', id, 'status'],
    queryFn: () => instancesApi.getStatus(id!),
    enabled: !!id,
    refetchInterval: options?.refetchInterval, // Auto-refresh if provided
    staleTime: 0, // Always fresh for status
  });
};

/**
 * Get instance behavior
 */
export const useInstanceBehavior = (id: string | undefined) => {
  return useQuery({
    queryKey: ['instances', id, 'behavior'],
    queryFn: () => instancesApi.getBehavior(id!),
    enabled: !!id,
  });
};

/**
 * Update instance behavior
 */
export const useUpdateInstanceBehavior = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => instancesApi.updateBehavior(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', id, 'behavior'] });
      toast.success('Comportamento atualizado');
    },
    onError: () => {
      toast.error('Erro ao atualizar comportamento');
    },
  });
};
