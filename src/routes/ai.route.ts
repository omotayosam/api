import { Router } from 'express';

const aiRoutes: Router = Router();

// Dynamic import for ES module
async function createGenAI() {
    const { GoogleGenAI } = await import('@google/genai');
    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
    });
}

aiRoutes.post('/chat', async (req, res) => {
    try {
        const { messages = [], input = '' } = req.body || {};

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // Create AI client using dynamic import
        const ai = await createGenAI();

        // Convert message history to Gemini format
        let contents = [];

        // Add system instruction as first message
        contents.push({
            role: 'user',
            parts: [{ text: 'You are a helpful assistant for a sports admin platform. Be concise and safe.' }]
        });
        contents.push({
            role: 'model',
            parts: [{ text: 'I understand. I\'m here to help with sports administration tasks. How can I assist you?' }]
        });

        // Add conversation history
        if (Array.isArray(messages)) {
            messages.forEach((m: any) => {
                contents.push({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: String(m.content || '') }],
                });
            });
        }

        // Add current user input
        if (input) {
            contents.push({
                role: 'user',
                parts: [{ text: String(input) }]
            });
        }

        // Use the correct API method
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: contents,
        });

        res.json({ text: response.text });
    } catch (e: any) {
        console.error('AI chat error:', e);
        res.status(500).json({
            error: 'AI error',
            details: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

export default aiRoutes;