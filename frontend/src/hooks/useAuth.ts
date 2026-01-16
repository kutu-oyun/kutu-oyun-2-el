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
  User as FirebaseUser,
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    logout,
    resetPassword,
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
