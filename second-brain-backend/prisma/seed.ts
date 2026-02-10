import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const samples = [
        {
            title: "The Future of AI Agents",
            content: "AI agents are evolving from simple chatbots to autonomous entities capable of planning and executing complex tasks. The shift towards agentic workflows means AI will soon handle entire project lifecycles, from design to deployment.",
            type: "note",
            tags: ["AI", "Future", "Software Development"],
        },
        {
            title: "Quantum Computing: Beyond Bits",
            content: "Unlike classical bits that are either 0 or 1, qubits can exist in a superposition of states. This allows quantum computers to perform certain calculations, like large integer factorization, exponentially faster than current supercomputers.",
            type: "note",
            tags: ["Quantum", "Computing", "Science"],
        },
        {
            title: "Stoicism in the Digital Age",
            content: "Stoicism teaches us to focus only on what we can control and to accept the rest with equanimity. In an era of constant notifications and digital noise, these ancient practices are more relevant than ever for maintaining mental health.",
            type: "note",
            tags: ["Philosophy", "Mental Health", "Productivity"],
        },
        {
            title: "Monorepo Strategy with Turborepo",
            content: "Turborepo simplifies monorepo management by providing high-performance build caching and intelligent task execution. It allows developers to maintain clear boundaries between multiple apps while sharing code and configurations effortlessly.",
            type: "note",
            tags: ["DevOps", "Monorepo", "Web Development"],
        },
        {
            title: "The Ergonomic Developer",
            content: "Good ergonomics isn't just about a fancy chair. It involves proper monitor height, frequent micro-breaks, and maintaining a neutral wrist position. Small adjustments today can prevent chronic strain and long-term injury.",
            type: "note",
            tags: ["Health", "Ergonomics", "Developer Experience"],
        }
    ]

    console.log('Seeding samples...')

    for (const sample of samples) {
        await prisma.knowledge.upsert({
            where: { id: `sample-${sample.title.toLowerCase().replace(/\s+/g, '-')}` },
            update: sample,
            create: {
                id: `sample-${sample.title.toLowerCase().replace(/\s+/g, '-')}`,
                ...sample
            }
        })
    }

    console.log('Successfully synced 5 sample notes!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
