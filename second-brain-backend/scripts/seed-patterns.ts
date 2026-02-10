
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const samples = [
    {
        title: "The PARA Method",
        content: "Building a Second Brain requires organizing information by actionability. Projects (current goals), Areas (ongoing responsibilities), Resources (topics of interest), and Archives (completed items). This structure keeps your digital life uncluttered.",
        type: "note",
        tags: ["productivity", "organization", "system", "second-brain"]
    },
    {
        title: "Understanding LLMs and Transformers",
        content: "Large Language Models like GPT-4 are based on the Transformer architecture. The key innovation is the 'Attention Mechanism', which allows the model to weigh the importance of different words in a sentence regardless of their distance. This enables context-aware generation.",
        type: "insight",
        tags: ["AI", "machine-learning", "tech", "future"]
    },
    {
        title: "Dieter Rams: Good Design is Less Design",
        content: "Good design is innovative, useful, aesthetic, understandable, unobtrusive, honest, long-lasting, thorough down to the last detail, environmentally-friendly, and involves as little design as possible. Simplicity is the ultimate sophistication.",
        type: "note",
        tags: ["design", "minimalism", "principles", "UX"]
    },
    {
        title: "Zone 2 Training for Longevity",
        content: "To improve mitochondrial efficiency, you should spend 80% of your training time in Zone 2 (60-70% of max heart rate). This metabolic state encourages fat oxidation and builds a massive aerobic base, essential for long-term health and endurance.",
        type: "note",
        tags: ["health", "fitness", "biohacking", "longevity"]
    },
    {
        title: "Stoicism: The Dichotomy of Control",
        content: "The core finding of Stoicism is that we should differentiate between what we can control (our actions, judgments) and what we cannot (reputation, outcome, others' opinions). true peace of mind comes from focusing entirely on the former.",
        type: "insight",
        tags: ["philosophy", "mindset", "stoicism", "mental-health"]
    }
];

async function main() {
    console.log("🌱 Starting Database Seed...");

    try {
        // 1. Clear existing data
        console.log("🧹 Clearing existing knowledge...");
        await prisma.knowledge.deleteMany({});
        console.log("✅ Database cleared.");

        // 2. Insert samples
        console.log("📝 Inserting 5 sample notes...");
        for (const sample of samples) {
            await prisma.knowledge.create({
                data: sample
            });
            console.log(`   + Created: ${sample.title}`);
        }

        const count = await prisma.knowledge.count();
        console.log(`\n🎉 Seeding Complete! Total items: ${count}`);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
