const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, './'))); 

// --- 1. CARBON AUDIT ROUTE (Put it here!) ---
app.post('/api/audit', (req, res) => {
    const { dataTransferred } = req.body;
    const carbonMg = (dataTransferred * 0.0005).toFixed(2); 
    res.json({ carbonMg: carbonMg });
});

// --- 2. AI CHAT ROUTE ---
app.post('/api/chat', async (req, res) => {
    // Your Gemini AI logic goes here
});

// --- 3. SERVER START (Keep this at the very bottom) ---
const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
