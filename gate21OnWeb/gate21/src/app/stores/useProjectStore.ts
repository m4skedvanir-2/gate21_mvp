import { create } from "zustand";

export type ProjectStatus = "backlog" | "active" | "review" | "done" | "hold";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  backlog: "バックログ",
  active:  "進行中",
  review:  "レビュー",
  done:    "完了",
  hold:    "保留",
};

export interface ProjectCard {
  id: string;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  members: string[];
  taskCount: number;
  doneCount: number;
  dueDate?: string;
  label: string;
}

interface ProjectStore {
  projects: ProjectCard[];
  moveProject: (id: string, to: ProjectStatus) => void;
  addProject: (project: ProjectCard) => void;
}

const INITIAL_PROJECTS: ProjectCard[] = [
  {
    id: "gate21",
    name: "GATE21",
    label: "GATE21",
    description: "企業の秘密資産管理・ToDo・メッセージを統合した業務アプリ",
    color: "#00d4aa",
    status: "active",
    members: ["OR", "TK", "MK"],
    taskCount: 8,
    doneCount: 2,
    dueDate: "2026.06.30",
  },
  {
    id: "orucore",
    name: "ORUCore",
    label: "ORUCore",
    description: "社内インフラ・認証基盤の整備プロジェクト",
    color: "#4a9eff",
    status: "active",
    members: ["OR", "YS"],
    taskCount: 5,
    doneCount: 1,
    dueDate: "2026.04.15",
  },
  {
    id: "saloops",
    name: "Saloops",
    label: "Saloops",
    description: "クライアント向けSaaSプロダクトの開発",
    color: "#f59e0b",
    status: "review",
    members: ["OR", "TK", "YS", "MK"],
    taskCount: 12,
    doneCount: 10,
    dueDate: "2026.03.31",
  },
  {
    id: "infra",
    name: "インフラ整備",
    label: "INFRA",
    description: "AWS環境の再構築・コスト最適化",
    color: "#9b59b6",
    status: "backlog",
    members: ["YS"],
    taskCount: 6,
    doneCount: 0,
  },
  {
    id: "doc",
    name: "社内ドキュメント整備",
    label: "DOC",
    description: "各種業務フロー・仕様書のドキュメント化",
    color: "#2ecc71",
    status: "hold",
    members: ["MK"],
    taskCount: 3,
    doneCount: 0,
  },
];

const AVATAR_COLORS: Record<string, string> = {
  OR: "#4a9eff",
  TK: "#f59e0b",
  MK: "#2ecc71",
  YS: "#9b59b6",
};

export { AVATAR_COLORS };

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: INITIAL_PROJECTS,

  moveProject: (id, to) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: to } : p
      ),
    })),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),
}));