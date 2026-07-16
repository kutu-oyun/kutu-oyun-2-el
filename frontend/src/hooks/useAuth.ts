'use client';

import { useEffect, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import {
  auth,
  onAuthStateChanged,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  logout as firebaseLogout,
  resetPassword as firebaseResetPassword,
} from '@/lib/firebase';
import { api } from '@/lib/api';
import { userAtom, isLoadingAuthAtom, firebaseUserAtom } from '@/atoms/auth';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAuthAtom);
  const setFirebaseUser = useSetAtom(firebaseUserAtom);
  const router = useRouter();

  // Listen to auth state changes
  useEffect(() => {
    // Önce test session kontrol et
    const checkTestSession = async () => {
      const testToken = localStorage.getItem('testSessionToken');
      const testUserStr = localStorage.getItem('testUser');
      
      if (testToken && testUserStr) {
        try {
          const response = await api.bypass.verify() as any;
          if (response.success && response.user) {
            setUser(response.user as User);
            setIsLoading(false);
            return true;
          }
        } catch {
          // Token geçersiz, temizle
          localStorage.removeItem('testSessionToken');
          localStorage.removeItem('testUser');
        }
      }
      return false;
    };

    const initAuth = async () => {
      // Test session varsa onu kullan
      const hasTestSession = await checkTestSession();
      if (hasTestSession) return;

      // Firebase auth'u dinle
      if (!auth) {
        setIsLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setFirebaseUser(firebaseUser);

        if (firebaseUser) {
          try {
            // Sync user to backend and get full user data
            await api.auth.sync({
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
            });
            const userData = await api.auth.me() as User;
            setUser(userData);
          } catch (error) {
            console.error('Failed to sync user:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }

        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    initAuth();
  }, [setUser, setIsLoading, setFirebaseUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await firebaseSignIn(email, password);
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [router, setIsLoading]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      await firebaseSignUp(email, password, displayName);
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [router, setIsLoading]);

  const logout = useCallback(async () => {
    try {
      // Test session varsa onu temizle
      const testToken = localStorage.getItem('testSessionToken');
      if (testToken) {
        try {
          await api.bypass.logout();
        } catch {
          // Ignore
        }
        localStorage.removeItem('testSessionToken');
        localStorage.removeItem('testUser');
        setUser(null);
        router.push('/');
        return;
      }

      // Firebase logout
      await firebaseLogout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [router, setUser]);

  const resetPassword = useCallback(async (email: string) => {
    await firebaseResetPassword(email);
  }, []);

  // Test session ile giriş
  const loginAsTestUser = useCallback(async (userId: string, selectedRole?: string) => {
    setIsLoading(true);
    try {
      const response = await api.bypass.quickLogin(userId, selectedRole) as any;
      
      if (response.success && response.token) {
        localStorage.setItem('testSessionToken', response.token);
        localStorage.setItem('testUser', JSON.stringify(response.user));
        setUser(response.user as User);
        router.push('/');
      }
    } catch (error) {
      console.error('Test login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, setUser, setIsLoading]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isTestSession:
      typeof window !== 'undefined' && !!localStorage.getItem('testSessionToken'),
    signIn,
    signUp,
    logout,
    resetPassword,
    loginAsTestUser,
  };
}

export function useRequireAuth(redirectTo = '/giris') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}

export function useRequireAdmin(redirectTo = '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}
