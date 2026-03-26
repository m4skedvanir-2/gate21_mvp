// app/stores/useTodoStore.ts

import { create } from "zustand";

// ── 型定義 ──
export type TagType = "ui" | "sec" | "plan" | "dev" | "urg";
export type DueType = "ok" | "warn" | "late";
export type LaneId = "urgent" | "todo" | "wip" | "done";

export interface TodoCard {
  id: string;
  title: string;
  spec: string;
  tags: TagType[];
  project?: string;
  projectId?: string;
  due?: { label: string; type: DueType };
  avatarColor: string;
  avatarInitials: string;
  urgent?: boolean;
  done?: boolean;
}

export interface Lane {
  id: LaneId;
  label: string;
  dotColor: string;
  countStyle: React.CSSProperties;
  cards: TodoCard[];
}

interface TodoStore {
  lanes: Lane[];
  openLanes: Record<LaneId, boolean>;

  // カードのレーン間移動
  moveCard: (cardId: string, fromLane: LaneId, toLane: LaneId) => void;
  // レーン内並び替え
  reorderCard: (laneId: LaneId, fromIndex: number, toIndex: number) => void;
  // 完了トグル
  toggleDone: (cardId: string) => void;
  // レーン開閉
  toggleLane: (id: LaneId) => void;
}

const INITIAL_LANES: Lane[] = [
  {
    id: "urgent",
    label: "緊急対応",
    dotColor: "var(--red)",
    countStyle: {
      background: "var(--red-bg)",
      color: "var(--red)",
      borderColor: "rgba(224,82,82,.25)",
    },
    cards: [
      {
        id: "u1",
        title: "本番APIキーの更新対応",
        spec: "最終更新から60日超過。セキュリティポリシー上、30日ごとの更新が必要。対象：本番環境APIキー群（GATE21）。更新後は秘密資産管理に登録し直すこと。",
        tags: ["urg", "sec"],
        projectId: "gate21",
        project: "GATE21",
        due: { label: "期限超過", type: "late" },
        avatarColor: "#4a9eff",
        avatarInitials: "OR",
        urgent: true,
      },
    ],
  },
  {
    id: "todo",
    label: "TODO",
    dotColor: "var(--blue)",
    countStyle: {
      background: "var(--blue-bg)",
      color: "var(--blue)",
      borderColor: "rgba(74,158,255,.2)",
    },
    cards: [
      {
        id: "t1",
        title: "暗号化技術の調査",
        spec: "AES-256-GCM と ChaCha20-Poly1305 を比較検討。パフォーマンス・Tauri統合難易度・ライブラリ成熟度の観点で比較表を作成。",
        tags: ["sec"],
        projectId: "gate21",
        project: "GATE21",
        due: { label: "3/10", type: "warn" },
        avatarColor: "#4a9eff",
        avatarInitials: "OR",
      },
      {
        id: "t2",
        title: "認証フロー設計（ログイン＋デバイス制限）",
        spec: "JWT + リフレッシュトークン方式。デバイス制限：初回ログイン時にデバイスIDを登録、以降は同デバイスのみ許可。",
        tags: ["sec"],
        projectId: "gate21",
        project: "GATE21",
        due: { label: "3/14", type: "ok" },
        avatarColor: "#4a9eff",
        avatarInitials: "OR",
      },
      {
        id: "t3",
        title: "Tauri プロジェクト初期構成セットアップ",
        spec: "Tauri v2 + Next.js 構成で初期プロジェクトを作成。ディレクトリ構成・ESLint・Prettier・Rustツールチェーン整備。",
        tags: ["dev"],
        projectId: "gate21",
        project: "GATE21",
        due: { label: "3/7", type: "ok" },
        avatarColor: "#4a9eff",
        avatarInitials: "OR",
      },
    ],
  },
  {
    id: "wip",
    label: "進行中",
    dotColor: "var(--accent)",
    countStyle: {
      background: "var(--accent-bg)",
      color: "var(--accent)",
      borderColor: "var(--accent-brd)",
    },
    cards: [
      {
        id: "w1",
        title: "GATE21 UI設計・プロトタイプ作成",
        spec: "ダッシュボード・プロジェクト一覧・プロジェクト内ダッシュボードの3画面を設計。ダーク/ライトモード対応。",
        tags: ["ui"],
        projectId: "gate21",
        project: "GATE21",
        due: { label: "3/4", type: "ok" },
        avatarColor: "#4a9eff",
        avatarInitials: "OR",
      },
    ],
  },
  {
    id: "done",
    label: "完了",
    dotColor: "var(--text-3)",
    countStyle: {
      background: "var(--bg-hover)",
      color: "var(--text-2)",
      borderColor: "var(--border)",
    },
    cards: [
      {
        id: "d1",
        title: "スケジュール・タスク生成",
        spec: "3月度スケジュールとタスクリストを作成。プロジェクト目標から逆算してマイルストーンを設定。",
        tags: ["plan"],
        projectId: "gate21",
        project: "GATE21",
        avatarColor: "#4a9eff",
        avatarInitials: "OR",
        done: true,
      },
    ],
  },
];

export const useTodoStore = create<TodoStore>((set) => ({
  lanes: INITIAL_LANES,
  openLanes: {
    urgent: true,
    todo:   true,
    wip:    true,
    done:   false,
  },

  moveCard: (cardId, fromLane, toLane) =>
    set((state) => {
      const lanes = state.lanes.map((lane) => ({ ...lane, cards: [...lane.cards] }));
      const from = lanes.find((l) => l.id === fromLane);
      const to   = lanes.find((l) => l.id === toLane);
      if (!from || !to) return state;
      const cardIndex = from.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;
      const [card] = from.cards.splice(cardIndex, 1);
      // doneレーンに移動したらdoneフラグを立てる
      card.done = toLane === "done";
      to.cards.push(card);
      return { lanes };
    }),

  reorderCard: (laneId, fromIndex, toIndex) =>
    set((state) => {
      const lanes = state.lanes.map((lane) => ({ ...lane, cards: [...lane.cards] }));
      const lane = lanes.find((l) => l.id === laneId);
      if (!lane) return state;
      const [card] = lane.cards.splice(fromIndex, 1);
      lane.cards.splice(toIndex, 0, card);
      return { lanes };
    }),

  toggleDone: (cardId) =>
    set((state) => {
      const lanes = state.lanes.map((lane) => ({
        ...lane,
        cards: lane.cards.map((c) =>
          c.id === cardId ? { ...c, done: !c.done } : c
        ),
      }));
      return { lanes };
    }),

  toggleLane: (id) =>
    set((state) => ({
      openLanes: { ...state.openLanes, [id]: !state.openLanes[id] },
    })),
}));