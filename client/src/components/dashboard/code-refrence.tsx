"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Copy, Check, FileCode } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
    filesRefrences: {
        fileName: string;
        sourceCode: string;
        summary: string;
    }[]
}

const CodeRefrence = ({ filesRefrences }: Props) => {
    const [tab, setTab] = useState(filesRefrences[0]?.fileName || "");
    const [copied, setCopied] = useState(false);

    if (!filesRefrences || filesRefrences.length === 0) return null

    const activeFile = filesRefrences.find((f) => f.fileName === (tab || filesRefrences[0]?.fileName));

    const handleCopy = () => {
        if (!activeFile?.sourceCode) return;
        navigator.clipboard.writeText(activeFile.sourceCode);
        setCopied(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='w-full rounded-2xl border border-border bg-card/60 backdrop-blur-md p-4 space-y-3 shadow-md'>
            <Tabs value={tab || filesRefrences[0]?.fileName} onValueChange={setTab}>
                <div className='flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-border no-scrollbar'>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {filesRefrences.map((file) => (
                            <button
                                type="button"
                                onClick={() => setTab(file.fileName)}
                                key={file.fileName}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap border border-transparent',
                                    (tab || filesRefrences[0]?.fileName) === file.fileName
                                        ? 'bg-primary text-primary-foreground border-primary/20 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                )}
                            >
                                <FileCode className="h-3.5 w-3.5" />
                                {file.fileName}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 gap-1.5 text-xs font-semibold rounded-xl border-border bg-background/80 hover:bg-accent shrink-0"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy Code"}
                    </Button>
                </div>

                {filesRefrences.map((file) => (
                    <TabsContent key={file.fileName} value={file.fileName} className='mt-3 max-h-[40vh] overflow-y-auto rounded-xl border border-border'>
                        <SyntaxHighlighter
                            language='typescript'
                            style={oneDark}
                            customStyle={{ margin: 0, padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}
                        >
                            {file.sourceCode}
                        </SyntaxHighlighter>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default CodeRefrence