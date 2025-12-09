/**
 * Auth Custom Hook
 * 
 * Provides authentication state and methods
 */

import { useContext } from 'react';
import { AuthContext } from '@/lib/contexts/auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
