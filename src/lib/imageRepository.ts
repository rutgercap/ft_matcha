import type { Database } from 'better-sqlite3';
import { generateIdFromEntropySize } from 'lucia';
import * as fs from 'fs';
import * as path from 'path';

class ImageRepository {
    constructor(private destination: string, private db: Database) {}



    public upsertImage(user_id: string, order: number, imageBuffer: Buffer) {
        // Prepare the SQL query
        const id = generateIdFromEntropySize(10);
        const sql = this.db.prepare<string, string, number>(`
            INSERT INTO profile_pictures (id, user_id, image_order)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, image_order) DO UPDATE
            SET image_order = excluded.image_order;
        `);


        // Run the SQL command
        const result = sql.run(id, user_id, order);

        // Check if the insert was successful by checking the number of changes
        if (result.changes > 0) {
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
                    console.error('Error saving image file:', err);
                } else {
                    console.log('Image saved successfully at:', filePath);
                }
            });
        } else {
            console.log('Insert operation failed or the row already existed without changes.');
        }
        return result
    }
    public async image(user_id: string, order: number): Promise<Buffer | null> {
        const sql = this.db.prepare<string, number>(`
            SELECT id FROM profile_pictures WHERE user_id = ? AND image_order = ?
            `);
        const res = sql.get(user_id, order)

        return this.imageById(res.id)
    }

    public async imageById(id: string): Promise<Buffer | null> {
        const filePath = `./profile-pictures/${id}.jpg`; // Construct the file path

        try {
            const imageBuffer = await fs.promises.readFile(filePath); // Read the file into a Buffer
            return imageBuffer; // Return the Buffer
        } catch (error) {
            // Handle the case where the file does not exist or another error occurs
            console.error('Error reading image file:', error);
            return null; // Return null if there's an error
        }
    }
}

export { ImageRepository };
