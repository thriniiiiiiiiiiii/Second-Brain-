const { GoogleGenerativeAI } = require("@google/generative-ai"); // Use require for node script

require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing!");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Fetching models...");
    try {
        // Unfortunately, the SDK doesn't expose listModels directly in the main class easily in some versions,
        // but let's try via the model manager if available, or just test a few common ones.
        // Actually, looking at docs, it might be separate.
        // Let's just try to generate content with a few known models.

        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-2.0-flash-exp"];

        for (const modelName of modelsToTest) {
            console.log(`Testing ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ ${modelName} works!`);
            } catch (err) {
                console.log(`❌ ${modelName} failed: ${err.message.split('\n')[0]}`);
            }
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

listModels();
