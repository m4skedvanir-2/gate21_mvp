// app/components/login/loginForm/LoginForm.tsx

"use client";

import { useState, useRef, useEffect } from "react";
//import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";

type Step = "credentials" | "tfa";

export default function LoginForm() {
  //const router = useRouter();

  const [step, setStep]               = useState<Step>("credentials");
  const [userId, setUserId]           = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [company, setCompany]         = useState<string | null>(null);
  const [error, setError]             = useState("");
  const [tfaCode, setTfaCode]         = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading]     = useState(false);

  const tfaRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  // UserIDが変わったら会社チェック
  useEffect(() => {
  const normalized = userId.trim().toLowerCase();
  if (!normalized) {
    setCompany(null);
    return;
  }

  const checkCompany = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/check-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: normalized }),
      });
      const data = await res.json();
      if (data.exists) {
        setCompany(data.company_name);
        setError("");
        setTimeout(() => emailRef.current?.focus(), 600);
      } else {
        setCompany(null);
      }
    } catch {
      setCompany(null);
    }
  };

  checkCompany();
}, [userId]);
type Step = "credentials" | "tfa";

  const handleCredentials = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!company) {
    setError("IDまたはパスワードが正しくありません");
    return;
  }
  if (!email || !password) {
    setError("すべての項目を入力してください");
    return;
  }
  setIsLoading(true);
  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_slug: userId.trim().toLowerCase(),
        email,
        password,
      }),
    });
    if (!res.ok) {
      setError("IDまたはパスワードが正しくありません");
      return;
    }
    const data = await res.json();
    sessionStorage.setItem("pending_token", data.access_token);
    sessionStorage.setItem("refresh_token", data.refresh_token);
    setStep("tfa");
    setError("");
  } catch {
    setError("サーバーに接続できません");
  } finally {
    setIsLoading(false);
  }
};

  const handleTfaInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...tfaCode];
    next[index] = value.slice(-1);
    setTfaCode(next);
    if (value && index < 5) {
      tfaRefs.current[index + 1]?.focus();
    }
    // 6桁揃ったら自動送信
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      handleTfaSubmit(next.join(""));
    }
  };

  const handleTfaKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !tfaCode[index] && index > 0) {
      tfaRefs.current[index - 1]?.focus();
    }
  };

  const handleTfaSubmit = async (code?: string) => {
  const finalCode = code ?? tfaCode.join("");
  if (finalCode.length !== 6) return;
  setIsLoading(true);
  // ダミーTFA（後でRust APIに差し替え）
  await new Promise((r) => setTimeout(r, 600));
  const token = sessionStorage.getItem("pending_token") ?? "dummy";
  sessionStorage.removeItem("pending_token");
  document.cookie = `gate21_token=${token}; path=/; max-age=86400`;
  window.location.href = "/";
  setIsLoading(false);
};

  return (
    <div className={styles.wrap}>
      <div className={styles.scanline} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            GATE<em>21</em>
          </div>
          <div className={styles.logoSub}>Secure Asset Management</div>
        </div>

        <div className={`${styles.box} ${company ? styles.boxUnlocked : ""}`}>

          {/* ── STEP 1: Credentials ── */}
          {step === "credentials" && (
            <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* 会社名グリッチ表示 */}
              <div className={`${styles.companyReveal} ${company ? styles.companyRevealOpen : ""}`}>
                {company && (
                  <div className={styles.companyName}>
                    <div className={styles.verifiedIcon}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <polyline points="1.5,4 3,5.5 6.5,2" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className={styles.glitch} key={company}>{company}</span>
                  </div>
                )}
              </div>

              {/* User ID */}
              <div className={styles.field}>
                <label className={styles.label}>USER ID</label>
                <input
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  type="text"
                  placeholder="your-id"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setError(""); }}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {/* Email — 会社確認後に出現 */}
              <div className={`${styles.emailReveal} ${company ? styles.emailRevealOpen : ""}`}>
                <div className={styles.field}>
                  <label className={styles.label}>EMAIL ADDRESS</label>
                  <input
                    ref={emailRef}
                    className={`${styles.input} ${error ? styles.inputError : ""}`}
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className={styles.field}>
                <label className={styles.label}>PASSWORD</label>
                <input
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                />
              </div>

              <div className={styles.errorMsg}>{error}</div>

              <button
                className={styles.submitBtn}
                type="submit"
                disabled={isLoading || !company}
              >
                {isLoading ? "VERIFYING..." : "AUTHENTICATE"}
              </button>
            </form>
          )}

          {/* ── STEP 2: 2FA ── */}
          {step === "tfa" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <div className={styles.label} style={{ marginBottom: "6px" }}>
                  2-FACTOR AUTHENTICATION
                </div>
                <div className={styles.tfaDesc}>
                  {email} に送信された<br />6桁のコードを入力してください
                </div>
              </div>

              <div className={styles.tfaWrap}>
                {tfaCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { tfaRefs.current[i] = el; }}
                    className={styles.tfaInput}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTfaInput(i, e.target.value)}
                    onKeyDown={(e) => handleTfaKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className={styles.tfaDesc}>
                コードが届かない場合は再送信してください
              </div>

              <button
                className={styles.submitBtn}
                onClick={() => handleTfaSubmit()}
                disabled={isLoading || tfaCode.some((d) => d === "")}
              >
                {isLoading ? "VERIFYING..." : "VERIFY"}
              </button>
            </div>
          )}

        </div>

        {/* Step indicator */}
        <div className={styles.stepWrap}>
          <div className={`${styles.stepDot} ${step === "credentials" ? styles.stepDotActive : ""}`} />
          <div className={`${styles.stepDot} ${step === "tfa" ? styles.stepDotActive : ""}`} />
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, opacity: 0.6 }}>
        <a href="/register">新規登録はこちら</a>
      </div>
    </div>
  );
}