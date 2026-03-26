"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/AuthForm.module.css";

type CurrentUser = {
  user_id: string;
  organization_id: string;
  role: string;
};

export default function MembersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("gate21_token="))
      ?.split("=")[1];

    if (!token) { router.push("/login"); return; }

    fetch("http://localhost:8080/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user: CurrentUser) => {
        if (user.role !== "admin") router.push("/");
        setCurrentUser(user);
      })
      .catch(() => router.push("/login"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    setMessage("");
    try {
      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("gate21_token="))
        ?.split("=")[1] ?? "";

      const res = await fetch("http://localhost:8080/api/auth/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          username,
          password,
          role,
        }),
      });

      if (!res.ok) {
        setIsError(true);
        setMessage("メンバーの作成に失敗しました");
        return;
      }

      setIsError(false);
      setMessage("メンバーを作成しました");
      setEmail(""); setUsername(""); setPassword("");
    } catch {
      setIsError(true);
      setMessage("サーバーに接続できません");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return <div className={styles.wrap} />;

    return (
    <div className={styles.wrap}>
      <div className={styles.scanline} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>GATE<em>21</em></div>
          <div className={styles.logoSub}>Member Management</div>
        </div>
        <div className={styles.box}>
          <div className={styles.title}>Add Member</div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input className={styles.input} placeholder="member-name" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.input} placeholder="member@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} placeholder="••••••••••••" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Role</label>
              <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className={isError ? styles.errorMsg : styles.successMsg}>{message}</div>
            <button className={styles.submitBtn} type="submit" disabled={isLoading}>
              {isLoading ? "CREATING..." : "ADD MEMBER"}
            </button>
          </form>
        </div>
        <div className={styles.link}>
          <a href="/">← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}