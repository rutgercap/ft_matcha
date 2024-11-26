import { describe, expect } from 'vitest';
import { itWithFixtures } from '../fixtures';
import { ImageRepositoryError } from '$lib/server/imageRepository';

describe('ImageRepository', () => {
	itWithFixtures(
		'should be able to save an image',
		async ({ savedUser, imageRepository, image }) => {
			await imageRepository.upsertImage(savedUser.id, 0, image);

			const found = await imageRepository.image(savedUser.id, 0);

			expect(found).toEqual(image);
		}
	);

	itWithFixtures(
		'should throw error when trying to save an image in order that already exists',
		async ({ savedUser, imageRepository, image }) => {
			await imageRepository.upsertImage(savedUser.id, 0, image);

			await expect(imageRepository.upsertImage(savedUser.id, 0, image)).rejects.toThrow(
				ImageRepositoryError
			);
		}
	);

	itWithFixtures(
		'should throw an error when trying to save with higher order than 4',
		async ({ savedUser, imageRepository, image }) => {
			await expect(imageRepository.upsertImage(savedUser.id, 5, image)).rejects.toThrow(
				ImageRepositoryError
			);
		}
	);

	itWithFixtures(
		'should be able to delete a picture',
		async ({ savedUser, imageRepository, image }) => {
			await imageRepository.upsertImage(savedUser.id, 0, image);

			imageRepository.deleteImage(savedUser.id, 0);

			const found = await imageRepository.image(savedUser.id, 0);
			expect(found).toBeNull();
		}
	);

	itWithFixtures(
		'should be able to get uploaded image orders',
		async ({ savedUser, imageRepository, image }) => {
			await imageRepository.upsertImage(savedUser.id, 0, image);

			const found = await imageRepository.listImages(savedUser.id);

			expect(found).toStrictEqual([0]);
		}
	);

	itWithFixtures(
		'Does not error if deleting non existing image',
		async ({ savedUser, imageRepository }) => {
			await imageRepository.deleteImage(savedUser.id, 0);
		}
	);
});
