"use client";

import ProjectKanban from "@/app/components/projects/projectsKanban/ProjectsKanban";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "./ProjectsPage.module.css";

interface Props {
  onOpenProject: (id: string) => void;
}

export default function ProjectsPage({ onOpenProject }: Props) {
  const { open } = useModalStore();

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headLeft}>
          <div className={styles.headTitle}>プロジェクト一覧</div>
          <div className={styles.headSub}>ドラッグ＆ドロップでステータスを変更できます</div>
        </div>
        <button className={styles.addBtn} onClick={() => open("project")}>
          ＋ プロジェクト追加
        </button>
      </div>
      <ProjectKanban onOpenProject={onOpenProject} />
    </div>
  );
}