// app/components/project/taskBoard/TaskBoard.tsx

"use client";

import {
  DndContext,
  closestCenter,
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
import { useMemo } from "react";
import {
  useTodoStore,
  type TodoCard,
  type LaneId,
  type TagType,
  type DueType,
} from "@/app/stores/useTodoStore";
import type { Project } from "@/app/types";
import styles from "./TaskBoard.module.css";
import { useModalStore } from "@/app/stores/useModalStore";


// ── Tag / Due スタイルマップ ──
const TAG_STYLES: Record<TagType, string> = {
  ui:   styles.tagUi,
  sec:  styles.tagSec,
  plan: styles.tagPlan,
  dev:  styles.tagDev,
  urg:  styles.tagUi, // urgはTaskBoardでは使わないがマップに必要
};

const TAG_LABELS: Record<TagType, string> = {
  ui:   "UI",
  sec:  "SEC",
  plan: "PLAN",
  dev:  "DEV",
  urg:  "URG",
};

const DUE_STYLES: Record<DueType, string> = {
  ok:   styles.dueOk,
  warn: styles.dueWarn,
  late: styles.dueLate,
};

// LaneId → 横カンバンの列順
const LANE_ORDER: LaneId[] = ["urgent", "todo", "wip", "done"];

const LANE_LABELS: Record<LaneId, string> = {
  urgent: "緊急",
  todo:   "TODO",
  wip:    "進行中",
  done:   "完了",
};

const LANE_DOT_COLORS: Record<LaneId, string> = {
  urgent: "var(--red)",
  todo:   "var(--blue)",
  wip:    "var(--accent)",
  done:   "var(--text-3)",
};

// ── Sortable Card ──
function SortableCard({ card }: { card: TodoCard }) {
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
      className={styles.card}
      {...attributes}
      {...listeners}
    >
      <div className={styles.cardTags}>
        {card.tags.filter((t) => t !== "urg").map((tag) => (
          <span key={tag} className={`${styles.tag} ${TAG_STYLES[tag as TagType]}`}>
            {TAG_LABELS[tag as TagType]}
          </span>
        ))}
      </div>
      <div className={styles.cardTitle}>{card.title}</div>
      <div className={styles.cardFoot}>
        {card.due && (
          <span className={`${styles.cardDue} ${DUE_STYLES[card.due.type]}`}>
            {card.due.label}
          </span>
        )}
        <div
          className={styles.cardAv}
          style={{ background: card.avatarColor }}
        >
          {card.avatarInitials}
        </div>
      </div>
    </div>
  );
}
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
        minHeight: "60px",
        background: isOver ? "var(--accent-bg)" : "transparent",
        borderRadius: "6px",
        transition: "background 0.15s",
        flex: 1,
      }}
    >
      {children}
    </div>
  );
}

// ── Main Component ──
interface Props {
  project: Project;
}

export default function TaskBoard({ project }: Props) {
  const { lanes, moveCard, reorderCard } = useTodoStore();
  const { open } = useModalStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // プロジェクトIDでフィルタしたレーン
  const filteredLanes = useMemo(() => {
    return LANE_ORDER.map((laneId) => {
      const lane = lanes.find((l) => l.id === laneId);
      if (!lane) return null;
      return {
        ...lane,
        cards: lane.cards.filter(
          (c) => !project.id || c.projectId === project.id
        ),
      };
    }).filter(Boolean);
  }, [lanes, project.id]);

  // カードID → laneId マップ
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
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId   = String(over.id);

    const fromLane = cardLaneMap[activeId];
    // overがカードIDかレーンIDか判定
    const toLane = cardLaneMap[overId] ?? (overId as LaneId);

    if (!fromLane) return;

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
        <span className={styles.title}>TASK BOARD</span>
        <span className={styles.badge}>{project.label}</span>
        <button className={styles.addBtn} onClick={() => open("task")}>＋ タスク追加</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.kanban}>
          {filteredLanes.map((lane) => {
            if (!lane) return null;
            const cardIds = lane.cards.map((c) => c.id);

            return (
              <div key={lane.id} className={styles.col}>
                <div className={styles.colHeader}>
                  <div
                    className={styles.colDot}
                    style={{ background: LANE_DOT_COLORS[lane.id] }}
                  />
                  <span className={styles.colTitle}>
                    {LANE_LABELS[lane.id]}
                  </span>
                  <span className={styles.colCount} style={lane.countStyle}>
                    {lane.cards.length}
                  </span>
                </div>
                <div className={styles.cards}>
                    <DroppableLane laneId={lane.id}>
                        <SortableContext
                        items={cardIds}
                        strategy={verticalListSortingStrategy}
                        >
                        {lane.cards.map((card) => (
                        <SortableCard key={card.id} card={card} />
                        ))}
                        </SortableContext>
                    </DroppableLane>
                </div>
                <button className={styles.colAddBtn} onClick={() => open("task")}>＋ タスク追加</button>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}