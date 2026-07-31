"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Search,
    Sun,
    Moon,
    Monitor,
    LayoutDashboard,
    PlusCircle,
    MessageCircle,
    FolderKanban,
    Sparkles,
    ShieldAlert,
} from "lucide-react";
import { useProject } from "./ProjectProvider";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { setTheme } = useTheme();
    const { projects, setProjectId } = useProject();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search projects..." />
            <CommandList className="max-h-[350px] overflow-y-auto no-scrollbar">
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/"))}
                        className="cursor-pointer"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                        <span>Dashboard Home</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/create"))}
                        className="cursor-pointer"
                    >
                        <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>Create New Project</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/qa"))}
                        className="cursor-pointer"
                    >
                        <MessageCircle className="mr-2 h-4 w-4 text-sky-500" />
                        <span>Q&A History</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Projects">
                    {projects?.map((proj) => (
                        <CommandItem
                            key={proj.id}
                            onSelect={() =>
                                runCommand(() => {
                                    setProjectId(proj.id);
                                    router.push(`/project/${proj.id}`);
                                })
                            }
                            className="cursor-pointer"
                        >
                            <FolderKanban className="mr-2 h-4 w-4 text-indigo-400" />
                            <span>{proj.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Theme Settings">
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))} className="cursor-pointer">
                        <Sun className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Switch to Light Theme</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))} className="cursor-pointer">
                        <Moon className="mr-2 h-4 w-4 text-sky-400" />
                        <span>Switch to Dark Theme</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("system"))} className="cursor-pointer">
                        <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Use System Preference</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
