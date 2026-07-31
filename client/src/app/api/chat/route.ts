import { NextResponse } from "next/server";
import { groqClient } from "@/lib/groq";
import { generateEmbedding } from "@/lib/gemini";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { question, projectId, model = "llama-3.3-70b-versatile" } = await req.json();

        if (!question || !projectId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let queryVector: number[] = [];
        try {
            queryVector = await generateEmbedding(question);
        } catch (e) {
            console.error("Embedding generation error:", e);
        }

        const vectorQuery = `[${queryVector.join(",")}]`;

        let result = await prisma.$queryRaw`
        SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS "similarity"
        FROM "SourceCodeEmbedding"
        WHERE "projectId" = ${projectId}
        ORDER BY "similarity" DESC 
        LIMIT 10
      ` as {
            fileName: string;
            sourceCode: string;
            summary: string;
        }[];

        if (!result || result.length === 0) {
            const dbDocs = await prisma.sourceCodeEmbedding.findMany({
                where: { projectId },
                take: 8,
                select: {
                    fileName: true,
                    sourceCode: true,
                    summary: true,
                },
            });
            result = dbDocs as any;
        }

        let context = "";
        for (const doc of (result || [])) {
            context += `source: ${doc.fileName}\n code content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`;
        }

        const stream = await groqClient.chat.completions.create({
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
            model: model || "llama-3.3-70b-versatile",
            temperature: 0.2,
            stream: true,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                const referencesHeader = JSON.stringify({ filesRefrences: result || [] }) + "\n---CODESAGE_SPLIT---\n";
                controller.enqueue(encoder.encode(referencesHeader));

                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Chat API streaming error:", error);
        return NextResponse.json({ error: error?.message || "Failed to generate AI response" }, { status: 500 });
    }
}
