import { Storage, Bucket } from '@google-cloud/storage';

const hasStorageConfig = process.env.GCS_BUCKET_NAME && process.env.GCS_PROJECT_ID;

let storage: Storage | null = null;
let bucket: Bucket | null = null;

if (hasStorageConfig) {
  storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
  });
  bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);
}

export async function generateSignedUrl(fileName: string, contentType: string): Promise<string> {
  if (!bucket) {
    console.warn('⚠️ Cloud Storage not configured - returning mock URL');
    return `https://example.com/mock-upload/${fileName}`;
  }
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    contentType,
  });
  return url;
}

export async function getPublicUrl(fileName: string): Promise<string> {
  if (!process.env.GCS_BUCKET_NAME) {
    return `https://example.com/mock-storage/${fileName}`;
  }
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
}

export { bucket };
export default storage;
