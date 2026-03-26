// app/components/dashboard/schdulePanel/SchedulePanel.tsx

import styles from "./SchedulePanel.module.css";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  project: string;
  color: string;
}

const SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    time: "10:00",
    title: "UI設計レビュー",
    project: "GATE21",
    color: "#4a9eff",
  },
  {
    id: "2",
    time: "13:00",
    title: "暗号化方式策定MTG",
    project: "GATE21 — SECチーム",
    color: "#00d4aa",
  },
  {
    id: "3",
    time: "15:30",
    title: "顧客A 定例",
    project: "ORUCore",
    color: "#f59e0b",
  },
  {
    id: "4",
    time: "17:00",
    title: "進捗まとめ",
    project: "個人",
    color: "var(--border-hi)",
  },
];

const today = new Date().toLocaleDateString("ja-JP", {
  month: "numeric",
  day: "numeric",
});

export default function SchedulePanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>TODAY</span>
        <span className={styles.badge}>{today}</span>
      </div>
      <div className={styles.list}>
        {SCHEDULE.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.time}>{item.time}</span>
            <div className={styles.bar} style={{ background: item.color }} />
            <div className={styles.body}>
              <div className={styles.schedTitle}>{item.title}</div>
              <div className={styles.proj}>{item.project}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}