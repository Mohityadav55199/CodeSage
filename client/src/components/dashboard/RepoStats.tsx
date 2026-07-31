"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileCode, Database, GitCommit, Code2, Cpu } from "lucide-react";
import { useProject } from "../ProjectProvider";
import { useQuery } from "@tanstack/react-query";

export function RepoStats() {
    const { projectId } = useProject();

    const { data: stats } = useQuery({
        queryKey: ["repo-stats", projectId],
        queryFn: async () => {
            if (!projectId) return null;
            const res = await fetch(`/api/projects/${projectId}`);
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!projectId,
    });

    const fileCount = stats?._count?.sourceCodeEmbeddings || 0;
    const commitCount = stats?._count?.commits || 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                <CardContent className="p-0 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                        <FileCode className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Files Indexed</p>
                        <p className="text-2xl font-black text-foreground">{fileCount}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                <CardContent className="p-0 flex items-center gap-4">
                    <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/20">
                        <Database className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vector Embeddings</p>
                        <p className="text-2xl font-black text-foreground">{fileCount > 0 ? `${fileCount} (pgvector)` : "0"}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                <CardContent className="p-0 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                        <GitCommit className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commits Tracked</p>
                        <p className="text-2xl font-black text-foreground">{commitCount}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                <CardContent className="p-0 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Model Engine</p>
                        <p className="text-base font-black text-foreground">Groq Llama 3.3</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
