import Pool from 'pg-pool';
import { Client } from 'pg';

class UserRepository {
    constructor(private db: Pool<Client>) {}
    
    async getUserById(id: string) {
        const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
}

export default UserRepository;