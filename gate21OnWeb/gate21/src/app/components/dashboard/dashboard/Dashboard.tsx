// app/components/dashboard/dashboard/Dashboard.tsx
import ProgressBar from "@/app/components/dashboard/progressbar/ProgressBar";
import MessagePanel from "@/app/components/dashboard/messagePanel/MessagePanel";
import SchedulePanel from "@/app/components/dashboard/schedulePanel/SchedulePanel";
import ScheduleBoard from "@/app/components/schedule/scheduleBoard/ScheduleBoard";
import TodoKanban from "@/app/components/dashboard/todoKanban/TodoKanban";
import AttentionPanel from "@/app/components/dashboard/attentionPanel/AttentionPanel";
import StatusPanel from "@/app/components/dashboard/statusPanel/StatusPanel";
import type { PageId } from "@/app/types";
import styles from "./Dashboard.module.css";

interface Props {
  onGoPage: (id: PageId) => void;
}

export default function Dashboard({ onGoPage }: Props) {
  return (
    <div className={styles.wrap}>
      {/* ① 進捗 */}
      <ProgressBar />

      {/* ② メッセージ + スケジュール */}
      <div className={styles.grid32}>
        <MessagePanel onGoMessages={() => onGoPage("messages")} />
        <SchedulePanel />
      </div>
      {/*scheduleBoard*/}
      <ScheduleBoard />

      {/* ③ TODO縦カンバン */}
      <TodoKanban />

      {/* ④ アテンション */}
      <AttentionPanel />

      {/* ⑤ セキュリティ + ログ */}
      <StatusPanel />
    </div>
  );
}