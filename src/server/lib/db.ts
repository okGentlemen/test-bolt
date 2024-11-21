import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database(':memory:');

// Convert callback-based methods to Promise-based
const runAsync = promisify(db.run.bind(db));
const getAsync = promisify(db.get.bind(db));
const allAsync = promisify(db.all.bind(db));

// Initialize database schema
const initDb = async () => {
  try {
    await runAsync(`DROP TABLE IF EXISTS users`);
    await runAsync(`DROP TABLE IF EXISTS conversations`);
    await runAsync(`DROP TABLE IF EXISTS messages`);
    
    await runAsync(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        phone TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await runAsync(`
      CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        role TEXT CHECK(role IN ('user', 'assistant')),
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Initialize the database
initDb().catch(console.error);

export { db, runAsync, getAsync, allAsync };