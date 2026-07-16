import admin from 'firebase-admin';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Only initialize Firebase if credentials are provided
const hasFirebaseConfig = firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey;

if (hasFirebaseConfig && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
  });
}

// Mock auth for development without Firebase
export const auth = hasFirebaseConfig 
  ? admin.auth() 
  : {
      verifyIdToken: async (token: string) => {
        // In development, accept any token and return mock user
        console.warn('⚠️ Firebase not configured - using mock auth');
        return { uid: 'dev-user-123', email: 'dev@example.com' };
      },
    } as any;

export default admin;
