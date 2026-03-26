// app/components/documents/submitHistory/.tsx

import {
  useDocumentStore,
  DOC_TYPE_LABELS,
  DOC_STATUS_LABELS,
  type DocStatus,
} from "@/app/stores/useDocumentStore";
import styles from "./SubmitHistory.module.css";

const STATUS_STYLES: Record<DocStatus, string> = {
  pending:  styles.badgePending,
  approved: styles.badgeApproved,
  rejected: styles.badgeRejected,
};

const TYPE_SHORT: Record<string, string> = {
  expense:  "経費",
  report:   "報告",
  contract: "契約",
  approval: "稟議",
  leave:    "休暇",
  other:    "他",
};

export default function SubmitHistory() {
  const { history } = useDocumentStore();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>提出履歴</span>
        <span className={styles.badge}>{history.length}件</span>
      </div>
      <div className={styles.list}>
        {history.length === 0 ? (
          <div className={styles.empty}>提出済み書類はありません</div>
        ) : (
          history.map((doc) => (
            <div key={doc.id} className={styles.item}>
              <div className={styles.icon}>
                {TYPE_SHORT[doc.type]}
              </div>
              <div className={styles.body}>
                <div className={styles.docTitle}>{doc.title}</div>
                <div className={styles.meta}>{doc.submittedAt}</div>
              </div>
              <span className={STATUS_STYLES[doc.status]}>
                {DOC_STATUS_LABELS[doc.status]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}