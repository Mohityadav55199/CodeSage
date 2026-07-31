import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pollCommits } from "@/lib/github";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const repositoryUrl = body.repository?.html_url;

        if (!repositoryUrl) {
            return NextResponse.json({ message: "No repository URL in webhook" }, { status: 200 });
        }

        // Find associated projects by GitHub URL
        const projects = await prisma.project.findMany({
            where: {
                githubUrl: {
                    contains: repositoryUrl,
                    mode: 'insensitive',
                },
            },
        });

        // Trigger commit polling in background for all matching projects
        for (const proj of projects) {
            pollCommits(proj.id).catch((err) => console.error("Webhook pollCommits error:", err));
        }

        return NextResponse.json({ success: true, count: projects.length }, { status: 200 });
    } catch (error: any) {
        console.error("GitHub webhook error:", error);
        return NextResponse.json({ error: error?.message || "Webhook processing failed" }, { status: 500 });
    }
}
