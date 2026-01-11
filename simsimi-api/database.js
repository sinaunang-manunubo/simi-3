const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'database', 'simsimi.db'), (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database.');
                this.initializeDatabase();
            }
        });
    }

    initializeDatabase() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT UNIQUE NOT NULL,
                answer TEXT NOT NULL,
                teach_count INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_taught TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        this.db.run(createTableQuery, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Responses table ready.');
            }
        });
    }

    async getResponse(question) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM responses WHERE question = ?';
            this.db.get(query, [question.toLowerCase()], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async teachResponse(question, answer) {
        return new Promise((resolve, reject) => {
            // Check if question already exists
            this.getResponse(question).then(existing => {
                if (existing) {
                    // Update existing response
                    const updateQuery = `
                        UPDATE responses 
                        SET answer = ?, teach_count = teach_count + 1, last_taught = CURRENT_TIMESTAMP 
                        WHERE question = ?
                    `;
                    this.db.run(updateQuery, [answer, question.toLowerCase()], function(err) {
                        if (err) reject(err);
                        else resolve({ id: existing.id, updated: true, teach_count: existing.teach_count + 1 });
                    });
                } else {
                    // Insert new response
                    const insertQuery = `
                        INSERT INTO responses (question, answer) 
                        VALUES (?, ?)
                    `;
                    this.db.run(insertQuery, [question.toLowerCase(), answer], function(err) {
                        if (err) reject(err);
                        else resolve({ id: this.lastID, updated: false, teach_count: 1 });
                    });
                }
            }).catch(reject);
        });
    }

    async getAllResponses(limit = 50) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM responses ORDER BY last_taught DESC LIMIT ?';
            this.db.all(query, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async getStats() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as total_responses, SUM(teach_count) as total_teachings FROM responses';
            this.db.get(query, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async searchResponses(searchTerm) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM responses WHERE question LIKE ? OR answer LIKE ? LIMIT 20';
            const term = `%${searchTerm}%`;
            this.db.all(query, [term, term], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = new Database();