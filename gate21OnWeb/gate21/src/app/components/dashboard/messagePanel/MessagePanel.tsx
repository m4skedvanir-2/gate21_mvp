// app/components/dashboard/messagePanel/MessagePanel.tsx

import styles from "./MessagePanel.module.css";

interface Message {
  id: string;
  name: string;
  role: string;
  preview: string;
  time: string;
  unread: boolean;
  avatarColor: string;
  initials: string;
}

const MESSAGES: Message[] = [
  {
    id: "1",
    name: "木村 誠一郎",
    role: "上長",
    preview: "暗号化方式の選定について、来週までに方針をまとめておいてください。",
    time: "10:32",
    unread: true,
    avatarColor: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    initials: "KS",
  },
  {
    id: "2",
    name: "田川 健",
    role: "GATE21チーム",
    preview: "UI確認しました。ログインページのモックも共有できますか？",
    time: "09:55",
    unread: true,
    avatarColor: "linear-gradient(135deg, #f59e0b, #d97706)",
    initials: "TK",
  },
  {
    id: "3",
    name: "松田 恵",
    role: "ORUCore",
    preview: "顧客Bの契約更新、今月中に書類を揃えてください。",
    time: "昨日",
    unread: true,
    avatarColor: "linear-gradient(135deg, #2ecc71, #16a34a)",
    initials: "MK",
  },
];

interface Props {
  onGoMessages: () => void;
}

export default function MessagePanel({ onGoMessages }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>メッセージ</span>
        <span className={styles.badge}>未読 {MESSAGES.filter((m) => m.unread).length}</span>
        <button className={styles.action} onClick={onGoMessages}>
          すべて →
        </button>
      </div>
      <div className={styles.list}>
        {MESSAGES.map((msg) => (
          <div key={msg.id} className={styles.item}>
            {msg.unread && <div className={styles.unreadDot} />}
            <div
              className={styles.avatar}
              style={{ background: msg.avatarColor }}
            >
              {msg.initials}
            </div>
            <div className={styles.body}>
              <div className={styles.name}>
                {msg.name}
                <span style={{ color: "var(--text-3)", fontSize: "10px", marginLeft: "6px", fontFamily: "var(--font-mono)" }}>
                  {msg.role}
                </span>
              </div>
              <div className={styles.preview}>{msg.preview}</div>
            </div>
            <div className={styles.time}>{msg.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}