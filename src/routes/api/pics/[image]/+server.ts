import { ImageRepository } from '$lib/imageRepository';
import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const FILE_EXTENSION = '.jpg'
// The directory where images are stored
const imagesDir = path.resolve('./profile-pictures');
export function GET({ params }) {
  const imageName = params;
  const imagePath = path.join(imagesDir, imageName.image) + FILE_EXTENSION;

  try {
    // Check if the image exists
    if (fs.existsSync(imagePath)) {
      const file = fs.readFileSync(imagePath);
      // Determine the MIME type based on file extension
      const mimeType = 'image/jpg'


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

export async function DELETE({ locals: { user, userRepository }, params }) {
  const imageName = params.image;

  try {
    await userRepository.deleteUserImage(imageName)
    return new Response(null, {status: 204})
  } catch (error) {
    // TODO add a more detailed explanation of the error
    return new Response('Error deleting image:' + imageName, {status: 404})
  }



}
