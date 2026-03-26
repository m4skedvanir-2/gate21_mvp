"use client";

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
import { useMemo } from "react";
import {
  useProjectStore,
  AVATAR_COLORS,
  type ProjectCard,
  type ProjectStatus,
  PROJECT_STATUS_LABELS,
} from "@/app/stores/useProjectStore";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "./ProjectsKanban.module.css";

const STATUS_ORDER: ProjectStatus[] = ["backlog", "active", "review", "done", "hold"];

const STATUS_DOT_COLORS: Record<ProjectStatus, string> = {
  backlog: "var(--text-3)",
  active:  "var(--accent)",
  review:  "var(--amber)",
  done:    "var(--blue)",
  hold:    "var(--red)",
};

const STATUS_COUNT_STYLES: Record<ProjectStatus, React.CSSProperties> = {
  backlog: { background: "var(--bg-hover)",   color: "var(--text-2)", borderColor: "var(--border)" },
  active:  { background: "var(--accent-bg)",  color: "var(--accent)", borderColor: "var(--accent-brd)" },
  review:  { background: "var(--amber-bg)",   color: "var(--amber)",  borderColor: "rgba(245,158,11,.2)" },
  done:    { background: "var(--blue-bg)",    color: "var(--blue)",   borderColor: "var(--blue-brd)" },
  hold:    { background: "var(--red-bg)",     color: "var(--red)",    borderColor: "var(--red-brd)" },
};

// ── Droppable Column ──
function DroppableCol({
  status,
  children,
}: {
  status: ProjectStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={styles.cards}
      style={{
        background: isOver ? "var(--accent-bg)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {children}
    </div>
  );
}

// ── Sortable Project Card ──
function SortableProjectCard({
  project,
  onOpen,
}: {
  project: ProjectCard;
  onOpen: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const progress = project.taskCount > 0
    ? Math.round((project.doneCount / project.taskCount) * 100)
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.card}
      onClick={() => onOpen(project.id)}
      {...attributes}
      {...listeners}
    >
      <div className={styles.cardAccent} style={{ background: project.color }} />
      <div className={styles.cardBody}>
        <div className={styles.cardName}>{project.name}</div>
        <div className={styles.cardDesc}>{project.description}</div>
        <div className={styles.cardFoot}>
          <div className={styles.members}>
            {project.members.slice(0, 4).map((m) => (
              <div
                key={m}
                className={styles.avatar}
                style={{ background: AVATAR_COLORS[m] ?? "#4a9eff" }}
              >
                {m}
              </div>
            ))}
          </div>
          <div className={styles.progress}>
            <div
              className={styles.progressBar}
              style={{
                width: `${progress}%`,
                background: project.color,
              }}
            />
          </div>
          {project.dueDate && (
            <span className={styles.due}>{project.dueDate}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
interface Props {
  onOpenProject: (id: string) => void;
}

export default function ProjectKanban({ onOpenProject }: Props) {
  const { projects, moveProject } = useProjectStore();
  const { open } = useModalStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const projectStatusMap = useMemo(() => {
    const map: Record<string, ProjectStatus> = {};
    projects.forEach((p) => { map[p.id] = p.status; });
    return map;
  }, [projects]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId   = String(over.id);

    if (activeId === overId) return;

    const toStatus = STATUS_ORDER.includes(overId as ProjectStatus)
      ? (overId as ProjectStatus)
      : projectStatusMap[overId];

    if (toStatus && projectStatusMap[activeId] !== toStatus) {
      moveProject(activeId, toStatus);
    }
  };

  const columns = STATUS_ORDER.map((status) => ({
    status,
    projects: projects.filter((p) => p.status === status),
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.kanban}>
        {columns.map(({ status, projects: colProjects }) => (
          <div key={status} className={styles.col}>
            <div className={styles.colHeader}>
              <div
                className={styles.colDot}
                style={{ background: STATUS_DOT_COLORS[status] }}
              />
              <span className={styles.colTitle}>
                {PROJECT_STATUS_LABELS[status]}
              </span>
              <span
                className={styles.colCount}
                style={STATUS_COUNT_STYLES[status]}
              >
                {colProjects.length}
              </span>
            </div>

            <SortableContext
              items={colProjects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <DroppableCol status={status}>
                {colProjects.map((project) => (
                  <SortableProjectCard
                    key={project.id}
                    project={project}
                    onOpen={onOpenProject}
                  />
                ))}
              </DroppableCol>
            </SortableContext>

            <button
              className={styles.colAddBtn}
              onClick={() => open("project")}
            >
              ＋ プロジェクト追加
            </button>
          </div>
        ))}
      </div>
    </DndContext>
  );
}