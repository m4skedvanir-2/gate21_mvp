"use client";

import { useMessageStore } from "@/app/stores/useMessageStore";
import styles from "./MessageDetail.module.css";
import { useModalStore } from "@/app/stores/useModalStore";

export default function MessageDetail() {
  const { messages, selectedId } = useMessageStore();
  const message = messages.find((m) => m.id === selectedId);
  const { open } = useModalStore();

  if (!message) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✉️</div>
          <span>メッセージを選択してください</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.subject}>{message.subject}</div>
        <div className={styles.meta}>
          <div
            className={styles.avatar}
            style={{ background: message.avatarColor }}
          >
            {message.initials}
          </div>
          <div className={styles.metaBody}>
            <span className={styles.from}>{message.from}</span>
            <span className={styles.role}>{message.role}</span>
          </div>
          <div className={styles.date}>{message.date}</div>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.text}>{message.body}</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnGhost} onClick={() => open("forward")}>転送</button>
        <button className={styles.btnAccent} onClick={() => open("reply")}>返信</button>
      </div>
    </div>
  );
}