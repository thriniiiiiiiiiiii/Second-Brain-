
require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API Key");
    process.exit(1);
}

async function list() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

list();
