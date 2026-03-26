// app/components/dashboard/attentionPanel/AttentionPanel.tsx

import styles from "./AttentionPanel.module.css";

interface AttentionItem {
  id: string;
  icon: string;
  iconStyle: "amber" | "blue";
  title: string;
  sub: string;
  time: string;
}

const ITEMS: AttentionItem[] = [
  {
    id: "1",
    icon: "⚠️",
    iconStyle: "amber",
    title: "同期サーバー未応答",
    sub: "オフラインモード継続中。オンライン時に自動同期します",
    time: "09:20",
  },
  {
    id: "2",
    icon: "🔑",
    iconStyle: "blue",
    title: "APIキー 更新推奨",
    sub: "本番環境キー — 最終更新から60日経過",
    time: "昨日",
  },
];

const ICON_STYLES = {
  amber: styles.iconAmber,
  blue:  styles.iconBlue,
};

export default function AttentionPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>ATTENTION</span>
        <span className={styles.badge}>{ITEMS.length}件</span>
      </div>
      <div className={styles.list}>
        {ITEMS.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={`${styles.icon} ${ICON_STYLES[item.iconStyle]}`}>
              {item.icon}
            </div>
            <div className={styles.body}>
              <div className={styles.attnTitle}>{item.title}</div>
              <div className={styles.sub}>{item.sub}</div>
            </div>
            <div className={styles.time}>{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}