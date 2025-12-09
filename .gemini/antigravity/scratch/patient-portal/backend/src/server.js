const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Keep original extension, add timestamp to prevent name collision
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- Routes ---

// 1. Upload File
app.post('/api/documents/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type (PDF only)' });
    }

    const { originalname, filename, size } = req.file;

    const sql = 'INSERT INTO documents (filename, filepath, filesize) VALUES (?, ?, ?)';
    const params = [originalname, filename, size]; // We interpret "filename" in DB as the original display name usually, but technically the prompt asked for "filename, filepath". I'll store original name as filename for display, and the internal name as filepath (relative or just name)

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                id: this.lastID,
                filename: originalname,
                filesize: size,
                created_at: new Date()
            }
        });
    });
});

// 2. List Files
app.get('/api/documents', (req, res) => {
    const sql = 'SELECT * FROM documents ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 3. Download File
app.get('/api/documents/:id', (req, res) => {
    const sql = 'SELECT * FROM documents WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const filePath = path.join(uploadDir, row.filepath);

        if (fs.existsSync(filePath)) {
            res.download(filePath, row.filename); // Set Content-Disposition to attachment with original filename
        } else {
            res.status(404).json({ error: 'File not found on server' });
        }
    });
});

// 4. Delete File
app.delete('/api/documents/:id', (req, res) => {
    const sql = 'SELECT * FROM documents WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const filePath = path.join(uploadDir, row.filepath);

        // Delete from DB first or after? Usually attempt FS delete, if clean, then DB.
        fs.unlink(filePath, (fsErr) => {
            if (fsErr && fsErr.code !== 'ENOENT') {
                // If file simply doesn't exist, we can still proceed to clean DB
                console.error("File delete error:", fsErr);
                return res.status(500).json({ error: 'Failed to delete file from storage' });
            }

            // Remove from DB
            db.run('DELETE FROM documents WHERE id = ?', req.params.id, function (dbErr) {
                if (dbErr) {
                    return res.status(500).json({ error: dbErr.message });
                }
                res.json({ message: 'Document deleted successfully' });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
