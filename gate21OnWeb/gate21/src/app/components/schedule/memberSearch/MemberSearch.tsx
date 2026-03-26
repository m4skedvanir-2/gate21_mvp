"use client";

import { useState, useRef, useEffect } from "react";
import { useScheduleStore } from "@/app/stores/useScheduleStore";
import styles from "./MemberSearch.module.css";

export default function MemberSearch() {
  const { members, searchQuery, setSearchQuery, togglePin } = useScheduleStore();
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = searchQuery.trim()
    ? members.filter(
        (m) =>
          m.id !== "or" &&
          (m.name.includes(searchQuery) || m.role.includes(searchQuery))
      )
    : [];

  const pinnedMembers = members.filter((m) => m.pinned);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.wrap}>
      {/* ピン止め済みメンバー */}
      <div className={styles.pins}>
        {pinnedMembers.map((m) => (
          <div
            key={m.id}
            className={`${styles.pin} ${m.id === "or" ? styles.pinSelf : styles.pinActive}`}
            onClick={() => m.id !== "or" && togglePin(m.id)}
          >
            <div
              className={styles.pinAvatar}
              style={{ background: m.avatarColor }}
            >
              {m.initials}
            </div>
            {m.name}
            {m.id !== "or" && " ✕"}
          </div>
        ))}
      </div>

      {/* 検索 */}
      <div className={styles.searchBox} ref={wrapRef}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.input}
          type="text"
          placeholder="メンバーを検索してピン止め..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
        />

        {focused && filtered.length > 0 && (
          <div className={styles.dropdown}>
            {filtered.map((m) => (
              <div
                key={m.id}
                className={styles.dropItem}
                onClick={() => {
                  togglePin(m.id);
                  setSearchQuery("");
                  setFocused(false);
                }}
              >
                <div
                  className={styles.dropAvatar}
                  style={{ background: m.avatarColor }}
                >
                  {m.initials}
                </div>
                <div>
                  <div className={styles.dropName}>{m.name}</div>
                  <div className={styles.dropRole}>{m.role}</div>
                </div>
                {m.pinned && (
                  <span className={styles.dropPin}>ピン済み</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}