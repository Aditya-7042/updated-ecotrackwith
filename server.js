const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// --- 1. DEFINE API ROUTES FIRST ---
app.post('/api/audit', (req, res) => {
    console.log("Audit request received:", req.body); // This will show in Render logs
    const { dataTransferred } = req.body;
    const carbonMg = (dataTransferred * 0.0005).toFixed(2); 
    res.json({ carbonMg: carbonMg });
});

app.post('/api/chat', async (req, res) => {
    // Your Gemini logic...
});

// --- 2. SERVE STATIC FILES LAST ---
app.use(express.static(path.join(__dirname, './')));

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
