// app/components/topbar/Topbar.tsx

"use client";

import type { PageId, Project } from "@/app/types";
import styles from "./Topbar.module.css";

interface Props {
  pageId: PageId;
  currentProject: Project | null;
  onOpenModal: () => void;
}

const today = new Date().toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
}).replace(/\//g, ".");

export default function Topbar({ pageId, currentProject, onOpenModal }: Props) {
  const crumb = (() => {
    if (currentProject) return { main: currentProject.label, sub: "ダッシュボード" };
    switch (pageId) {
      case "dashboard": return { main: "ダッシュボード", sub: null };
      case "projects":  return { main: "プロジェクト",   sub: null };
      case "messages":  return { main: "メッセージ",     sub: null };
      case "documents": return { main: "書類提出",       sub: null };
      default:          return { main: "GATE21",         sub: null };
    }
  })();

  return (
    <div className={styles.topbar}>
      <div className={styles.crumb}>
        <span>{crumb.main}</span>
        {crumb.sub && (
          <>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbSub}>{crumb.sub}</span>
          </>
        )}
      </div>
      <div className={styles.date}>{today}</div>

      <div className={styles.actions}>
        {pageId === "projDash" && (
          <button className={styles.btnGhost}>同期</button>
        )}
        {pageId === "dashboard" && (
          <button className={styles.btnGhost}>同期</button>
        )}
        {(pageId === "dashboard" || pageId === "projects") && (
          <button className={styles.btnAccent} onClick={onOpenModal}>
            ＋ プロジェクト追加
          </button>
        )}
        {currentProject && (
          <button className={styles.btnAccent} onClick={onOpenModal}>
            ＋ 資産追加
          </button>
        )}
      </div>
    </div>
  );
}