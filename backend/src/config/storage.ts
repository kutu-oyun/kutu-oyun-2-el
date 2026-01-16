import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
});

export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || '');

export async function generateSignedUrl(fileName: string, contentType: string): Promise<string> {
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    contentType,
  });
  return url;
}

export async function getPublicUrl(fileName: string): Promise<string> {
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
}

export default storage;
