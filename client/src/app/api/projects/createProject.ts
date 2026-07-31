import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { indexGithubRepo } from "@/lib/github-loader";
import { pollCommits } from "@/lib/github";
export async function createProject(req: NextRequest) {
    try {
        const { name, githubUrl,githubToken } = await req.json();
        if (!name || !githubUrl) {
            return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
        }
        const session = await getSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const project = await prisma.project.create({
            data: {
                name,
                githubUrl,
                userToProjects: {
                    create: {
                        userId,
                    },
                },
            },

            include: {
                userToProjects: {
                    include: { user: true },
                },
            },
        });
        try {
            await indexGithubRepo(project.id, githubUrl, githubToken);
        } catch (indexErr) {
            console.error("Error indexing GitHub repo:", indexErr);
        }

        try {
            await pollCommits(project.id);
        } catch (commitErr) {
            console.error("Error polling commits:", commitErr);
        }

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to create project" },
            { status: 500 }
        );
    }

}