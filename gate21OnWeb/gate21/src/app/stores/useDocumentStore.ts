// app/stores/useDocumentStore.ts

import { create } from "zustand";

// ── 書類種別 ──
export type DocType =
  | "expense"      // 経費精算
  | "report"       // 報告書
  | "contract"     // 契約更新書類
  | "approval"     // 稟議書
  | "leave"        // 休暇申請
  | "other";       // その他

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  expense:  "経費精算",
  report:   "報告書",
  contract: "契約更新書類",
  approval: "稟議書",
  leave:    "休暇申請",
  other:    "その他",
};

// ── 書類ステータス ──
export type DocStatus = "pending" | "approved" | "rejected";

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  pending:  "確認中",
  approved: "承認済",
  rejected: "却下",
};

// ── フォームフィールド定義 ──
export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[]; // selectのみ
}

// ── 種別ごとのフィールド定義 ──
export const DOC_FIELDS: Record<DocType, FormField[]> = {
  expense: [
    { id: "date",     label: "発生日",   type: "date",   required: true },
    { id: "amount",   label: "金額（円）", type: "number", placeholder: "10000", required: true },
    { id: "purpose",  label: "用途",     type: "text",   placeholder: "例：クライアント訪問交通費", required: true },
    { id: "category", label: "カテゴリ", type: "select", required: true, options: ["交通費", "宿泊費", "接待費", "消耗品", "その他"] },
    { id: "note",     label: "備考",     type: "textarea", placeholder: "領収書番号など", required: false },
  ],
  report: [
    { id: "period",   label: "対象期間",       type: "text",     placeholder: "例：2026年3月第1週", required: true },
    { id: "content",  label: "業務内容",       type: "textarea", placeholder: "今週の主な業務内容", required: true },
    { id: "issue",    label: "課題・懸念事項", type: "textarea", placeholder: "発生した課題や懸念点", required: false },
    { id: "next",     label: "次回アクション", type: "textarea", placeholder: "来週の予定・対応事項", required: true },
  ],
  contract: [
    { id: "customer",     label: "顧客名",   type: "text",   placeholder: "株式会社〇〇", required: true },
    { id: "contractType", label: "契約種別", type: "select", required: true, options: ["月次保守", "開発委託", "SaaS利用", "スポット"] },
    { id: "renewalDate",  label: "更新日",   type: "date",   required: true },
    { id: "amount",       label: "契約金額（円）", type: "number", placeholder: "500000", required: true },
    { id: "note",         label: "備考",     type: "textarea", placeholder: "特記事項があれば", required: false },
  ],
  approval: [
    { id: "title",    label: "件名",       type: "text",     placeholder: "例：開発ツール購入申請", required: true },
    { id: "amount",   label: "金額（円）", type: "number",   placeholder: "50000", required: true },
    { id: "purpose",  label: "目的・理由", type: "textarea", placeholder: "申請の目的と必要性", required: true },
    { id: "approver", label: "承認者",     type: "select",   required: true, options: ["木村 誠一郎", "田川 健", "松田 恵"] },
    { id: "deadline", label: "承認期限",   type: "date",     required: true },
  ],
  leave: [
    { id: "leaveType",  label: "休暇種別", type: "select", required: true, options: ["有給休暇", "半休（午前）", "半休（午後）", "慶弔休暇", "特別休暇"] },
    { id: "startDate",  label: "開始日",   type: "date",   required: true },
    { id: "endDate",    label: "終了日",   type: "date",   required: true },
    { id: "reason",     label: "理由",     type: "textarea", placeholder: "取得理由（任意）", required: false },
    { id: "substitute", label: "代理対応者", type: "text", placeholder: "不在時の対応者名", required: false },
  ],
  other: [
    { id: "title",   label: "件名",   type: "text",     placeholder: "書類のタイトル", required: true },
    { id: "content", label: "内容",   type: "textarea", placeholder: "詳細内容", required: true },
    { id: "note",    label: "備考",   type: "textarea", placeholder: "補足事項", required: false },
  ],
};

// ── 提出済み書類 ──
export interface SubmittedDoc {
  id: string;
  type: DocType;
  title: string;
  submittedAt: string;
  status: DocStatus;
  data: Record<string, string>;
}

interface DocumentStore {
  // フォーム状態
  selectedType: DocType | null;
  formData: Record<string, string>;
  previewMode: boolean;

  // 提出履歴
  history: SubmittedDoc[];

  // アクション
  selectType: (type: DocType) => void;
  updateField: (fieldId: string, value: string) => void;
  setPreviewMode: (val: boolean) => void;
  submitDocument: () => void;
  reset: () => void;
}

const INITIAL_HISTORY: SubmittedDoc[] = [
  {
    id: "h1",
    type: "expense",
    title: "経費精算 — クライアント訪問交通費",
    submittedAt: "2026.03.01",
    status: "approved",
    data: { date: "2026-03-01", amount: "2400", purpose: "クライアント訪問交通費", category: "交通費" },
  },
  {
    id: "h2",
    type: "report",
    title: "週次報告書 — 2026年2月第4週",
    submittedAt: "2026.02.28",
    status: "approved",
    data: { period: "2026年2月第4週", content: "UI設計・プロトタイプ作成", next: "認証フロー設計" },
  },
  {
    id: "h3",
    type: "contract",
    title: "契約更新書類 — Beta Labs Inc.",
    submittedAt: "2026.02.20",
    status: "pending",
    data: { customer: "Beta Labs Inc.", contractType: "開発委託", renewalDate: "2026-03-15" },
  },
];

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  selectedType: null,
  formData: {},
  previewMode: false,
  history: INITIAL_HISTORY,

  selectType: (type) =>
    set({ selectedType: type, formData: {}, previewMode: false }),

  updateField: (fieldId, value) =>
    set((state) => ({
      formData: { ...state.formData, [fieldId]: value },
    })),

  setPreviewMode: (val) => set({ previewMode: val }),

  submitDocument: () => {
    const { selectedType, formData, history } = get();
    if (!selectedType) return;

    const fields = DOC_FIELDS[selectedType];
    const titleField = formData[fields[0].id] ?? DOC_TYPE_LABELS[selectedType];

    const newDoc: SubmittedDoc = {
      id: `h${Date.now()}`,
      type: selectedType,
      title: `${DOC_TYPE_LABELS[selectedType]} — ${titleField}`,
      submittedAt: new Date().toLocaleDateString("ja-JP", {
        year: "numeric", month: "2-digit", day: "2-digit"
      }).replace(/\//g, "."),
      status: "pending",
      data: formData,
    };

    set({
      history: [newDoc, ...history],
      selectedType: null,
      formData: {},
      previewMode: false,
    });
  },

  reset: () => set({ selectedType: null, formData: {}, previewMode: false }),
}));