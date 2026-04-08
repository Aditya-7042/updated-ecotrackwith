const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, './'))); // Serves your HTML/CSS/JS

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Your AI Route
app.post('/api/chat', async (req, res) => {
    const { message, carbonMg, cpuState } = req.body;
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are EcoTrack AI. Always reply in Hinglish."
        });
        const result = await model.generateContent(message);
        res.json({ response: result.response.text() });
    } catch (e) {
        res.status(500).json({ response: "Error!" });
    }
});

app.listen(port,'0.0.0.0', () => console.log(`Server running on port ${port}`);
           });
