// app/components/dashboard/progressbar/ProgressBar.tsx

interface ProgressItem {
  label: string;
  pct: number;
  color: string;
  glow?: string;
}

const ITEMS: ProgressItem[] = [
  {
    label: "フロントエンド作成",
    pct: 20,
    color: "var(--accent)",
    glow: "0 0 6px var(--accent)",
  },
  {
    label: "ログイン認証の実装",
    pct: 0,
    color: "var(--accent)",
  },
  {
    label: "暗号化仕様の策定",
    pct: 10,
    color: "var(--amber)",
    glow: "0 0 5px var(--amber)",
  },
];

import styles from "./ProgressBar.module.css";

export default function ProgressBar() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>3月度 進捗</span>
        <span className={styles.badge}>進行中</span>
      </div>
      <div className={styles.body}>
        {ITEMS.map((item) => (
          <div key={item.label} className={styles.row}>
            <div className={styles.rowHead}>
              <span className={styles.label}>{item.label}</span>
              <span
                className={styles.pct}
                style={{ color: item.pct === 0 ? "var(--text-3)" : item.color }}
              >
                {item.pct}%
              </span>
            </div>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{
                  width: `${item.pct}%`,
                  background: item.color,
                  boxShadow: item.glow,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}