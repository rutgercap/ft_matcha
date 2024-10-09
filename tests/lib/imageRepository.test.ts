import { describe, expect } from "vitest";
import { itWithFixtures } from "../fixtures";
import * as fs from 'fs';

describe('ImageRepository', () => {
    itWithFixtures('should be able to save an image', async ({ savedUser, imageRepository }) => {
        const imagePath = 'tests/fixtures/uyh2yhiaexbn44l7_0.jpg';
        const imageBuffer = await fs.promises.readFile(imagePath);
        const file = new File([imageBuffer], 'image.jpg');

        await imageRepository.upsertImage(savedUser.id, 0, file);

        const image = await imageRepository.image(savedUser.id, 0);
        expect(image?.size).toEqual(file.size);
    });
});