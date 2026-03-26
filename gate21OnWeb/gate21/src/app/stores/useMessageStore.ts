import { create } from "zustand";

export type MessageCategory = "manager" | "team" | "system";

export interface Message {
  id: string;
  from: string;
  role: string;
  category: MessageCategory;
  subject: string;
  preview: string;
  body: string;
  time: string;
  date: string;
  unread: boolean;
  avatarColor: string;
  initials: string;
}

interface MessageStore {
  messages: Message[];
  selectedId: string | null;

  selectMessage: (id: string) => void;
  markAsRead: (id: string) => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    from: "木村 誠一郎",
    role: "上長",
    category: "manager",
    subject: "暗号化方式の選定について",
    preview: "暗号化方式の選定について、来週までに方針をまとめておいてください。",
    body: `お疲れ様です。木村です。

GATE21の暗号化方式の選定について、来週月曜日までに方針をまとめてください。

検討項目：
・AES-256-GCM vs ChaCha20-Poly1305
・Tauriとの統合難易度
・モバイル環境でのパフォーマンス
・ライブラリの成熟度・メンテナンス状況

比較表を作成して共有してください。不明点があれば遠慮なく聞いてください。

よろしくお願いします。`,
    time: "10:32",
    date: "2026.03.04",
    unread: true,
    avatarColor: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    initials: "KS",
  },
  {
    id: "m2",
    from: "田川 健",
    role: "GATE21チーム",
    category: "team",
    subject: "UIプロトタイプ確認しました",
    preview: "UI確認しました。ログインページのモックも共有できますか？",
    body: `お疲れ様です。田川です。

UIプロトタイプ確認しました。全体的にとても見やすくて良いと思います。

いくつか気になった点：
・ダークモードのコントラストが一部低い箇所があります
・TODOカンバンのカード間隔がやや狭いかもしれません

ログインページのモックもできたら共有してもらえますか？
デバイス認証のフローも確認したいです。

よろしくお願いします。`,
    time: "09:55",
    date: "2026.03.04",
    unread: true,
    avatarColor: "linear-gradient(135deg, #f59e0b, #d97706)",
    initials: "TK",
  },
  {
    id: "m3",
    from: "松田 恵",
    role: "ORUCore",
    category: "team",
    subject: "顧客B 契約更新書類について",
    preview: "顧客Bの契約更新、今月中に書類を揃えてください。",
    body: `お疲れ様です。松田です。

顧客B（Beta Labs Inc.）の契約更新期限が3月15日に迫っています。

必要書類：
・契約更新書類（双方署名済み）
・見積書（更新後金額を反映）
・作業範囲定義書（SOW）

今月中に書類を揃えてGATEに提出してください。
期限を過ぎると自動失効になりますのでご注意ください。

よろしくお願いします。`,
    time: "昨日",
    date: "2026.03.03",
    unread: true,
    avatarColor: "linear-gradient(135deg, #2ecc71, #16a34a)",
    initials: "MK",
  },
  {
    id: "m4",
    from: "木村 誠一郎",
    role: "上長",
    category: "manager",
    subject: "3月度スケジュール確認",
    preview: "3月度のスケジュールを確認しました。進捗管理をしっかり行ってください。",
    body: `お疲れ様です。木村です。

3月度のスケジュールを確認しました。

全体的な進捗は問題なさそうですが、暗号化仕様の策定が遅れ気味です。
優先度を上げて対応してください。

また、月末に進捗報告会を予定しています。
資料の準備をお願いします。

よろしくお願いします。`,
    time: "2日前",
    date: "2026.03.02",
    unread: false,
    avatarColor: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    initials: "KS",
  },
];

export const useMessageStore = create<MessageStore>((set) => ({
  messages: INITIAL_MESSAGES,
  selectedId: null,

  selectMessage: (id) => {
    set({ selectedId: id });
    // 既読にする
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, unread: false } : m
      ),
    }));
  },

  markAsRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, unread: false } : m
      ),
    })),
}));