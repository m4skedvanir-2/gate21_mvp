// app/types/index.ts

//ページ
export type PageId =
    | "dashboard"
    | "projects"
    | "messages"
    | "documents"
    | "projDash";

//Project
//作成ページで自動追加？
export type ProjectId = string;

export interface Project {
    id: ProjectId;
    label: string;
    color: string;
}

//テーマ
export type Theme = "dark" | "light";