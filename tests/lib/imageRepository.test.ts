import { describe, expect } from "vitest";
import { itWithFixtures } from "../fixtures";
import * as fs from 'fs';
import { ImageRepository } from "$lib/imageRepository";

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

    itWithFixtures('should not add a new image to user because we violate UNIQUE(user_id, order)', async ({savedUser, imageRepository}) => {
        // Read the image file into a Buffer
        const imageBuffer = await fs.promises.readFile('./profile-pictures/default.jpg');
        const imageBuffer2 = await fs.promises.readFile('./profile-pictures/default2.jpg');

        // Use the image buffer directly in the upsertImage method
        const res1 = await imageRepository.upsertImage(savedUser.id, 0, imageBuffer);

        const res2 = await imageRepository.upsertImage(savedUser.id, 0, imageBuffer2);

        const image = await imageRepository.image(savedUser.id, 0);

        expect(image.length).toEqual(imageBuffer2.length)

    })
});

