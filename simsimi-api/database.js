const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        // Ensure database directory exists
        const dbDir = path.join(__dirname, 'database');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('Created database directory');
        }
        
        const dbPath = path.join(dbDir, 'simsimi.db');
        console.log(`Database path: ${dbPath}`);
        
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Error opening database:', err.message);
            } else {
                console.log('✅ Connected to SQLite database');
                this.initializeDatabase();
                this.seedDefaultData();
            }
        });
    }

    initializeDatabase() {
        const createResponsesTable = `
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT UNIQUE NOT NULL,
                answer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                learn_count INTEGER DEFAULT 1
            )
        `;

        const createIndexes = `
            CREATE INDEX IF NOT EXISTS idx_question ON responses(question);
            CREATE INDEX IF NOT EXISTS idx_created_at ON responses(created_at);
            CREATE INDEX IF NOT EXISTS idx_learn_count ON responses(learn_count);
        `;

        this.db.serialize(() => {
            this.db.run(createResponsesTable, (err) => {
                if (err) {
                    console.error('❌ Error creating table:', err.message);
                } else {
                    console.log('✅ Responses table ready');
                }
            });

            this.db.run(createIndexes, (err) => {
                if (err) {
                    console.error('❌ Error creating indexes:', err.message);
                } else {
                    console.log('✅ Database indexes created');
                }
            });
        });
    }

    seedDefaultData() {
        const defaultResponses = [
            { question: 'hello', answer: 'Hi there! How can I help you today?' },
            { question: 'hi', answer: 'Hello! Nice to meet you!' },
            { question: 'how are you', answer: 'I\'m doing great, thanks for asking! How about you?' },
            { question: 'what is your name', answer: 'I\'m SimSimi, your friendly chatbot!' },
            { question: 'who created you', answer: 'I was created by a developer to help people learn about chatbots!' },
            { question: 'tell me a joke', answer: 'Why don\'t scientists trust atoms? Because they make up everything!' },
            { question: 'thank you', answer: 'You\'re welcome! Happy to help!' },
            { question: 'bye', answer: 'Goodbye! Come back soon!' },
            { question: 'good morning', answer: 'Good morning! Hope you have a wonderful day!' },
            { question: 'good night', answer: 'Good night! Sweet dreams!' }
        ];

        // Check if table is empty
        this.db.get('SELECT COUNT(*) as count FROM responses', (err, row) => {
            if (err) {
                console.error('❌ Error checking table:', err.message);
                return;
            }

            if (row.count === 0) {
                console.log('📝 Seeding default responses...');
                const stmt = this.db.prepare('INSERT OR IGNORE INTO responses (question, answer) VALUES (?, ?)');
                
                defaultResponses.forEach(response => {
                    stmt.run(response.question.toLowerCase(), response.answer, (err) => {
                        if (err) {
                            console.error(`❌ Error seeding "${response.question}":`, err.message);
                        }
                    });
                });
                
                stmt.finalize((err) => {
                    if (err) {
                        console.error('❌ Error finalizing seed:', err.message);
                    } else {
                        console.log(`✅ Seeded ${defaultResponses.length} default responses`);
                    }
                });
            } else {
                console.log(`✅ Database already has ${row.count} responses`);
            }
        });
    }

    // Add or update response
    async teach(question, answer) {
        return new Promise((resolve, reject) => {
            const normalizedQuestion = question.toLowerCase().trim();
            const normalizedAnswer = answer.trim();

            if (!normalizedQuestion || !normalizedAnswer) {
                reject(new Error('Question and answer cannot be empty'));
                return;
            }

            // Check if question exists
            this.db.get(
                'SELECT * FROM responses WHERE question = ?',
                [normalizedQuestion],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (row) {
                        // Update existing response
                        this.db.run(
                            'UPDATE responses SET answer = ?, learn_count = learn_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                            [normalizedAnswer, row.id],
                            function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ 
                                        id: row.id, 
                                        action: 'updated', 
                                        learn_count: row.learn_count + 1,
                                        question: normalizedQuestion,
                                        answer: normalizedAnswer
                                    });
                                }
                            }
                        );
                    } else {
                        // Insert new response
                        this.db.run(
                            'INSERT INTO responses (question, answer) VALUES (?, ?)',
                            [normalizedQuestion, normalizedAnswer],
                            function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ 
                                        id: this.lastID, 
                                        action: 'created', 
                                        learn_count: 1,
                                        question: normalizedQuestion,
                                        answer: normalizedAnswer
                                    });
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
            const normalizedQuestion = question.toLowerCase().trim();

            // Try exact match first
            this.db.get(
                'SELECT * FROM responses WHERE question = ?',
                [normalizedQuestion],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (row) {
                        resolve({ 
                            answer: row.answer, 
                            found: true,
                            id: row.id,
                            learn_count: row.learn_count
                        });
                    } else {
                        // Try similar matches using LIKE
                        this.db.all(
                            'SELECT * FROM responses WHERE question LIKE ? ORDER BY learn_count DESC LIMIT 3',
                            [`%${normalizedQuestion}%`],
                            (err, rows) => {
                                if (err) {
                                    reject(err);
                                } else if (rows && rows.length > 0) {
                                    // Return the most learned response
                                    resolve({ 
                                        answer: rows[0].answer, 
                                        found: true, 
                                        match: 'partial',
                                        alternatives: rows.slice(1).map(r => r.answer),
                                        id: rows[0].id
                                    });
                                } else {
                                    // Return default responses if no match
                                    const defaultResponses = [
                                        "I don't know how to answer that. Can you teach me?",
                                        "I'm still learning! Tell me what to say to that.",
                                        "That's interesting! What should I say when someone asks that?",
                                        "I'm not sure about that one. Can you teach me a response?",
                                        "Hmm, I don't have an answer for that yet. Want to help me learn?"
                                    ];
                                    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
                                    resolve({ 
                                        answer: randomResponse, 
                                        found: false,
                                        suggestion: "Use the 'Teach SimSimi' form to add a response!"
                                    });
                                }
                            }
                        );
                    }
                }
            );
        });
    }

    // Get all responses (for debugging)
    async getAllResponses(limit = 100, offset = 0) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM responses ORDER BY learn_count DESC, updated_at DESC LIMIT ? OFFSET ?',
                [limit, offset],
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

    // Search responses
    async searchResponses(keyword, limit = 50) {
        return new Promise((resolve, reject) => {
            const searchTerm = `%${keyword.toLowerCase()}%`;
            this.db.all(
                'SELECT * FROM responses WHERE question LIKE ? OR answer LIKE ? ORDER BY learn_count DESC LIMIT ?',
                [searchTerm, searchTerm, limit],
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

    // Get response by ID
    async getResponseById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM responses WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // Delete response by ID
    async deleteResponse(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM responses WHERE id = ?',
                [id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ deleted: this.changes > 0, changes: this.changes });
                    }
                }
            );
        });
    }

    // Get statistics
    async getStats() {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT 
                    COUNT(*) as total_responses,
                    SUM(learn_count) as total_learns,
                    AVG(learn_count) as avg_learns,
                    MIN(created_at) as oldest,
                    MAX(updated_at) as newest
                FROM responses`,
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // Close database connection
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('✅ Database connection closed');
            }
        });
    }

    // Backup database
    backup() {
        return new Promise((resolve, reject) => {
            const backupPath = path.join(__dirname, 'database', `simsimi-backup-${Date.now()}.db`);
            const backupDb = new sqlite3.Database(backupPath);
            
            this.db.backup(backupDb, {
                progress: (p) => {
                    console.log(`Backup progress: ${p.totalPages > 0 ? Math.round((p.remainingPages / p.totalPages) * 100) : 0}%`);
                }
            }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    backupDb.close();
                    resolve(backupPath);
                }
            });
        });
    }
}

// Create and export a singleton instance
const database = new Database();

// Handle application exit
process.on('SIGINT', () => {
    database.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    database.close();
    process.exit(0);
});

module.exports = database;