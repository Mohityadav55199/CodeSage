"use server"

import { groqClient } from "@/lib/groq"
import { generateEmbedding } from "@/lib/gemini"
import prisma from "@/lib/prisma"

export async function askQuestion(question: string, projectId: string) {
    let queryVector: number[] = [];
    try {
        queryVector = await generateEmbedding(question);
    } catch (e) {
        console.error("Embedding generation error:", e);
    }

    const vectorQuery = `[${queryVector.join(",")}]`

    let result = await prisma.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS "similarity"
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
    ORDER BY "similarity" DESC 
    LIMIT 10
  ` as {
        fileName: string
        sourceCode: string
        summary: string
    }[]

    if (!result || result.length === 0) {
        const dbDocs = await prisma.sourceCodeEmbedding.findMany({
            where: { projectId },
            take: 8,
            select: {
                fileName: true,
                sourceCode: true,
                summary: true,
            },
        })
        result = dbDocs as any
    }

    let context = ""
    for (const doc of (result || [])) {
        context += `source: ${doc.fileName}\n code content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
    }

    try {
        const chatCompletion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are CodeSage, a world-class AI code intelligence assistant. You answer questions about the codebase clearly, accurately, and helpfully based on the context provided."
                },
                {
                    role: "user",
                    content: `START CONTEXT BLOCK\n${context}\nEND OF CONTEXT BLOCK\n\nSTART QUESTION\n${question}\nEND OF QUESTION\n\nExplain the codebase and answer the question in detail with clear Markdown syntax.`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
        });

        const output = chatCompletion.choices[0]?.message?.content || "No response generated.";

        return {
            output,
            filesRefrences: result || [],
        }
    } catch (error: any) {
        console.error("Groq chat error:", error);
        return {
            output: "Sorry, failed to generate an answer. Please verify your GROQ_API_KEY.",
            filesRefrences: result || [],
        }
    }
}
