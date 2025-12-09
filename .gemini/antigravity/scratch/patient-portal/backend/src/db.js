const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure db folder exists if we were to put it in a subfolder, 
// but for simplicity we'll keep it in the backend root.

const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath, err);
    } else {
        console.log('Connected to the SQLite database.');

        // Create table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
            if (err) {
                console.error("Error creating table:", err);
            }
        });
    }
});

module.exports = db;
