"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/AuthForm.module.css";

type Request = {
  id: string;
  asset_name: string;
  request_type: string;
  status: string;
  requested_by_name: string;
  created_at: string;
};

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("gate21_token="))?.split("=")[1] ?? "";

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    fetch("http://localhost:8080/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(async (me) => {
        if (me.role !== "admin") { router.push("/"); return; }
        const res = await fetch("http://localhost:8080/api/assets/requests", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        setRequests(data);
      })
      .catch(() => router.push("/login"));
  }, []);

  const handleReview = async (requestId: string, approved: boolean) => {
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:8080/api/assets/requests/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ approved }),
      });

      if (!res.ok) {
        alert("処理に失敗しました");
        return;
      }

      setRequests((prev) => prev.map((r) =>
        r.id === requestId
          ? { ...r, status: approved ? "approved" : "rejected" }
          : r
      ));
    } catch {
      alert("サーバーに接続できません");
    } finally {
      setIsLoading(false);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <div className={styles.wrap}>
      <div className={styles.scanline} />
      <div style={{ position: "relative", zIndex: 1, width: 600 }}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>GATE<em>21</em></div>
          <div className={styles.logoSub}>Asset Request Review</div>
        </div>

        <div className={styles.box} style={{ marginBottom: 16 }}>
          <div className={styles.title}>承認待ち（{pending.length}件）</div>
          {pending.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              申請はありません
            </div>
          ) : pending.map((r) => (
            <div key={r.id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: r.request_type === "delete" ? "var(--red)" : "var(--accent)" }}>
                    [{r.request_type.toUpperCase()}]
                  </span>
                  {" "}<span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-1)" }}>{r.asset_name}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)" }}>{r.created_at}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)" }}>
                申請者: {r.requested_by_name}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className={styles.submitBtn} style={{ margin: 0 }}
                  onClick={() => handleReview(r.id, true)} disabled={isLoading}>
                  承認
                </button>
                <button className={styles.submitBtn}
                  style={{ margin: 0, background: "transparent", border: "1px solid var(--red)", color: "var(--red)" }}
                  onClick={() => handleReview(r.id, false)} disabled={isLoading}>
                  却下
                </button>
              </div>
            </div>
          ))}
        </div>

        {reviewed.length > 0 && (
          <div className={styles.box}>
            <div className={styles.title}>処理済み</div>
            {reviewed.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-2)" }}>
                  [{r.request_type.toUpperCase()}] {r.asset_name}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: r.status === "approved" ? "var(--accent)" : "var(--red)" }}>
                  {r.status === "approved" ? "承認済み" : "却下"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.link} style={{ marginTop: 16 }}>
          <a href="/">← ダッシュボードに戻る</a>
        </div>
      </div>
    </div>
  );
}