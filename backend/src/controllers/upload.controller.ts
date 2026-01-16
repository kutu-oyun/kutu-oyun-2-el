import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { generateSignedUrl, getPublicUrl } from '../config/storage.js';
import { nanoid } from 'nanoid';

export const getSignedUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      res.status(400).json({ error: 'fileName and contentType are required' });
      return;
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      res.status(400).json({ error: 'Invalid content type. Only images are allowed.' });
      return;
    }

    // Generate unique file name
    const extension = fileName.split('.').pop();
    const uniqueFileName = `products/${req.user!.uid}/${nanoid()}.${extension}`;

    const signedUrl = await generateSignedUrl(uniqueFileName, contentType);
    const publicUrl = await getPublicUrl(uniqueFileName);

    res.json({
      signedUrl,
      publicUrl,
      fileName: uniqueFileName,
    });
  } catch (error) {
    console.error('Get signed URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};
