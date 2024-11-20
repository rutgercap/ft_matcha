import { describe, expect } from 'vitest';
import { itWithFixtures } from '../fixtures';
import * as fs from 'fs';
import {
	ConstraintImageRepositoryError,
	ImageRepositoryError
} from '$lib/imageRepository';

describe.skip('ImageRepository', () => {
	itWithFixtures.skip('should be able to save an image', async ({ savedUser, imageRepository }) => {
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

	
	itWithFixtures.skip(
		'should update image because violation of (user_id, order) constrainte',
		async ({ savedUser, imageRepository }) => {
			// Read the image file into a Buffer
			const imageBuffer = await fs.promises.readFile('./profile-pictures/default.jpg');
			const imageBuffer2 = await fs.promises.readFile('./profile-pictures/default2.jpg');

			// Use the image buffer directly in the upsertImage method
			const res1 = await imageRepository.upsertImage(savedUser.id, 0, imageBuffer);

			const res2 = await imageRepository.upsertImage(savedUser.id, 0, imageBuffer2);

			function sleep(ms: number) {
				return new Promise((resolve) => setTimeout(resolve, ms));
			}

			await sleep(1000);

			const image_test2 = await imageRepository.image(savedUser.id, 0);

			expect(image_test2.length).toEqual(imageBuffer2.length);
		}
	);

	itWithFixtures(
		'should throw an error because we upload more than five image',
		async ({ savedUser, imageRepository }) => {
			try {
				for (let i: number = 0; i < 7; i++) {
					const image_inpt = await fs.promises.readFile('./profile-pictures/default.jpg');
					await imageRepository.upsertImage(savedUser.id, i, image_inpt);
				}
			} catch (error) {
				expect(error).toBeInstanceOf(ConstraintImageRepositoryError);
			}
		}
	);

	itWithFixtures.skip('should be able to delete a picture', async ({ savedUser, imageRepository }) => {
		const imagePath = './profile-pictures/default.jpg';

		// Read the image file into a Buffer
		const imageBuffer = await fs.promises.readFile(imagePath);

		// Use the image buffer directly in the upsertImage method
		const res = await imageRepository.upsertImage(savedUser.id, 0, imageBuffer);

		imageRepository.deleteImage(savedUser.id, 0);

		try {
			const should_fail = await imageRepository.image(savedUser.id, 0);
		} catch (error) {
			expect(error).toBeInstanceOf(ImageRepositoryError);
		}
	});

	itWithFixtures.skip(
		'should be able to upsert fiv pictures in a row',
		async ({ savedUser, imageRepository }) => {
			const imageBuffer: Array<Buffer> = [];

			for (let i = 0; i < 5; i++)
				imageBuffer.push(await fs.promises.readFile('./profile-pictures/default.jpg'));

			imageRepository.upsertImageAll(savedUser.id, imageBuffer);

			const image_filenames = imageRepository.allImageIdOnly(savedUser.id);
			const found: Array<Buffer> = [];
			for (let i = 0; i < image_filenames.length; i++) {
				found.push(await imageRepository.imageById(image_filenames[i]));
			}

			expect(found).toEqual(imageBuffer);
		}
	);
});
