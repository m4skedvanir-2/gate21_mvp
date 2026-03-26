"use client";

import { useScheduleStore } from "@/app/stores/useScheduleStore";
import ScheduleRow from "@/app/components/schedule/scheduleRow/ScheduleRow";
import MemberSearch from "@/app/components/schedule/memberSearch/MemberSearch";
import styles from "./ScheduleBoard.module.css";

const START_HOUR  = 8;
const END_HOUR    = 20;
const COL_WIDTH   = 80; // 1時間 = 80px
const HOURS       = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const DAY_LABELS  = ["日", "月", "火", "水", "木", "金", "土"];

export default function ScheduleBoard() {
  const { members, viewMode, selectedDate, setViewMode, setSelectedDate } =
    useScheduleStore();

  const visibleMembers = members
    .filter((m) => m.pinned)
    .sort((a, b) => a.roleOrder - b.roleOrder);

  const todayStr = new Date().toISOString().split("T")[0];
  const displayDate = new Date(selectedDate).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // 月表示用カレンダー生成
  const buildMonthCells = () => {
  const base  = new Date(selectedDate + "T00:00:00");
  const year  = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);

  const toLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const cells: { date: string; day: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < first.getDay(); i++) {
    const d = new Date(year, month, -first.getDay() + i + 1);
    cells.push({ date: toLocalDateStr(d), day: d.getDate(), isCurrentMonth: false });
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    cells.push({ date: toLocalDateStr(date), day: d, isCurrentMonth: true });
  }

  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({ date: toLocalDateStr(d), day: d.getDate(), isCurrentMonth: false });
  }

  return cells;
};

  return (
    <div className={styles.panel}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <span className={styles.title}>SCHEDULE</span>
        <span className={styles.date}>{displayDate}</span>
        <MemberSearch />
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === "day" ? styles.toggleBtnActive : ""}`}
            onClick={() => setViewMode("day")}
          >
            DAY
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "month" ? styles.toggleBtnActive : ""}`}
            onClick={() => setViewMode("month")}
          >
            MONTH
          </button>
        </div>
      </div>

      {/* DAY VIEW */}
      {viewMode === "day" && (
        <div className={styles.board}>
          {/* 時間軸 */}
          <div className={styles.timeHeader}>
            <div className={styles.timeHeaderSpacer} />
            <div className={styles.timeLabels}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className={styles.timeLabel}
                  style={{ width: `${COL_WIDTH}px` }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* メンバー行 */}
          {visibleMembers.map((member) => (
            <ScheduleRow
              key={member.id}
              member={member}
              colWidth={COL_WIDTH}
            />
          ))}
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === "month" && (
        <div style={{ padding: "14px" }}>
          {/* 月ナビ */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}>
            <button
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--text-2)",
                padding: "4px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(1);
                d.setMonth(d.getMonth() - 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
            >
              ←
            </button>
            <span style={{
              fontFamily: "var(--font-syne)",
              fontSize: "13px",
              fontWeight: 700,
              flex: 1,
              textAlign: "center",
            }}>
              {new Date(selectedDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
              })}
            </span>
            <button
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--text-2)",
                padding: "4px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(1);
                d.setMonth(d.getMonth() + 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
            >
              →
            </button>
          </div>

          <div className={styles.monthGrid}>
            {DAY_LABELS.map((d) => (
              <div key={d} className={styles.monthDayLabel}>{d}</div>
            ))}
            {buildMonthCells().map((cell) => {
              const isToday = cell.date === todayStr;
              const isSelected = cell.date === selectedDate;

              // その日のイベントを全メンバーから集める
              const dayEvents = visibleMembers.flatMap((m) =>
                m.events.map((e) => ({ ...e, memberColor: m.avatarColor }))
              ).slice(0, 3);

              return (
                <div
                  key={cell.date}
                  className={`
                    ${styles.monthCell}
                    ${isToday ? styles.monthCellToday : ""}
                    ${!cell.isCurrentMonth ? styles.monthCellOtherMonth : ""}
                  `}
                  onClick={() => {
                    setSelectedDate(cell.date);
                    setViewMode("day");
                  }}
                >
                  <div className={`${styles.monthDayNum} ${isToday ? styles.monthDayNumToday : ""}`}>
                    {cell.day}
                  </div>
                  {isToday && dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={styles.monthEvent}
                      style={{ background: ev.color }}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}