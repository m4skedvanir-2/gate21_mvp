// app/components/dashboard/statusPanel/StatusPanel.tsx

import styles from "./StatusPanel.module.css";

interface SecItem {
  label: string;
  value: string;
  status: "ok" | "warn";
}

interface LogLine {
  time: string;
  level: "ok" | "warn" | "info";
  msg: string;
}

const SEC_ITEMS: SecItem[] = [
  { label: "デバイス認証", value: "認証済 #001", status: "ok" },
  { label: "サーバー同期", value: "オフライン",   status: "warn" },
  { label: "ログ記録",     value: "正常",         status: "ok" },
  { label: "アクセス制御", value: "有効",         status: "ok" },
];

const LOG_LINES: LogLine[] = [
  { time: "09:14:22", level: "ok",   msg: "デバイス認証成功 — MacBook Pro (M3) #001" },
  { time: "09:14:23", level: "ok",   msg: "ローカルDB復号化完了" },
  { time: "09:15:01", level: "ok",   msg: "資産アクセス — 本番環境APIキー / ORU Admin" },
  { time: "09:20:44", level: "warn", msg: "同期サーバー未応答 — オフラインモード継続" },
  { time: "09:22:10", level: "info", msg: "Project GATE21 アクセス — ORU Admin" },
];

const SEC_DOT_STYLES = {
  ok:   styles.secOk,
  warn: styles.secWarn,
};

const LOG_LEVEL_STYLES = {
  ok:   styles.lvOk,
  warn: styles.lvWarn,
  info: styles.lvInfo,
};

const LOG_LEVEL_LABELS = {
  ok:   "OK",
  warn: "WARN",
  info: "INFO",
};

export default function StatusPanel() {
  return (
    <div className={styles.wrap}>
      {/* Security */}
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>SECURITY STATUS</span>
        </div>
        <div className={styles.secList}>
          {SEC_ITEMS.map((item) => (
            <div key={item.label} className={styles.secItem}>
              <div className={`${styles.secDot} ${SEC_DOT_STYLES[item.status]}`} />
              <span className={styles.secLabel}>{item.label}</span>
              <span className={styles.secVal}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log */}
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>OPERATION LOG</span>
          <span className={styles.badgeLive}>LIVE</span>
        </div>
        <div className={styles.logStream}>
          {LOG_LINES.map((line, i) => (
            <div key={i} className={styles.logLine}>
              <span className={styles.logTime}>{line.time}</span>
              <span className={`${styles.logLevel} ${LOG_LEVEL_STYLES[line.level]}`}>
                {LOG_LEVEL_LABELS[line.level]}
              </span>
              <span className={styles.logMsg}>{line.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}