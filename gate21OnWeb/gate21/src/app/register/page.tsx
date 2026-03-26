"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/AuthForm.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await invoke("register", { organizationName, email, username, password });
      router.push("/login");
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className={styles.wrap}>
      <div className={styles.scanline} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>GATE<em>21</em></div>
          <div className={styles.logoSub}>New Organization Setup</div>
        </div>
        <div className={styles.box}>
          <div className={styles.title}>Organization Registration</div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className={styles.field}>
              <label className={styles.label}>Company Name</label>
              <input className={styles.input} placeholder="your-company" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input className={styles.input} placeholder="admin-user" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.input} placeholder="you@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} placeholder="••••••••••••" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className={styles.errorMsg}>{error}</div>
            <button className={styles.submitBtn} type="submit" disabled={isLoading}>
              {isLoading ? "CREATING..." : "CREATE ORGANIZATION"}
            </button>
          </form>
        </div>
        <div className={styles.link}>
          <a href="/login">Already have an account? Sign in</a>
        </div>
      </div>
    </div>
  );
}