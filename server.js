const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware to handle JSON
app.use(express.json());

// 1. API ROUTES
app.post('/api/audit', (req, res) => {
    const { bytes } = req.body; 
    const totalBytes = bytes || 0;
    const carbonMg = (totalBytes * 0.0005).toFixed(2); 
    res.json({ carbonMg: carbonMg });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are EcoTrack AI. Always reply in Hinglish."
        });
        const result = await model.generateContent(message);
        res.json({ response: result.response.text() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ response: "AI busy hai, try again!" });
    }
});

// 2. STATIC FILES (This serves your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, './')));

// 3. START SERVER (The crucial part for Render)
const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
