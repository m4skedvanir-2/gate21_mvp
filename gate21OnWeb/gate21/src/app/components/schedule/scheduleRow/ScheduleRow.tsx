import { useScheduleStore } from "@/app/stores/useScheduleStore";
import type { ScheduleMember } from "@/app/stores/useScheduleStore";
import styles from "./ScheduleRow.module.css";

const START_HOUR  = 8;
const TOTAL_MINS  = 720;

interface Props {
  member: ScheduleMember;
  colWidth: number;
}

export default function ScheduleRow({ member, colWidth }: Props) {
  const { selectedDate } = useScheduleStore();
  const minWidth = colWidth / 60;

  // selectedDateのイベントだけ表示
  const filteredEvents = member.events.filter((ev) => ev.date === selectedDate);

  return (
    <div className={styles.row}>
      <div className={styles.memberCol}>
        <div className={styles.avatar} style={{ background: member.avatarColor }}>
          {member.initials}
        </div>
        <div className={styles.memberInfo}>
          <div className={styles.memberName}>{member.name}</div>
          <div className={styles.memberRole}>{member.role}</div>
        </div>
      </div>

      <div
        className={styles.timeline}
        style={{ width: `${TOTAL_MINS * minWidth}px` }}
      >
        {filteredEvents.map((ev) => {
          const startMins = (ev.startHour - START_HOUR) * 60 + ev.startMin;
          if (startMins < 0 || startMins >= TOTAL_MINS) return null;

          const left   = startMins * minWidth;
          const width  = Math.min(ev.duration, TOTAL_MINS - startMins) * minWidth - 2;
          const height = 52;

          const startLabel = `${String(ev.startHour).padStart(2, "0")}:${String(ev.startMin).padStart(2, "0")}`;
          const endHour = ev.startHour + Math.floor((ev.startMin + ev.duration) / 60);
          const endMin  = (ev.startMin + ev.duration) % 60;
          const endLabel = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

          return (
            <div
              key={ev.id}
              className={styles.event}
              style={{
                left:       `${left}px`,
                width:      `${width}px`,
                height:     `${height}px`,
                background: ev.color,
                opacity:    0.9,
              }}
            >
              <div className={styles.eventTitle}>{ev.title}</div>
              <div className={styles.eventTime}>{startLabel} – {endLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}