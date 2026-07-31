"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { useTheme } from 'next-themes'
import useRefetch from '@/hooks/use-refetch'
import MarkdownPreview from '@uiw/react-markdown-preview';
import CodeRefrence from './code-refrence'
import { useSaveAnswer } from '@/hooks/use-save-answer'
import { useProject } from '../ProjectProvider'
import { useAuth } from '../AuthProvider'
import { Sparkles, Loader2, ArrowRight, Cpu } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const AskQuestionCard = () => {
    const { projectId } = useProject();
    const { user } = useAuth();
    const userId = user?.id;
    const theme = useTheme();
    const [question, setQuestion] = useState('')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [filesReferences, setFilesReferences] = useState<{ fileName: string, sourceCode: string, summary: string }[]>([])
    const [answer, setAnswer] = useState('')
    const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile")

    const saveAnswer = useSaveAnswer();
    const refetch = useRefetch();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setAnswer('')
        setFilesReferences([])

        if (!projectId || !question.trim()) return
        setLoading(true)
        setOpen(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    projectId,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to connect to AI streaming service");
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No readable stream");

            const decoder = new TextDecoder();
            let isHeaderProcessed = false;
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const textChunk = decoder.decode(value, { stream: true });
                buffer += textChunk;

                if (!isHeaderProcessed && buffer.includes("\n---CODESAGE_SPLIT---\n")) {
                    const parts = buffer.split("\n---CODESAGE_SPLIT---\n");
                    try {
                        const header = JSON.parse(parts[0]);
                        setFilesReferences(header.filesRefrences || []);
                    } catch (err) {
                        console.error("Failed to parse metadata header", err);
                    }
                    isHeaderProcessed = true;
                    buffer = parts[1] || "";
                    setAnswer(buffer);
                } else if (isHeaderProcessed) {
                    setAnswer((prev) => prev + textChunk);
                }
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to fetch streaming answer")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[75vw] border border-border bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                    <DialogHeader className="p-6 md:p-8 pb-4 border-b border-border relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-foreground">CodeSage Analysis</DialogTitle>
                                    <p className="text-xs text-muted-foreground font-medium">Model: {selectedModel}</p>
                                </div>
                            </div>

                            <Button
                                className="rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-lg transition-all"
                                disabled={saveAnswer.isPending || !answer}
                                onClick={() => {
                                    if (!userId || !projectId) {
                                        toast.error(!userId ? "User ID missing" : "Project ID missing")
                                        return
                                    }

                                    saveAnswer.mutate(
                                        {
                                            projectId: projectId as string,
                                            question,
                                            answer,
                                            filesRefrences: filesReferences,
                                            userId,
                                        },
                                        {
                                            onSuccess: () => {
                                                toast.success('Answer saved to your knowledge base')
                                                refetch();
                                            },
                                            onError: () => {
                                                toast.error("Failed to save answer");
                                            },
                                        }
                                    )
                                }}
                            >
                                {saveAnswer.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : "Save Insight"}
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-6 md:p-8 space-y-8 relative z-10 overflow-y-auto max-h-[70vh] no-scrollbar">
                        {loading && !answer && (
                            <div className="flex items-center gap-3 text-muted-foreground p-6">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="font-medium text-sm">Synthesizing code analysis with {selectedModel}...</span>
                            </div>
                        )}

                        {answer && (
                            <MarkdownPreview
                                source={answer}
                                className='rounded-2xl border border-border bg-muted/40 p-6 text-foreground'
                                style={{ background: 'transparent' }}
                                wrapperElement={{
                                    "data-color-mode": theme.theme === 'dark' ? 'dark' : 'light',
                                }}
                            />
                        )}

                        {filesReferences.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">References Found ({filesReferences.length})</h3>
                                <CodeRefrence filesRefrences={filesReferences} />
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-muted/30 backdrop-blur-md border-t border-border flex justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => { setOpen(false) }}
                            className="font-bold text-muted-foreground hover:text-foreground"
                        >
                            Dismiss
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Card className='relative col-span-3 border border-border bg-card/70 backdrop-blur-md overflow-hidden group shadow-lg'>
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="h-24 w-24 text-primary rotate-12" />
                </div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black">Ask a question</CardTitle>
                        <p className="text-sm text-muted-foreground">Deep dive into your codebase with AI intelligence.</p>
                    </div>

                    {/* Groq Model Selector */}
                    <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger className="w-[190px] h-9 text-xs rounded-xl border-border bg-background">
                                <SelectValue placeholder="Select AI Model" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Smart)</SelectItem>
                                <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</SelectItem>
                                <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B (Deep)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <Textarea
                            className='min-h-[120px] border border-input bg-background/80 rounded-2xl focus-visible:ring-primary/40 transition-all resize-none p-6 text-base placeholder:text-muted-foreground/60 shadow-inner'
                            placeholder='e.g., Which file handles authentication and user sessions?'
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <Button 
                            type='submit' 
                            disabled={loading || !question.trim()}
                            className="w-full sm:w-auto px-8 py-6 rounded-2xl font-bold bg-primary text-primary-foreground hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    Synthesizing...
                                </>
                            ) : (
                                <>
                                    Ask CodeSage
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard
