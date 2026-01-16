import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { User } from '@/types';

// Auth state
export const userAtom = atom<User | null>(null);
export const isLoadingAuthAtom = atom<boolean>(true);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// Firebase user (raw)
export const firebaseUserAtom = atom<any>(null);
