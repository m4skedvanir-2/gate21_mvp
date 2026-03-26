// app/components/documents/documentForm/.tsx

"use client";

import {
  useDocumentStore,
  DOC_TYPE_LABELS,
  DOC_FIELDS,
  type DocType,
} from "@/app/stores/useDocumentStore";
import styles from "./DocumentForm.module.css";

const DOC_TYPES: DocType[] = [
  "expense", "report", "contract", "approval", "leave", "other",
];

export default function DocumentForm() {
  const {
    selectedType,
    formData,
    selectType,
    updateField,
    setPreviewMode,
    reset,
  } = useDocumentStore();

  const fields = selectedType ? DOC_FIELDS[selectedType] : [];

  const isValid = selectedType
    ? fields.filter((f) => f.required).every((f) => !!formData[f.id]?.trim())
    : false;

  return (
    <div className={styles.wrap}>
      {/* ── 種別選択 ── */}
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>書類種別</span>
          <span className={styles.badge}>SELECT TYPE</span>
        </div>
        <div style={{ padding: "14px" }}>
          <div className={styles.typeGrid}>
            {DOC_TYPES.map((type) => (
              <button
                key={type}
                className={`${styles.typeBtn} ${selectedType === type ? styles.typeBtnActive : ""}`}
                onClick={() => selectType(type)}
              >
                {DOC_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 動的フォーム ── */}
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>入力フォーム</span>
          {selectedType && (
            <span className={styles.badge}>{DOC_TYPE_LABELS[selectedType]}</span>
          )}
        </div>

        {!selectedType ? (
          <div className={styles.empty}>書類種別を選択してください</div>
        ) : (
          <>
            <div className={styles.form}>
              {fields.map((field) => (
                <div key={field.id} className={styles.field}>
                  <label className={styles.label}>
                    {field.label}
                    {field.required && <span className={styles.required}>*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      placeholder={field.placeholder}
                      value={formData[field.id] ?? ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className={`${styles.input} ${styles.select}`}
                      value={formData[field.id] ?? ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                    >
                      <option value="">選択してください</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={styles.input}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id] ?? ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button className={styles.btnGhost} onClick={reset}>
                リセット
              </button>
              <button
                className={styles.btnAccent}
                disabled={!isValid}
                onClick={() => setPreviewMode(true)}
              >
                プレビュー確認 →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}