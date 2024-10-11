import { describe, expect } from "vitest";
import { itWithFixtures } from "../fixtures";
import * as fs from 'fs';

describe('ImageRepository', () => {
    itWithFixtures('should be able to save an image', async ({ savedUser, imageRepository }) => {
        const imagePath = './profile-pictures/default.jpg';

        // Read the image file into a Buffer
        const imageBuffer = await fs.promises.readFile(imagePath);

        // Use the image buffer directly in the upsertImage method
        const res = await imageRepository.upsertImage(savedUser.id, 0, imageBuffer);

        // Retrieve the saved image
        const image = await imageRepository.image(savedUser.id, 0);

        // Check that the sizes match
        expect(image.length).toEqual(imageBuffer.length); // Use imageBuffer.length since it's a Buffer
    });
});

