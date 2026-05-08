const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

let pool;

async function initDB() {
    try {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
            console.log('Uploads directory created');
        }

        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.end();

        pool = mysql.createPool({
            ...dbConfig,
            database: process.env.DB_NAME,
        });

        await pool.query(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                no_anggota VARCHAR(50),
                nama VARCHAR(255),
                alamat TEXT,
                unit VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
}

initDB();

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const getVal = (row, keys) => {
            const cleanKeys = keys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const foundKey = Object.keys(row).find(k => cleanKeys.includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')));
            return foundKey ? row[foundKey] : '';
        };

        const results = [];
        for (const row of data) {
            const no_anggota = String(getVal(row, ['no anggota', 'nomor', 'no']));
            const nama = getVal(row, ['nama', 'name', 'n a m a']);
            const alamat = getVal(row, ['alamat', 'address', 'alamat sesuai ktp']);
            const unit = getVal(row, ['unit', 'instansi', 'unit kerja']);

            if (no_anggota || nama) {
                await pool.query(
                    'INSERT INTO members (no_anggota, nama, alamat, unit) VALUES (?, ?, ?, ?)',
                    [no_anggota, nama, alamat, unit]
                );
                results.push({ no_anggota, nama, alamat, unit });
            }
        }

        res.json({ message: `Successfully imported ${results.length} members.`, count: results.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process Excel file' });
    }
});

app.post('/api/upload-logo', upload.single('logo'), (req, res) => {
    if (!req.file) return res.status(400).send('No logo uploaded.');
    res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/members', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM members ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/members/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/members', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE members');
        res.json({ message: 'All members cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
