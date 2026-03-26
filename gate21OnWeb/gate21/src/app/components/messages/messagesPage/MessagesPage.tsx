"use client";

import MessageList from "@/app/components/messages/messageList/MessageList";
import MessageDetail from "@/app/components/messages/messageDetail/MessageDetail";
import styles from "./MessagesPage.module.css";

export default function MessagesPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <div className={styles.headTitle}>メッセージ</div>
          <div className={styles.headSub}>受信トレイ</div>
        </div>
      </div>
      <div className={styles.grid}>
        <MessageList />
        <MessageDetail />
      </div>
    </div>
  );
}