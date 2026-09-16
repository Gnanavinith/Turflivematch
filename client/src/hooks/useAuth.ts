import { useState, useCallback } from 'react';
import { safeStorage } from '../utils/storage';
import { FormEvent } from 'react';

export function useAuth(triggerToast: (message: string, type?: 'success' | 'warn' | 'info') => void) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => safeStorage.getItem('cricket-admin') === 'true');
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = useCallback((e: FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (adminIdInput === 'TurfC' && adminPasswordInput === 'TurfC') {
      setIsAdmin(true);
      safeStorage.setItem('cricket-admin', 'true');
      triggerToast('Authenticated successfully as Admin Scorer!', 'success');
      onSuccess?.();
    } else {
      setLoginError('Incorrect ID or Password!');
    }
  }, [adminIdInput, adminPasswordInput, triggerToast]);

  const openLogin = useCallback(() => {
    setAdminIdInput('');
    setAdminPasswordInput('');
    setLoginError('');
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    safeStorage.removeItem('cricket-admin');
    triggerToast('Logged out of Admin Scorer mode', 'info');
  }, [triggerToast]);

  return {
    isAdmin,
    adminIdInput,
    setAdminIdInput,
    adminPasswordInput,
    setAdminPasswordInput,
    loginError,
    handleLoginSubmit,
    openLogin,
    logout,
  };
}
