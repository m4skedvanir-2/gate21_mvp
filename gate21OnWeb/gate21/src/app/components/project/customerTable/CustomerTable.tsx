// app/components/project/customerTable/CustomerTable.tsx

"use client";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "./CustomerTable.module.css";

type StatusType = "active" | "renewal" | "negotiating";

interface Customer {
  id: string;
  name: string;
  contact: string;
  contractType: string;
  renewalDate: string;
  status: StatusType;
}

const CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "株式会社 Alfa",
    contact: "田中 様",
    contractType: "月次保守",
    renewalDate: "2026.06.30",
    status: "active",
  },
  {
    id: "2",
    name: "Beta Labs Inc.",
    contact: "Smith 様",
    contractType: "開発委託",
    renewalDate: "2026.03.15",
    status: "renewal",
  },
  {
    id: "3",
    name: "Gamma 合同会社",
    contact: "鈴木 様",
    contractType: "SaaS利用",
    renewalDate: "2026.12.31",
    status: "active",
  },
  {
    id: "4",
    name: "Delta Corp.",
    contact: "—",
    contractType: "スポット",
    renewalDate: "2026.04.01",
    status: "negotiating",
  },
];

const STATUS_LABELS: Record<StatusType, string> = {
  active:      "契約中",
  renewal:     "更新要",
  negotiating: "商談中",
};

const STATUS_STYLES: Record<StatusType, string> = {
  active:      styles.badgeGreen,
  renewal:     styles.badgeAmber,
  negotiating: styles.badgeGray,
};

export default function CustomerTable() {
  const { open } = useModalStore();
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>顧客管理</span>
        <span className={styles.badge}>{CUSTOMERS.length}件</span>
        <button className={styles.action} onClick={() => open("customer")}>
          ＋ 追加
        </button>
        <button className={styles.action}>詳細管理 →</button>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>顧客名</th>
              <th>担当者</th>
              <th>契約種別</th>
              <th>契約更新日</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => (
              <tr key={c.id}>
                <td className={styles.customerName}>{c.name}</td>
                <td>{c.contact}</td>
                <td>{c.contractType}</td>
                <td className={styles.date}>{c.renewalDate}</td>
                <td>
                  <span className={STATUS_STYLES[c.status]}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}