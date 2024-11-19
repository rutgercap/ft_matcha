import type { Database } from 'better-sqlite3';
import { generateIdFromEntropySize } from 'lucia';
import * as fs from 'fs';
import * as path from 'path';
import { MAX_PIC } from '$env/static/private';

const MAX_PICTURES = Number(MAX_PIC);

export class ImageRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'ImageRepositoryError';
		this.exception = exception;
	}
}

export class ConstraintImageRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'ImageRepositoryError';
		this.exception = exception;
	}
}

class ImageRepository {
	constructor(
		private destination: string,
		private db: Database
	) {}

	public upsertImageAll(user_id: string, buffers: Array<Buffer | null>): Array<string | null> {
		try {
			let inserted_filename: Array<string | null> = [null, null, null, null, null];
			for (let i = 0; i < MAX_PICTURES; i++) {
				if (buffers[i]) inserted_filename[i] = this.upsertImage(user_id, i, buffers[i]);
			}
			return inserted_filename;
		} catch (error) {
			throw new ImageRepositoryError(
				'Error occurs trying to upser all pictures for user:' + user_id,
				error
			);
		}
	}

	public upsertImage(user_id: string, order: number, imageBuffer: Buffer): string {
		// Prepare the SQL query
		let id = generateIdFromEntropySize(10);
		const sql = this.db.prepare<string, string, number>(`
            INSERT INTO profile_pictures (id, user_id, image_order)
            VALUES (?, ?, ?)
        `);

		let result: null | any = null;
		try {
			result = sql.run(id, user_id, order);
			let img_cnt = this.db
				.prepare<string>(
					`SELECT count(*) AS cnt
                                                    FROM profile_pictures
                                                    WHERE user_id = ?`
				)
				.get(user_id);
			if (img_cnt.cnt > MAX_PICTURES) {
				this.db.prepare<string>('DELETE FROM profile_pictures WHERE id = ?').run(id);
				throw new ConstraintImageRepositoryError(
					'Maximum image limit reach for user:' + user_id,
					null
				);
			}
		} catch (error: any) {
			if (error.message.includes('UNIQUE constraint failed')) {
				const sql = this.db.prepare<string, number>(`
                    SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
                    `);
				result = sql.get(user_id, order);
				id = result.id;
			} else if (error instanceof ConstraintImageRepositoryError) {
				throw error;
			} else {
				throw new ImageRepositoryError(
					'Error occured trying to upsert image for user:' + user_id,
					error
				);
			}
		}

		// Check if the insert was successful by checking the number of changes
		if (result && (result.changes > 0 || result.id)) {
			// If insert was successful, save the image to './user-pictures/' folder

			// Ensure that the folder exists
			const folderPath = this.destination;
			if (!fs.existsSync(folderPath)) {
				fs.mkdirSync(folderPath, { recursive: true });
			}

			// Define the file path where the image will be saved
			const filePath = path.join(folderPath, `${id}.jpg`);

			// Write the image file to the directory
			fs.writeFile(filePath, imageBuffer, (err: any) => {
				if (err) {
					throw new ImageRepositoryError('Error saving image to:' + filePath, err);
				}
			});
		} else {
			throw new ImageRepositoryError(
				'Insert operation failed or the row already existed without changes.',
				null
			);
		}

		/* result is of type {change: x, LastInsertedRow: y} */
		return id;
	}

	public allImageIdOnly(user_id: string): Array<string> {
		try {
			const pictures: Array<string> = new Array<string>(
				'default2',
				'default2',
				'default2',
				'default2',
				'default2'
			);
			for (let i = 0; i < MAX_PICTURES; i++) {
				pictures[i] = this.imageIdOnly(user_id, i);
			}
			return pictures;
		} catch (error) {
			throw new ImageRepositoryError(
				'Error trying to get all image filename for user:' + user_id,
				error
			);
		}
	}

	public imageIdOnly(user_id: string, order: number): string {
		try {
			const sql = this.db.prepare<string, number>(`
                SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
                `);
			const res = sql.get(user_id, order);
			if (!res || !res.id) return 'default2';
			return res.id;
		} catch (e) {
			new ImageRepositoryError('Error trying to fetch the image id only from user_id and order', e);
		}
	}

	public async image(user_id: string, order: number): Promise<Buffer | null> {
		try {
			const sql = this.db.prepare<string, number>(`
                SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
                `);
			const res = sql.get(user_id, order);
			let test: Buffer | null = null;
			if (res && res.id) {
				test = this.imageById(res.id);
			}
			return test;
		} catch (error) {
			throw new ImageRepositoryError(
				'Error trying to fetch the image from user_id and order',
				error
			);
		}
	}

	public async imageById(id: string): Promise<Buffer | null> {
		const filePath = this.destination + `/${id}.jpg`; // Construct the file path
		try {
			const imageBuffer = await fs.promises.readFile(filePath); // Read the file into a Buffer
			return imageBuffer; // Return the Buffer
		} catch (error) {
			// Handle the case where the file does not exist or another error occurs
			throw new ImageRepositoryError('Error trying to read image:' + filePath, error);
		}
	}
	public async deleteImage(user_id: string, order: number) {
		try {
			const sql = this.db.prepare<string, number>(`
                SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
                `);
			const res = sql.get(user_id, order);

			this.db.prepare<string>('DELETE FROM profile_pictures WHERE id = ?').run(res.id);
			await this.deleteImageById(res.id);
		} catch (error) {
			throw new ImageRepositoryError(
				'Error trying to fetch the image for deletion from user_id and order',
				error
			);
		}
	}

	public async deleteImageById(id: string): Promise<void> {
		const filePath = this.destination + `/${id}.jpg`; // Construct the file path
		try {
			await fs.promises.unlink(filePath); // Delete the file
			console.log(`Image ${filePath} deleted successfully.`); // Log successful deletion
		} catch (error) {
			// Handle the case where the file does not exist or another error occurs
			throw new ImageRepositoryError('Error trying to delete image:' + filePath, error);
		}
	}

	public async convertFileToBuffer(files: Array<File | null>): Array<File, null> {
		const buffers: Array<Buffer | null> = [null, null, null, null, null];
		try {
			for (let i = 0; i < MAX_PICTURES; i++)
				if (files[i]) buffers[i] = Buffer.from(await files[i].arrayBuffer());
		} catch (error) {
			throw new ImageRepositoryError('Error occurs trying to convert Files to Buffer', error);
		}
		return buffers;
	}
}

export { ImageRepository };
