// app/components/dashboard/todoKanban/TodoKanban.tsx

"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTodoStore, type TodoCard, type LaneId, type TagType, type DueType } from "@/app/stores/useTodoStore";
import styles from "./TodoKanban.module.css";
import { useModalStore } from "@/app/stores/useModalStore";

// ── Tag / Due スタイルマップ ──
const TAG_STYLES: Record<TagType, string> = {
  ui:   styles.tagUi,
  sec:  styles.tagSec,
  plan: styles.tagPlan,
  dev:  styles.tagDev,
  urg:  styles.tagUrg,
};

const TAG_LABELS: Record<TagType, string> = {
  ui:   "UI",
  sec:  "SEC",
  plan: "PLAN",
  dev:  "DEV",
  urg:  "URGENT",
};

const DUE_STYLES: Record<DueType, string> = {
  ok:   styles.dueOk,
  warn: styles.dueWarn,
  late: styles.dueLate,
};

// ── Sortable Card ──
function SortableCard({
  card,
  onToggle,
}: {
  card: TodoCard;
  onToggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${card.urgent ? styles.urgentCard : ""} ${card.done ? styles.cardDone : ""}`}
    >
      {/* チェックボックス — クリックでdoneトグル */}
      <div
        className={`${styles.checkbox} ${card.done ? styles.checkboxDone : ""}`}
        onClick={() => onToggle(card.id)}
      >
        {card.done && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#000" strokeWidth="2">
            <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" />
          </svg>
        )}
      </div>

      {/* ドラッグハンドル + 本文 */}
      <div className={styles.cardBody} {...attributes} {...listeners}>
        <div className={styles.cardTitle}>{card.title}</div>
        <div className={styles.cardSpec}>{card.spec}</div>
        <div className={styles.cardFoot}>
          {card.tags.map((tag) => (
            <span key={tag} className={`${styles.tag} ${TAG_STYLES[tag]}`}>
              {TAG_LABELS[tag]}
            </span>
          ))}
          {card.project && (
            <span className={styles.proj}>{card.project}</span>
          )}
          {card.due && (
            <span className={`${styles.due} ${DUE_STYLES[card.due.type]}`}>
              {card.due.label}
            </span>
          )}
          <div
            className={styles.avatar}
            style={{ background: card.avatarColor }}
          >
            {card.avatarInitials}
          </div>
        </div>
      </div>
    </div>
  );
}
// レーンコンポーネントを追加
function DroppableLane({
  laneId,
  children,
}: {
  laneId: LaneId;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: laneId });
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: "40px",
        background: isOver ? "var(--accent-bg)" : "transparent",
        borderRadius: "6px",
        transition: "background 0.15s",
      }}
    >
      {children}
    </div>
  );
}

// ── Main Component ──
export default function TodoKanban() {
  const { lanes, openLanes, moveCard, reorderCard, toggleDone, toggleLane } = useTodoStore();
  const { open } = useModalStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // カードID → laneId のマップ
  const cardLaneMap = useMemo(() => {
    const map: Record<string, LaneId> = {};
    lanes.forEach((lane) => {
      lane.cards.forEach((card) => {
        map[card.id] = lane.id;
      });
    });
    return map;
  }, [lanes]);

  const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;

  const activeId = String(active.id);
  const overId   = String(over.id);

  if (activeId === overId) return;

  const fromLane = cardLaneMap[activeId];
  // overがカードならそのカードのレーン、レーンIDなら直接使う
  const toLane = cardLaneMap[overId] !== undefined
    ? cardLaneMap[overId]
    : overId as LaneId;

  if (!fromLane || !toLane) return;

  if (fromLane === toLane) {
    const lane = lanes.find((l) => l.id === fromLane);
    if (!lane) return;
    const fromIndex = lane.cards.findIndex((c) => c.id === activeId);
    const toIndex   = lane.cards.findIndex((c) => c.id === overId);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderCard(fromLane, fromIndex, toIndex);
    }
  } else {
    moveCard(activeId, fromLane, toLane);
  }
};

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>MY TODO</span>
        <span className={styles.badge}>個人タスク — ORU Admin</span>
        <button className={styles.addBtn} onClick={() => open("task")}>＋ タスク追加</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div>
          {lanes.map((lane) => {
            const isOpen   = openLanes[lane.id];
            const isUrgent = lane.id === "urgent";
            const cardIds  = lane.cards.map((c) => c.id);

            return (
              <div
                key={lane.id}
                className={`${styles.lane} ${isUrgent ? styles.urgent : ""}`}
              >
                {/* Lane header */}
                <div
                  className={styles.laneHeader}
                  onClick={() => toggleLane(lane.id)}
                >
                  <div className={styles.laneDot} style={{ background: lane.dotColor }} />
                  <span className={styles.laneName}>{lane.label}</span>
                  <span className={styles.laneCount} style={lane.countStyle}>
                    {lane.cards.length}
                  </span>
                  <svg
                    className={`${styles.laneChevron} ${isOpen ? styles.laneChevronOpen : ""}`}
                    viewBox="0 0 12 12" width="12" height="12"
                    fill="none" stroke="currentColor" strokeWidth="1.8"
                  >
                    <polyline points="2,4 6,8 10,4" />
                  </svg>
                </div>

                {/* Cards */}
                <div
                  className={`${styles.cards} ${!isOpen ? styles.cardsCollapsed : ""}`}
                  style={{ maxHeight: isOpen ? `${lane.cards.length * 200 + 100}px` : "0" }}
                >
                  <DroppableLane laneId={lane.id}>
                  <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {lane.cards.map((card) => (
                      <SortableCard
                        key={card.id}
                        card={card}
                        onToggle={toggleDone}
                      />
                    ))}
                  </SortableContext>
                  </DroppableLane>
                </div>

                <button className={styles.laneAddBtn} onClick={() => open("task")}>＋ タスクを追加</button>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}