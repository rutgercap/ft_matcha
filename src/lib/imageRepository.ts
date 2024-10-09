import type { Database } from 'better-sqlite3';

class ImageRepository {
    constructor(private destination: string, private db: Database) {}
    
    public async upsertImage(id: string, order: number, image: File): Promise<void> {
        const sql = this.db.prepare(`
            INSERT INTO images (id, user_id, image_order)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, image_order) DO UPDATE SET
            image = excluded.image;
            `)
    }
    
    public async image(id: string, arg1: number): Promise<File | null> {
        throw new Error("Method not implemented.");
    }
}

export { ImageRepository };