import { create } from "zustand";

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;      //YYYY-MM-DD
  startHour: number; // 0-23
  startMin: number;  // 0 or 30
  duration: number;  // 分単位
  color: string;
  type: "meeting" | "task" | "personal" | "deadline";
}

export interface ScheduleMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  roleOrder: number; // 役職順ソート用
  avatarColor: string;
  pinned: boolean;
  events: ScheduleEvent[];
}

interface ScheduleStore {
  members: ScheduleMember[];
  searchQuery: string;
  viewMode: "day" | "month";
  selectedDate: string; // YYYY-MM-DD

  togglePin: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setViewMode: (mode: "day" | "month") => void;
  setSelectedDate: (date: string) => void;
}

const today = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
})();

const INITIAL_MEMBERS: ScheduleMember[] = [ //ダミーデータだからあとでもちろん自動取得に変えること
  {
    id: "or",
    name: "ORU Admin",
    initials: "OR",
    role: "代表",
    roleOrder: 1,
    avatarColor: "#4a9eff",
    pinned: true, // 自分は常にピン
    events: [
      {
        id: "or1",
        title: "GATE21 設計レビュー",
        date: "2026-03-10",
        startHour: 10,
        startMin: 0,
        duration: 60,
        color: "#00d4aa",
        type: "meeting",
      },
      {
        id: "or2",
        title: "暗号化方式 調査",
        date: "2026-03-10",
        startHour: 13,
        startMin: 0,
        duration: 120,
        color: "#4a9eff",
        type: "task",
      },
      {
        id: "or3",
        title: "週次MTG",
        date: "2026-03-10",
        startHour: 16,
        startMin: 0,
        duration: 60,
        color: "#f59e0b",
        type: "meeting",
      },
    ],
  },
  {
    id: "tk",
    name: "田川 健",
    initials: "TK",
    role: "エンジニア",
    roleOrder: 3,
    avatarColor: "#f59e0b",
    pinned: false,
    events: [
      {
        id: "tk1",
        title: "DB設計",
        date: "2026-03-11",
        startHour: 9,
        startMin: 0,
        duration: 90,
        color: "#4a9eff",
        type: "task",
      },
      {
        id: "tk2",
        title: "週次MTG",
        date: "2026-03-10",
        startHour: 16,
        startMin: 0,
        duration: 60,
        color: "#f59e0b",
        type: "meeting",
      },
    ],
  },
  {
    id: "mk",
    name: "松田 恵",
    initials: "MK",
    role: "営業",
    roleOrder: 4,
    avatarColor: "#2ecc71",
    pinned: false,
    events: [
      {
        id: "mk1",
        title: "顧客B 契約更新打合せ",
        date: "2026-04-10",
        startHour: 11,
        startMin: 0,
        duration: 60,
        color: "#2ecc71",
        type: "meeting",
      },
      {
        id: "mk2",
        title: "提案書作成",
        date: "2026-03-10",
        startHour: 14,
        startMin: 0,
        duration: 120,
        color: "#4a9eff",
        type: "task",
      },
    ],
  },
  {
    id: "ys",
    name: "山田 誠",
    initials: "YS",
    role: "インフラ",
    roleOrder: 3,
    avatarColor: "#9b59b6",
    pinned: false,
    events: [
      {
        id: "ys1",
        title: "AWS環境構築",
        date: "2026-03-10",
        startHour: 9,
        startMin: 30,
        duration: 180,
        color: "#9b59b6",
        type: "task",
      },
      {
        id: "ys2",
        title: "週次MTG",
        date: "2026-05-10",
        startHour: 16,
        startMin: 0,
        duration: 60,
        color: "#f59e0b",
        type: "meeting",
      },
    ],
  },
  {
    id: "km",
    name: "木村 誠一郎",
    initials: "KS",
    role: "マネージャー",
    roleOrder: 2,
    avatarColor: "#6366f1",
    pinned: false,
    events: [
      {
        id: "km1",
        title: "経営会議",
        date: "2026-03-10",
        startHour: 10,
        startMin: 0,
        duration: 90,
        color: "#6366f1",
        type: "meeting",
      },
      {
        id: "km2",
        title: "GATE21 進捗確認",
        date: "2026-03-10",
        startHour: 15,
        startMin: 0,
        duration: 30,
        color: "#00d4aa",
        type: "meeting",
      },
    ],
  },
];

export const useScheduleStore = create<ScheduleStore>((set) => ({
  members: INITIAL_MEMBERS,
  searchQuery: "",
  viewMode: "day",
  selectedDate: today,

  togglePin: (id) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id && m.id !== "or" // 自分はピン解除不可
          ? { ...m, pinned: !m.pinned }
          : m
      ),
    })),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));