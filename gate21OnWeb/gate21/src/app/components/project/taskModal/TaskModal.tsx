"use client";

import { useState } from "react";
import Modal from "@/app/components/common/modal/Modal";
import { useModalStore } from "@/app/stores/useModalStore";
import { useTodoStore, type TagType, type LaneId } from "@/app/stores/useTodoStore";
import styles from "./TaskModal.module.css";

const TAGS: { id: TagType; label: string; style: string }[] = [
  { id: "ui",   label: "UI",     style: styles.tagBtnUi },
  { id: "sec",  label: "SEC",    style: styles.tagBtnSec },
  { id: "plan", label: "PLAN",   style: styles.tagBtnPlan },
  { id: "dev",  label: "DEV",    style: styles.tagBtnDev },
  { id: "urg",  label: "URGENT", style: styles.tagBtnUrg },
];

const LANES: { id: LaneId; label: string }[] = [
  { id: "urgent", label: "緊急対応" },
  { id: "todo",   label: "TODO" },
  { id: "wip",    label: "進行中" },
  { id: "done",   label: "完了" },
];

export default function TaskModal() {
  const { openModal, close } = useModalStore();
  const { lanes, } = useTodoStore();

  const [title, setTitle]       = useState("");
  const [spec, setSpec]         = useState("");
  const [tags, setTags]         = useState<TagType[]>([]);
  const [laneId, setLaneId]     = useState<LaneId>("todo");
  const [dueDate, setDueDate]   = useState("");
  const [project, setProject]   = useState("GATE21");

  if (openModal !== "task") return null;

  const isValid = title.trim().length > 0;

  const toggleTag = (tag: TagType) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const newCard = {
      id: `task_${Date.now()}`,
      title,
      spec,
      tags,
      project,
      projectId: "gate21",
      due: dueDate
        ? {
            label: new Date(dueDate).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }),
            type: "ok" as const,
          }
        : undefined,
      avatarColor: "#4a9eff",
      avatarInitials: "OR",
      urgent: laneId === "urgent",
      done: laneId === "done",
    };

    // ストアに直接追加
    useTodoStore.setState((state) => ({
      lanes: state.lanes.map((lane) =>
        lane.id === laneId
          ? { ...lane, cards: [...lane.cards, newCard] }
          : lane
      ),
    }));

    close();
    setTitle(""); setSpec(""); setTags([]);
    setLaneId("todo"); setDueDate(""); setProject("GATE21");
  };

  return (
    <Modal
      title="タスクを追加"
      onClose={close}
      onSubmit={handleSubmit}
      submitLabel="追加する"
      submitDisabled={!isValid}
    >
      <div className={styles.field}>
        <label className={styles.label}>
          タイトル <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="タスクのタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>仕様・詳細</label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          placeholder="タスクの詳細・仕様を入力"
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>タグ</label>
        <div className={styles.tagGrid}>
          {TAGS.map((tag) => (
            <button
              key={tag.id}
              className={`${styles.tagBtn} ${tag.style} ${tags.includes(tag.id) ? "active" : ""}`}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>ステータス</label>
          <select
            className={`${styles.input} ${styles.select}`}
            value={laneId}
            onChange={(e) => setLaneId(e.target.value as LaneId)}
          >
            {LANES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>期日</label>
          <input
            className={styles.input}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}