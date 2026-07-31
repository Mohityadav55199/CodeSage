import Groq from "groq-sdk";
import { createGroq } from "@ai-sdk/groq";
import { Document } from "@langchain/core/documents";

const apiKey = process.env.GROQ_API_KEY;

export const groqProvider = createGroq({
  apiKey: apiKey || "",
});

export const groqClient = new Groq({
  apiKey: apiKey || "",
});

export const aiSummariseCommit = async (diff: string) => {
  if (!process.env.GROQ_API_KEY) {
    return "Commit summary unavailable (GROQ_API_KEY missing)";
  }

  try {
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines.
A line starting with '+' means added.
A line starting with '-' means deleted.
Summarise the diff concisely into clear bullet points.`,
        },
        {
          role: "user",
          content: `Please summarise the following diff file: \n\n${diff}`,
        },
      ],
    });

    return response.choices[0]?.message?.content || "No summary generated.";
  } catch (error) {
    console.error("Groq commit summary error:", error);
    return "Failed to summarise commit.";
  }
};

export async function summariseCode(doc: Document) {
  if (!process.env.GROQ_API_KEY) {
    return `Code file: ${doc.metadata.source}`;
  }

  const code = doc.pageContent.slice(0, 10000);
  try {
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an intelligent senior software engineer onboarding a junior developer onto a project. Provide a summary of the code in no more than 100 words.",
        },
        {
          role: "user",
          content: `File: ${doc.metadata.source}\nCode:\n${code}`,
        },
      ],
    });

    return response.choices[0]?.message?.content || `Code file: ${doc.metadata.source}`;
  } catch (error) {
    console.error("Groq code summary error:", error);
    return `Code file: ${doc.metadata.source}`;
  }
}
