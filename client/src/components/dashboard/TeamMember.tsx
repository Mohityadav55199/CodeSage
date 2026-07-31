"use client";

import React from "react";
import { useProject } from "../ProjectProvider";
import { useTeamMembers } from "@/hooks/use-get-projects";

const TeamMembers = () => {
    const { projectId } = useProject();

    // useTeamMembers should be a React Query hook
    const { data: members, isLoading } = useTeamMembers(projectId as string);

    // Optional: you can show a small local spinner while the global loader covers everything
    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {members?.map((member) => {
                const avatarSrc = member.user.imageUrl && member.user.imageUrl.trim() !== ""
                    ? member.user.imageUrl
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.user.name || member.user.email || member.id)}`;

                return (
                    <img
                        key={member.id}
                        src={avatarSrc}
                        alt={member.user.name || "Team Member"}
                        height={30}
                        width={30}
                        className="rounded-full object-cover border border-border"
                    />
                );
            })}
        </div>
    );
};

export default TeamMembers;
