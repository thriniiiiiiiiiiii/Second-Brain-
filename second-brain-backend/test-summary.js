
async function test(provider) {
    console.log(`Testing provider: ${provider}...`);
    try {
        const res = await fetch('http://localhost:3000/api/ai/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-AI-Provider': provider
            },
            body: JSON.stringify({
                content: "Knowledge Weaver is an AI-powered second brain application designed to help you capture, organize, and synthesize your thoughts. It combines a modern, responsive React frontend with a robust Next.js backend to provide intelligent note management, pattern recognition, and semantic search."
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Status ${res.status}: ${txt}`);
        }

        const data = await res.json();
        console.log(`✅ Success (${provider}):`, data.summary.substring(0, 50) + "...");
    } catch (err) {
        console.error(`❌ Failed (${provider}):`, err.message);
    }
}

async function run() {
    await test('gemini');
    // await test('auto');
    // await test('ollama'); // Optional, might fail if ollama not running
}

run();
