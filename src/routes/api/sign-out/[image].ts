import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

// The directory where images are stored
const imagesDir = path.resolve('./profile-pictures');

export const GET: RequestHandler = async ({ params }) => {
  const { imageName } = params;

  const imagePath = path.join(imagesDir, imageName);

  try {
    // Check if the image exists
    if (fs.existsSync(imagePath)) {
      const file = fs.readFileSync(imagePath);
      const extension = path.extname(imageName).toLowerCase();

      // Determine the MIME type based on file extension
      const mimeType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      }[extension] || 'application/octet-stream';

      return new Response(file, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'max-age=3600', // Optional: Cache the image for performance
        },
      });
    } else {
      return new Response('Image not found', { status: 404 });
    }
  } catch (error) {
    return new Response('Error reading image', { status: 500 });
  }
};
