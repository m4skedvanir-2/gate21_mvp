"use client";

import { useState } from "react";
import { decryptFromVault, encryptForVault } from "@/app/lib/vault";
import Modal from "@/app/components/common/modal/Modal";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "../assetModal/AssetModal.module.css";

type Mode = "unlock" | "view" | "update" | "delete";

const getToken = () =>
  document.cookie.split("; ").find((r) => r.startsWith("gate21_token="))?.split("=")[1] ?? "";

export default function AssetViewModal() {
  const { openModal, selectedAssetId, close } = useModalStore();
  const [mode, setMode] = useState<Mode>("unlock");
  const [vaultPassword, setVaultPassword] = useState("");
  const [decryptedValue, setDecryptedValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (openModal !== "assetView" || !selectedAssetId) return null;

  const handleClose = () => {
    close();
    setMode("unlock");
    setVaultPassword(""); setDecryptedValue(""); setNewValue("");
    setNewName(""); setDeleteReason(""); setError(""); setMessage("");
  };

  const handleDecrypt = async () => {
    if (!vaultPassword) return;
    setIsLoading(true); setError("");
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:8080/api/assets/decrypt/${selectedAssetId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const plaintext = await decryptFromVault(data.value, vaultPassword);
      setDecryptedValue(plaintext);
      setMode("view");
    } catch {
      setError("Vault Passwordが違うか、データが破損しています");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!newValue || !vaultPassword) return;
    setIsLoading(true); setError("");
    try {
      const token = getToken();
      const encryptedNewValue = await encryptForVault(newValue, vaultPassword);
      const res = await fetch(`http://localhost:8080/api/assets/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          asset_id: selectedAssetId,
          request_type: "update",
          new_name: newName || null,
          new_value: encryptedNewValue,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage("更新申請を送信しました。管理者の承認をお待ちください。");
      setMode("view");
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteReason) return;
    setIsLoading(true); setError("");
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:8080/api/assets/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          asset_id: selectedAssetId,
          request_type: "delete",
          new_name: deleteReason,
          new_value: null,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage("削除申請を送信しました。管理者の承認をお待ちください。");
      setMode("view");
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };
  const submitAction = mode === "unlock" ? handleDecrypt
    : mode === "update" ? handleUpdateRequest
    : mode === "delete" ? handleDeleteRequest
    : handleClose;

  const submitLabel = mode === "unlock" ? (isLoading ? "復号中..." : "復号する")
    : mode === "update" ? (isLoading ? "申請中..." : "更新を申請")
    : mode === "delete" ? (isLoading ? "申請中..." : "削除を申請")
    : "閉じる";

  const submitDisabled = isLoading
    || (mode === "unlock" && !vaultPassword)
    || (mode === "update" && !newValue)
    || (mode === "delete" && !deleteReason);

  return (
    <Modal
      title={mode === "delete" ? "削除申請" : mode === "update" ? "更新申請" : "秘密資産を表示"}
      onClose={handleClose}
      onSubmit={submitAction}
      submitLabel={submitLabel}
      submitDisabled={submitDisabled}
    >
      {/* unlock */}
      {mode === "unlock" && (
        <>
          <div className={styles.secureNote}>🔒 Vault Passwordで復号します。</div>
          <div className={styles.field}>
            <label className={styles.label}>Vault Password</label>
            <input className={styles.input} type="password" placeholder="••••••••••••"
              value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDecrypt()}
              autoFocus autoComplete="current-password" />
          </div>
        </>
      )}

      {/* view */}
      {mode === "view" && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>復号された値</label>
            <textarea className={`${styles.input} ${styles.textarea}`}
              value={decryptedValue} readOnly
              onClick={(e) => (e.target as HTMLTextAreaElement).select()} />
            <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
              クリックで全選択
            </div>
          </div>
          {message && <div style={{ color: "var(--accent)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{message}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className={styles.input} onClick={() => setMode("update")}
              style={{ cursor: "pointer", background: "var(--bg-panel)", fontSize: 11 }}>
              更新申請
            </button>
            <button className={styles.input} onClick={() => setMode("delete")}
              style={{ cursor: "pointer", background: "var(--bg-panel)", fontSize: 11, color: "var(--red)" }}>
              削除申請
            </button>
          </div>
        </>
      )}

      {/* update */}
      {mode === "update" && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>新しい資産名（任意）</label>
            <input className={styles.input} placeholder="変更しない場合は空欄"
              value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>新しい値 *</label>
            <textarea className={`${styles.input} ${styles.textarea}`}
              placeholder="新しいAPIキーやトークンの値"
              value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          </div>
          <button onClick={() => setMode("view")}
            style={{ fontSize: 11, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}>
            ← 戻る
          </button>
        </>
      )}

      {/* delete */}
      {mode === "delete" && (
        <>
          <div className={styles.secureNote} style={{ borderColor: "var(--red)", color: "var(--red)" }}>
            ⚠️ 削除申請は管理者の承認が必要です。
          </div>
          <div className={styles.field}>
            <label className={styles.label}>削除理由 *</label>
            <textarea className={`${styles.input} ${styles.textarea}`}
              placeholder="削除が必要な理由を記入してください"
              value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
          </div>
          <button onClick={() => setMode("view")}
            style={{ fontSize: 11, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}>
            ← 戻る
          </button>
        </>
      )}

      {error && <div style={{ color: "var(--red)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{error}</div>}
    </Modal>
  );
}