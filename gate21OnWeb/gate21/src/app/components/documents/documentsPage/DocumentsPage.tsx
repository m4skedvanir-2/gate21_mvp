// app/components/documents/documentPage/DocumentsPage.tsx

"use client";

import DocumentForm from "@/app/components/documents/documentForm/DocumentForm";
import DocumentPreview from "@/app/components/documents/documentPreview/DocumentPreview";
import SubmitHistory from "@/app/components/documents/submitHistory/SubmitHistory";
import styles from "./DocumentsPage.module.css";

export default function DocumentsPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <div className={styles.headTitle}>書類提出</div>
          <div className={styles.headSub}>書類種別を選択して必要項目を入力してください</div>
        </div>
      </div>

      <div className={styles.grid}>
        <DocumentForm />
        <SubmitHistory />
      </div>

      {/* プレビューはオーバーレイで表示 */}
      <DocumentPreview />
    </div>
  );
}