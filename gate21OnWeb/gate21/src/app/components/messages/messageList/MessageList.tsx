"use client";

import { useMessageStore } from "@/app/stores/useMessageStore";
import styles from "./MessageList.module.css";

export default function MessageList() {
  const { messages, selectedId, selectMessage } = useMessageStore();
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>受信トレイ</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>未読 {unreadCount}</span>
        )}
      </div>
      <div className={styles.list}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.item} ${selectedId === msg.id ? styles.itemActive : ""}`}
            onClick={() => selectMessage(msg.id)}
          >
            {msg.unread && <div className={styles.unreadDot} />}
            <div
              className={styles.avatar}
              style={{ background: msg.avatarColor }}
            >
              {msg.initials}
            </div>
            <div className={styles.body}>
              <div className={styles.top}>
                <span className={styles.from}>{msg.from}</span>
                <span className={styles.role}>{msg.role}</span>
              </div>
              <div className={`${styles.subject} ${msg.unread ? styles.unreadSubject : ""}`}>
                {msg.subject}
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