import { NextResponse } from "next/server";
import { groqClient } from "@/lib/groq";

export async function POST(req: Request) {
    try {
        const { codeSnippet, mode = "security" } = await req.json();

        if (!codeSnippet || !codeSnippet.trim()) {
            return NextResponse.json({ error: "Code snippet is required" }, { status: 400 });
        }

        let systemPrompt = "";
        if (mode === "security") {
            systemPrompt = "You are an expert Cybersecurity & Code Auditor. Analyze the provided code for security vulnerabilities, hardcoded secrets, injection risks, and OWASP Top 10 flaws. Provide clear risk levels and concrete security fixes.";
        } else if (mode === "optimize") {
            systemPrompt = "You are a Senior Principal Software Engineer. Analyze the provided code for performance bottlenecks, unnecessary re-renders, high memory consumption, and O(N^2) complexity. Provide optimized code refactor suggestions.";
        } else if (mode === "test") {
            systemPrompt = "You are an automated Test Engineering Specialist. Generate comprehensive unit tests (Jest/TypeScript/React Testing Library) with full edge case coverage for the provided code.";
        }

        const completion = await groqClient.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Code Snippet:\n\`\`\`typescript\n${codeSnippet}\n\`\`\`\n\nProvide your analysis with clear Markdown formatting.` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
        });

        const output = completion.choices[0]?.message?.content || "No analysis generated.";
        return NextResponse.json({ output }, { status: 200 });
    } catch (error: any) {
        console.error("Refactor API error:", error);
        return NextResponse.json({ error: error?.message || "Failed to process refactoring" }, { status: 500 });
    }
}
