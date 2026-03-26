// app/components/project/statCards/StatCards.tsx

import styles from "./StatCards.module.css";

type ColorType = "green" | "blue" | "amber" | "red";

interface StatCard {
  label: string;
  value: number;
  desc: string;
  color: ColorType;
}

const COLOR_STYLES: Record<ColorType, string> = {
  green: styles.green,
  blue:  styles.blue,
  amber: styles.amber,
  red:   styles.red,
};

const STATS: StatCard[] = [
  { label: "Secret Assets", value: 12, desc: "APIキー・認証情報", color: "green" },
  { label: "Customers",     value: 4,  desc: "アクティブ顧客",   color: "blue" },
  { label: "Project TODO",  value: 3,  desc: "本日期限 1件",     color: "amber" },
  { label: "Due Soon",      value: 1,  desc: "契約更新 3/15",    color: "red" },
];

export default function StatCards() {
  return (
    <div className={styles.grid}>
      {STATS.map((stat) => (
        <div key={stat.label} className={`${styles.card} ${COLOR_STYLES[stat.color]}`}>
          <div className={styles.label}>{stat.label}</div>
          <div className={styles.value}>{stat.value}</div>
          <div className={styles.desc}>{stat.desc}</div>
        </div>
      ))}
    </div>
  );
}