"use client";

import { useState } from "react";
import Modal from "@/app/components/common/Modal/Modal";
import { useModalStore } from "@/app/stores/useModalStore";
import { useMessageStore } from "@/app/stores/useMessageStore";
import styles from "./ReplyModal.module.css";

export default function ReplyModal() {
  const { openModal, close } = useModalStore();
  const { messages, selectedId } = useMessageStore();
  const message = messages.find((m) => m.id === selectedId);

  const isReply   = openModal === "reply";
  const isForward = openModal === "forward";

  const [to, setTo]       = useState("");
  const [body, setBody]   = useState("");

  if ((!isReply && !isForward) || !message) return null;

  const subject = isReply
    ? `Re: ${message.subject}`
    : `Fw: ${message.subject}`;

  const isValid = isReply
    ? body.trim().length > 0
    : to.trim().length > 0 && body.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    // TODO: 送信API連携（バックエンド実装時）
    console.log({ to: isReply ? message.from : to, subject, body });
    close();
    setTo(""); setBody("");
  };

  return (
    <Modal
      title={isReply ? `返信：${message.from}` : "転送"}
      onClose={() => { close(); setTo(""); setBody(""); }}
      onSubmit={handleSubmit}
      submitLabel="送信"
      submitDisabled={!isValid}
      width="520px"
    >
      {/* 転送のみ宛先入力 */}
      {isForward && (
        <div className={styles.field}>
          <label className={styles.label}>宛先</label>
          <input
            className={styles.input}
            type="text"
            placeholder="名前またはメールアドレス"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* 件名（読み取り専用） */}
      <div className={styles.field}>
        <label className={styles.label}>件名</label>
        <input
          className={styles.input}
          type="text"
          value={subject}
          readOnly
          style={{ color: "var(--text-3)", cursor: "default" }}
        />
      </div>

      {/* 本文 */}
      <div className={styles.field}>
        <label className={styles.label}>本文</label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          placeholder="メッセージを入力"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          autoFocus={isReply}
        />
      </div>

      {/* 引用 */}
      <div className={styles.field}>
        <div className={styles.quoteLabel}>引用元</div>
        <div className={styles.quote}>{message.body}</div>
      </div>
    </Modal>
  );
}