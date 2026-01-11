const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'database', 'simsimi.db'), (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                this.initializeDatabase();
            }
        });
    }

    initializeDatabase() {
        const createResponsesTable = `
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT UNIQUE,
                answer TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                learn_count INTEGER DEFAULT 1
            )
        `;

        this.db.run(createResponsesTable, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Responses table ready');
            }
        });
    }

    // Add or update response
    async teach(question, answer) {
        return new Promise((resolve, reject) => {
            // Check if question exists
            this.db.get(
                'SELECT * FROM responses WHERE LOWER(question) = LOWER(?)',
                [question],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (row) {
                        // Update existing response
                        this.db.run(
                            'UPDATE responses SET answer = ?, learn_count = learn_count + 1 WHERE id = ?',
                            [answer, row.id],
                            function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ id: row.id, action: 'updated', learn_count: row.learn_count + 1 });
                                }
                            }
                        );
                    } else {
                        // Insert new response
                        this.db.run(
                            'INSERT INTO responses (question, answer) VALUES (?, ?)',
                            [question, answer],
                            function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ id: this.lastID, action: 'created', learn_count: 1 });
                                }
                            }
                        );
                    }
                }
            );
        });
    }

    // Get response for a question
    async ask(question) {
        return new Promise((resolve, reject) => {
            // Try exact match first
            this.db.get(
                'SELECT * FROM responses WHERE LOWER(question) = LOWER(?)',
                [question],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (row) {
                        resolve({ answer: row.answer, found: true });
                    } else {
                        // Try partial match if exact not found
                        this.db.get(
                            'SELECT * FROM responses WHERE question LIKE ? ORDER BY learn_count DESC LIMIT 1',
                            [`%${question}%`],
                            (err, partialRow) => {
                                if (err) {
                                    reject(err);
                                } else if (partialRow) {
                                    resolve({ answer: partialRow.answer, found: true, match: 'partial' });
                                } else {
                                    // Return default responses if no match
                                    const defaultResponses = [
                                        "I don't know how to answer that. Can you teach me?",
                                        "I'm still learning! Tell me what to say to that.",
                                        "I don't understand. Please teach me!",
                                        "That's new to me! What should I say to that?",
                                        "I'm not sure. Can you teach me a response?"
                                    ];
                                    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
                                    resolve({ answer: randomResponse, found: false });
                                }
                            }
                        );
                    }
                }
            );
        });
    }

    // Get all responses (for debugging)
    async getAllResponses() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM responses ORDER BY learn_count DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Search responses
    async searchResponses(keyword) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM responses WHERE question LIKE ? OR answer LIKE ? ORDER BY learn_count DESC',
                [`%${keyword}%`, `%${keyword}%`],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // Close database connection
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

module.exports = new Database();