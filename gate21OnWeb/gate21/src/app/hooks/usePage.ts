//app/hooks/usePage.ts
"use client";
import {useState} from "react";
import type {PageId, Project} from "@/app/types";

export function usePage() {
    const [pageId, setPageId] = useState<PageId>("dashboard");
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

    const goPage = (id: PageId) => setPageId(id);
    const openProject = (project: Project) => {
        setCurrentProject(project);
        setPageId("projDash");
    };

    const goHome = () => {
        setCurrentProject(null);
        setPageId("dashboard");
    };

    return {pageId, currentProject, goPage, openProject, goHome};
}