"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldAlert, Zap, TestTube, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";

export function RefactorCard() {
    const [code, setCode] = useState("");
    const [mode, setMode] = useState<"security" | "optimize" | "test">("security");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [copied, setCopied] = useState(false);
    const theme = useTheme();

    const handleAnalyze = async (selectedMode: "security" | "optimize" | "test") => {
        if (!code.trim()) {
            toast.error("Please paste code snippet first");
            return;
        }

        setMode(selectedMode);
        setLoading(true);
        setOpen(true);
        setAnalysis("");

        try {
            const res = await fetch("/api/refactor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codeSnippet: code, mode: selectedMode }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to analyze code");
            setAnalysis(data.output);
        } catch (err: any) {
            toast.error(err?.message || "Failed to complete code analysis");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!analysis) return;
        navigator.clipboard.writeText(analysis);
        setCopied(true);
        toast.success("Analysis copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[70vw] border border-border bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-0">
                    <DialogHeader className="p-6 pb-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                                    {mode === "security" && <ShieldAlert className="h-5 w-5 text-rose-500" />}
                                    {mode === "optimize" && <Zap className="h-5 w-5 text-amber-500" />}
                                    {mode === "test" && <TestTube className="h-5 w-5 text-emerald-500" />}
                                </div>
                                <DialogTitle className="text-xl font-black capitalize">
                                    CodeSage {mode === "security" ? "Security Audit" : mode === "optimize" ? "Performance Refactor" : "Unit Test Generator"}
                                </DialogTitle>
                            </div>

                            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!analysis} className="gap-1.5 rounded-xl">
                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Copied" : "Copy Analysis"}
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
                        {loading ? (
                            <div className="flex items-center gap-3 p-8 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span>Running AI {mode} analysis with Llama 3.3...</span>
                            </div>
                        ) : (
                            <MarkdownPreview
                                source={analysis}
                                className="rounded-2xl border border-border bg-muted/40 p-6 text-foreground"
                                style={{ background: "transparent" }}
                                wrapperElement={{
                                    "data-color-mode": theme.theme === "dark" ? "dark" : "light",
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="border border-border bg-card/70 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-black">AI Security & Code Refactoring Suite</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">Paste any function or snippet to run instant security audits, optimizations, or test generation.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Paste code snippet here (e.g. const query = `SELECT * FROM users WHERE id = ${id}`)..."
                        className="min-h-[100px] border border-input bg-background/80 rounded-2xl p-4 text-sm font-mono resize-none shadow-inner"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            onClick={() => handleAnalyze("security")}
                            disabled={loading || !code.trim()}
                            className="rounded-xl font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 gap-2"
                        >
                            <ShieldAlert className="h-4 w-4" />
                            Security Audit
                        </Button>

                        <Button
                            type="button"
                            onClick={() => handleAnalyze("optimize")}
                            disabled={loading || !code.trim()}
                            className="rounded-xl font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 gap-2"
                        >
                            <Zap className="h-4 w-4" />
                            Refactor & Optimize
                        </Button>

                        <Button
                            type="button"
                            onClick={() => handleAnalyze("test")}
                            disabled={loading || !code.trim()}
                            className="rounded-xl font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 gap-2"
                        >
                            <TestTube className="h-4 w-4" />
                            Generate Unit Tests
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
