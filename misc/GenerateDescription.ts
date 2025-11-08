import OpenAI from "openai";

const sdk = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY });

let descriptionsCache = new Map<string, string>();

export default async function GenerateDescription(modelName: string): Promise<string | null | undefined> {
    try {
        if (descriptionsCache.has(modelName)) return descriptionsCache.get(modelName);

        const prompt = `Write a short, professional description (2-3 sentences) of an AI model based on its name. Infer the model's purpose from the name if possible. The tone should be clear and suitable for an AI platform. Do not include any labels, explanations, or extra formatting - only output the description text.`;

        const response = await sdk.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [
                {
                    role: 'system',
                    content: prompt
                },
                {
                    role: 'user',
                    content: modelName
                }
            ]
        });

        const final = response.choices[0]?.message.content;
        if (final) descriptionsCache.set(modelName, final!); 
        
        return final;
    } catch (error) {
        console.error(error);
        return null;
    }
}