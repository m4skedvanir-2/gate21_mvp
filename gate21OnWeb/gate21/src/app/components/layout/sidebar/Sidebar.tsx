// app/components/layout/sidebar/Sidebar.tsx

"use client";

import { useState } from "react";
import type { PageId, Project, Theme } from "@/app/types";
import styles from "./Sidebar.module.css";

const PROJECTS: Project[] = [
  { id: "gate21",  label: "GATE21",  color: "#4a9eff" },
  { id: "orucore", label: "ORUCore", color: "#f59e0b" },
];

const GLOBAL_NAV: { id: PageId; label: string; badge?: { text: string; style: "green" | "purple" } }[] = [
  { id: "dashboard", label: "ダッシュボード" },
  { id: "projects",  label: "プロジェクト" },
  { id: "messages",  label: "メッセージ", badge: { text: "3", style: "purple" } },
  { id: "documents", label: "書類提出" },
];

const PROJECT_NAV: { id: PageId; label: string; badge?: { text: string; style: "green" | "purple" } }[] = [
  { id: "projDash", label: "ダッシュボード" },
  { id: "projDash", label: "顧客管理" },
  { id: "projDash", label: "秘密資産" },
  { id: "projDash", label: "TODO", badge: { text: "3", style: "green" } },
  { id: "projDash", label: "スケジュール" },
];

interface Props {
  pageId: PageId;
  currentProject: Project | null;
  theme: Theme;
  onToggleTheme: () => void;
  onGoPage: (id: PageId) => void;
  onOpenProject: (project: Project) => void;
  onGoHome: () => void;
}

export default function Sidebar({
  pageId,
  currentProject,
  theme,
  onToggleTheme,
  onGoPage,
  onOpenProject,
  onGoHome,
}: Props) {
  const [ddOpen, setDdOpen] = useState(false);

  const isProjectMode = currentProject !== null;

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div>
          <div className={styles.logoMark}>
            GATE<em>21</em>
          </div>
          <div className={styles.logoSub}>Secure Asset Mgmt</div>
        </div>
        <button className={styles.themeBtn} onClick={onToggleTheme} title="テーマ切替">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Project dropdown */}
      <div className={styles.projects}>
        <div className={styles.projHeader} onClick={() => setDdOpen((v) => !v)}>
          <div
            className={styles.projDot}
            style={{ background: currentProject?.color ?? "var(--accent)" }}
          />
          <span>{currentProject?.label ?? "ホーム"}</span>
          <svg
            className={`${styles.chevron} ${ddOpen ? styles.chevronOpen : ""}`}
            viewBox="0 0 12 12" width="12" height="12"
            fill="none" stroke="currentColor" strokeWidth="1.8"
          >
            <polyline points="2,4 6,8 10,4" />
          </svg>
        </div>

        <div className={`${styles.projList} ${ddOpen ? styles.projListOpen : ""}`}>
          {/* Home */}
          <div
            className={`${styles.projItem} ${!currentProject ? styles.projItemActive : ""}`}
            onClick={() => { onGoHome(); setDdOpen(false); }}
          >
            <div className={styles.dot} style={{ background: "var(--accent)" }} />
            ホーム（全体）
          </div>
          {/* Projects */}
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              className={`${styles.projItem} ${currentProject?.id === p.id ? styles.projItemActive : ""}`}
              onClick={() => { onOpenProject(p); setDdOpen(false); }}
            >
              <div className={styles.dot} style={{ background: p.color }} />
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {!isProjectMode ? (
          <>
            <span className={styles.sectionLabel}>メイン</span>
            {GLOBAL_NAV.map((item) => (
              <div
                key={item.label}
                className={`${styles.navItem} ${pageId === item.id && !isProjectMode ? styles.navItemActive : ""}`}
                onClick={() => onGoPage(item.id)}
              >
                {item.label}
                {item.badge && (
                  <span className={`${styles.navBadge} ${item.badge.style === "purple" ? styles.badgePurple : styles.badgeGreen}`}>
                    {item.badge.text}
                  </span>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <span className={styles.sectionLabel}>{currentProject.label}</span>
            {PROJECT_NAV.map((item) => (
              <div
                key={item.label}
                className={`${styles.navItem} ${pageId === item.id ? styles.navItemActive : ""}`}
                onClick={() => onGoPage(item.id)}
              >
                {item.label}
                {item.badge && (
                  <span className={`${styles.navBadge} ${item.badge.style === "purple" ? styles.badgePurple : styles.badgeGreen}`}>
                    {item.badge.text}
                  </span>
                )}
              </div>
            ))}
            <div className={styles.navItem} onClick={onGoHome}>
              ← 全体に戻る
            </div>
          </>
        )}
      </nav>
      {/* Settings */}
      <div className={styles.settingsSection}>
        <a href="/settings/members" className={styles.settingsLink}>
          メンバー管理
        </a>
        <a href="/settings/requests" className={styles.settingsLink}>
          申請管理
        </a>
      </div>
      {/* User */}
      <div className={styles.userSection}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>OR</div>
          <div>
            <div className={styles.userName}>ORU Admin</div>
            <div className={styles.userRole}>super-admin</div>
          </div>
          <div className={styles.onlineDot} />
        </div>
      </div>
    </aside>
  );
}