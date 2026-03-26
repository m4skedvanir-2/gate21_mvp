// app/components/documents/documentPreview/.tsx

"use client";

import {
  useDocumentStore,
  DOC_TYPE_LABELS,
  DOC_FIELDS,
} from "@/app/stores/useDocumentStore";
import styles from "./DocumentPreview.module.css";

export default function DocumentPreview() {
  const {
    selectedType,
    formData,
    previewMode,
    setPreviewMode,
    submitDocument,
  } = useDocumentStore();

  if (!previewMode || !selectedType) return null;

  const fields = DOC_FIELDS[selectedType];
  const now = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={styles.overlay} onClick={() => setPreviewMode(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <span className={styles.title}>提出内容の確認</span>
          <button className={styles.closeBtn} onClick={() => setPreviewMode(false)}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.docWrap}>
            {/* 書類ヘッダー */}
            <div className={styles.docHeader}>
              <div className={styles.docType}>
                {DOC_TYPE_LABELS[selectedType]}
              </div>
              <div className={styles.docTitle}>
                {formData[fields[0].id] ?? DOC_TYPE_LABELS[selectedType]}
              </div>
              <div className={styles.docMeta}>
                提出者: ORU Admin　／　作成日時: {now}
              </div>
            </div>

            {/* 書類本文 */}
            <div className={styles.docBody}>
              {fields.map((field) => {
                const value = formData[field.id];
                if (!value) return null;
                return (
                  <div key={field.id} className={styles.docRow}>
                    <span className={styles.docLabel}>{field.label}</span>
                    <span className={styles.docValue}>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnGhost}
            onClick={() => setPreviewMode(false)}
          >
            ← 修正する
          </button>
          <button
            className={styles.btnAccent}
            onClick={submitDocument}
          >
            提出する ✓
          </button>
        </div>

      </div>
    </div>
  );
}