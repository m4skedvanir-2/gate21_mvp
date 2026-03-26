"use client";

import { useState } from "react";
import Modal from "@/app/components/common/modal/Modal";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "./ProjectModal.module.css";

const COLORS = [
  "#4a9eff", "#00d4aa", "#f59e0b",
  "#e05252", "#9b59b6", "#2ecc71",
];

export default function ProjectModal() {
  const { openModal, close } = useModalStore();

  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [color, setColor]         = useState(COLORS[0]);
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers]     = useState<string[]>([]);

  if (openModal !== "project") return null;

  const isValid = name.trim().length > 0;

  const addMember = () => {
    const v = memberInput.trim();
    if (v && !members.includes(v)) {
      setMembers((prev) => [...prev, v]);
      setMemberInput("");
    }
  };

  const removeMember = (m: string) => {
    setMembers((prev) => prev.filter((x) => x !== m));
  };

  const handleSubmit = async () => {
  if (!isValid) return;
  try {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("gate21_token="))
      ?.split("=")[1] ?? "";

    const res = await fetch("http://localhost:8080/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description: desc || null,
        color,
      }),
    });

    if (!res.ok) {
      console.error("プロジェクト作成失敗");
      return;
    }

    close();
    setName(""); setDesc(""); setColor(COLORS[0]); setMembers([]);
  } catch {
    console.error("サーバーに接続できません");
  }
};

  return (
    <Modal
      title="新規プロジェクト作成"
      onClose={close}
      onSubmit={handleSubmit}
      submitLabel="作成する"
      submitDisabled={!isValid}
    >
      {/* プロジェクト名 */}
      <div className={styles.field}>
        <label className={styles.label}>
          プロジェクト名 <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="例：Project Alpha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      {/* 説明 */}
      <div className={styles.field}>
        <label className={styles.label}>説明</label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          placeholder="プロジェクトの概要を入力"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* カラー */}
      <div className={styles.field}>
        <label className={styles.label}>カラー</label>
        <div className={styles.colorGrid}>
          {COLORS.map((c) => (
            <div
              key={c}
              className={`${styles.colorSwatch} ${color === c ? styles.colorSwatchActive : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      {/* メンバー */}
      <div className={styles.field}>
        <label className={styles.label}>メンバー追加</label>
        <div className={styles.memberRow}>
          <input
            className={`${styles.input} ${styles.memberInput}`}
            type="text"
            placeholder="名前を入力"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
          />
          <button className={styles.addMemberBtn} onClick={addMember}>
            追加
          </button>
        </div>
        {members.length > 0 && (
          <div className={styles.memberList}>
            {members.map((m) => (
              <div key={m} className={styles.memberTag}>
                {m}
                <button
                  className={styles.memberRemove}
                  onClick={() => removeMember(m)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}