import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message, carbonMg, cpuState } = req.body;

    try {
        // We define the language rule HERE so the AI cannot ignore it
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are EcoTrack AI. Always reply in Hinglish (Hindi + English). Use Romanized Hindi (e.g., 'Aapka' instead of 'आपका'). Keep it professional but friendly."
        });

        const prompt = `
            Context: Carbon impact is ${carbonMg}mg, CPU is ${cpuState}.
            User Question: "${message}"
            
            Instruction: Respond in 2 short sentences using Hinglish.
        `;

        const result = await model.generateContent(prompt);
        res.status(200).json({ response: result.response.text() });
    } catch (error) {
        res.status(500).json({ response: "Server thoda slow hai, please try again!" });
    }
}
