import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { pollCommits } from "@/lib/github";
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const commits = await prisma.commit.findMany({
            where: {
                projectId: id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Always poll in background without blocking GET request
        pollCommits(id).catch((err) => console.error("Background commit polling error:", err));

        return NextResponse.json(commits);
    } catch (error) {
        console.error("Error fetching commits:", error);
        return NextResponse.json(
            { error: "Failed to fetch commits" },
            { status: 500 }
        );
    }
}
