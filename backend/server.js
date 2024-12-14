const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "sesmag",
});

db.connect((err) => {
    if (err) throw err;
    console.log("Database connected!");
});

// Upload route
app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        const data = await pdfParse(req.file);
        console.log("PDF Content:", data.text);
        res.status(200).json({ message: "File uploaded successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error processing PDF." });
    }
});

// Chat route
app.post("/api/chat", async (req, res) => {
    const { query } = req.body;
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                messages: [{ role: "user", content: query }],
                model: "gpt-4",
            },
            { headers: { Authorization: `Bearer YOUR_API_KEY` } }
        );
        res.status(200).json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "AI response error." });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
