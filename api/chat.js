import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { message, carbonMg, cpuState } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are EcoTrack AI.
            Stats: Carbon impact is ${carbonMg} and CPU is ${cpuState}.
            User query: "${message}"
            
            Response Style:
            1. Use Hinglish.
            2. Be short and helpful.
            3. If carbon > 200mg, give 1 technical tip to save data.
        `;

        const result = await model.generateContent(prompt);
        res.status(200).json({ response: result.response.text() });
    } catch (error) {
        res.status(500).json({ response: "AI connection error!" });
    }
}
