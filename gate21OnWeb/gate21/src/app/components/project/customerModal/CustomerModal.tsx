"use client";

import { useState } from "react";
import Modal from "@/app/components/common/modal/Modal";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "./CustomerModal.module.css";

const CONTRACT_TYPES = ["月次保守", "開発委託", "SaaS利用", "スポット", "その他"];

export default function CustomerModal() {
  const { openModal, close } = useModalStore();

  const [name, setName]               = useState("");
  const [contact, setContact]         = useState("");
  const [email, setEmail]             = useState("");
  const [contractType, setContractType] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [amount, setAmount]           = useState("");

  if (openModal !== "customer") return null;

  const isValid = name.trim().length > 0 && contractType.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    // TODO: ストアに追加（DB連携時に実装）
    console.log({ name, contact, email, contractType, renewalDate, amount });
    close();
    setName(""); setContact(""); setEmail("");
    setContractType(""); setRenewalDate(""); setAmount("");
  };

  return (
    <Modal
      title="顧客を追加"
      onClose={close}
      onSubmit={handleSubmit}
      submitLabel="追加する"
      submitDisabled={!isValid}
    >
      <div className={styles.field}>
        <label className={styles.label}>
          顧客名 <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="例：株式会社〇〇"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>担当者名</label>
          <input
            className={styles.input}
            type="text"
            placeholder="例：田中 様"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>メールアドレス</label>
          <input
            className={styles.input}
            type="email"
            placeholder="contact@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          契約種別 <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.input} ${styles.select}`}
          value={contractType}
          onChange={(e) => setContractType(e.target.value)}
        >
          <option value="">選択してください</option>
          {CONTRACT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>契約更新日</label>
          <input
            className={styles.input}
            type="date"
            value={renewalDate}
            onChange={(e) => setRenewalDate(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>契約金額（円）</label>
          <input
            className={styles.input}
            type="number"
            placeholder="500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}