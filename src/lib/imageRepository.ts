import type { Database } from 'better-sqlite3';
import { generateIdFromEntropySize } from 'lucia';
import * as fs from 'fs';
import * as path from 'path';

class ImageRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'ImageRepositoryError';
		this.exception = exception;
	}
}

class ImageRepository {
    constructor(private destination: string, private db: Database) {}



    public upsertImage(user_id: string, order: number, imageBuffer: Buffer) {
        // Prepare the SQL query
        let id = generateIdFromEntropySize(10);
        const sql = this.db.prepare<string, string, number>(`
            INSERT INTO profile_pictures (id, user_id, image_order)
            VALUES (?, ?, ?)
        `);

        let result : null | any = null
        try {
            result = sql.run(id, user_id, order);
        } catch (error: any) {
            if (error.message.includes("UNIQUE constraint failed")) {
                const sql = this.db.prepare<string, number>(`
                    SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
                    `);
                result = sql.get(user_id, order)
                id = result.id;
            } else {
                throw new ImageRepositoryError('Error occured trying to upsert image', error)
            }
        }

        // Check if the insert was successful by checking the number of changes
        if (result && (result.changes > 0 || result.id)) {
            // If insert was successful, save the image to './user-pictures/' folder

            // Ensure that the folder exists
            const folderPath = './profile-pictures';
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
            throw new ImageRepositoryError('Insert operation failed or the row already existed without changes.', null);
        }

        /* result is of type {change: x, LastInsertedRow: y} */
        return result
    }

    public async image(user_id: string, order: number): Promise<Buffer | null> {
        try {
            const sql = this.db.prepare<string, number>(`
                SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
                `);
            const res = sql.get(user_id, order)
            return this.imageById(res.id)
        } catch (error) {
            throw new ImageRepositoryError('Error trying to fetch the image from user_id and order', error)
        }

    }

    public async imageById(id: string): Promise<Buffer | null> {
        const filePath = `./profile-pictures/${id}.jpg`; // Construct the file path
        try {
            const imageBuffer = await fs.promises.readFile(filePath); // Read the file into a Buffer
            return imageBuffer; // Return the Buffer
        } catch (error) {
            // Handle the case where the file does not exist or another error occurs
            throw new ImageRepositoryError('Error trying to read image:' + filePath, error)
        }
    }
}

export { ImageRepository };
