// components/common/modal/Modal.tsx

"use client";

import styles from "./Modal.module.css";

interface Props {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  width?: string;
  children: React.ReactNode;
}

export default function Modal({
  title,
  onClose,
  onSubmit,
  submitLabel = "追加",
  submitDisabled = false,
  width = "480px",
  children,
}: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ ["--modal-width" as string]: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {children}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={onClose}>
            キャンセル
          </button>
          <button
            className={styles.btnAccent}
            onClick={onSubmit}
            disabled={submitDisabled}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}