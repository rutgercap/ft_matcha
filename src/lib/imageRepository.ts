import type { Database } from 'better-sqlite3';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class ImageRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'ImageRepositoryError';
		this.exception = exception;
	}
}

class ImageRepository {
	private maxPictures: number = 5;
	constructor(
		private destination: string,
		private db: Database
	) {}

	public async upsertImage(userId: string, order: number, imageBuffer: Buffer): Promise<number> {
		if (order < 0 || order >= this.maxPictures) {
			throw new ImageRepositoryError('Image order out of range', null);
		}
		const id = uuidv4();
		const sql = this.db.prepare<[string, string, number]>(`
            INSERT INTO profile_pictures (id, user_id, image_order)
            VALUES (?, ?, ?)
        `);
		try {
			sql.run(id, userId, order);
		} catch (e) {
			throw new ImageRepositoryError('Error trying to insert image into profile_pictures table', e);
		}
		try {
			const filePath = this.destination + `/${userId}_${order}.jpg`;
			const writeStream = fs.createWriteStream(filePath);
			await new Promise((resolve, reject) => {
				writeStream.on('finish', resolve);
				writeStream.on('error', reject);
				writeStream.write(imageBuffer);
				writeStream.end();
			});
		} catch (e) {
			throw new ImageRepositoryError('Error trying to write image to disk', e);
		}
		return order;
	}

	public async listImages(userId: string): Promise<number[]> {
		try {
			const sql = this.db.prepare<[string], { image_order: number }>(`
				SELECT image_order FROM profile_pictures WHERE user_id = ?
			`);
			return sql.all(userId).map((row) => row.image_order);
		} catch (error) {
			throw new ImageRepositoryError('Error trying to list images', error);
		}
	}

	public async image(userId: string, order: number): Promise<Buffer | null> {
		try {
			const sql = this.db.prepare<[string, number], { id: string }>(`
                SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
                `);
			const id = sql.get(userId, order)?.id;
			if (!id) {
				return null;
			}
			const filePath = this.destination + `/${userId}_${order}.jpg`;
			return fs.readFileSync(filePath);
		} catch (error) {
			throw new ImageRepositoryError(
				'Error trying to fetch the image from user_id and order',
				error
			);
		}
	}

	public async deleteImage(user_id: string, order: number) {
		try {
			const result = this.db
				.prepare<
					[string, number]
				>('DELETE FROM profile_pictures WHERE user_id = ? AND image_order = ?')
				.run(user_id, order);
			if (result.changes === 0) {
				return;
			}
			fs.unlinkSync(this.destination + `/${user_id}_${order}.jpg`);
		} catch (error) {
			console.log(error);
			throw new ImageRepositoryError('Error trying delete the image', error);
		}
	}
}

export { ImageRepository };
