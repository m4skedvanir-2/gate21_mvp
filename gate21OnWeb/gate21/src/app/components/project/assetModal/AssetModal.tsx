"use client";

import { useState } from "react";
import Modal from "@/app/components/common/modal/Modal";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "./AssetModal.module.css";

const ASSET_TYPES = ["APIキー", "認証情報", "シークレットキー", "トークン", "証明書", "その他"];

export default function AssetModal() {
  const { openModal, close, currentProjectId } = useModalStore();

  const [name, setName]     = useState("");
  const [type, setType]     = useState("");
  const [value, setValue]   = useState("");
  const [note, setNote]     = useState("");
  const [vaultPassword, setVaultPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (openModal !== "asset") return null;

  const isValid = name.trim().length > 0 && type.length > 0 && value.trim().length > 0 && vaultPassword.length > 0;

 const handleSubmit = async () => {
  if (!isValid) return;
  setIsLoading(true);
  setError("");
  try {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("gate21_token="))
      ?.split("=")[1] ?? "";

    const res = await fetch("http://localhost:8080/api/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: currentProjectId,
        name,
        asset_type: type,
        value,
        note: note || null,
      }),
    });

    if (!res.ok) {
      setError("追加に失敗しました");
      return;
    }

    close();
    setName(""); setType(""); setValue(""); setNote(""); setVaultPassword("");
  } catch {
    setError("サーバーに接続できません");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Modal
      title="秘密資産を追加"
      onClose={close}
      onSubmit={handleSubmit}
      submitLabel={isLoading ? "保存中…" : "追加する"}
      submitDisabled={!isValid || isLoading}
    >
      <div className={styles.secureNote}>
        🔒 入力値はRustレイヤーで暗号化されて保存されます
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          資産名 <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="例：本番環境 APIキー"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          種別 <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.input} ${styles.select}`}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">選択してください</option>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          値 <span className={styles.required}>*</span>
        </label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          placeholder="APIキーやトークンの値を入力"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>備考</label>
        <input
          className={styles.input}
          type="text"
          placeholder="用途・注意事項など"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          Vault Password <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          type="password"
          placeholder="••••••••••••"
          value={vaultPassword}
          onChange={(e) => setVaultPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{error}</div>}
    </Modal>
  );
}