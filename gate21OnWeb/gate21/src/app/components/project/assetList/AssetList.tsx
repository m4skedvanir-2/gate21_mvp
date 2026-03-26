// app/components/project/assetList/AssetList.tsx

"use client";

import { useState, useEffect} from "react";
import { useModalStore } from "@/app/stores/useModalStore";
import styles from "./AssetList.module.css";

type IconType = "key" | "cred" | "doc";

type Asset = {
  id: string;
  name: string;
  asset_type: string;
  created_at: string;
};

function getIcon(assetType: string): { icon: IconType; label: string } {
  if (assetType.includes("キー") || assetType.includes("トークン")) return { icon: "key", label: "KEY" };
  if (assetType.includes("認証")) return { icon: "cred", label: "CRED" };
  return { icon: "doc", label: "DOC" };
}

const ICON_STYLES: Record<IconType, string> = {
  key:  styles.iconKey,
  cred: styles.iconCred,
  doc:  styles.iconDoc,
};

interface Props {
  projectId: string;
}

export default function AssetList({ projectId }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const { open, currentProjectId } = useModalStore();
  const fetchAssets = async () => {
  try {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("gate21_token="))
      ?.split("=")[1] ?? "";

    const res = await fetch(`http://localhost:8080/api/assets/${projectId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) return;
    const data = await res.json();
    setAssets(data);
  } catch (e) {
    console.error(e);
  }
};

  useEffect(() => { fetchAssets(); }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>秘密資産</span>
        <span className={styles.badge}>暗号化済</span>
        <button className={styles.action} onClick={() => { open("asset"); fetchAssets(); }}>
          ＋ 追加
        </button>
        <button className={styles.action}>すべて →</button>
      </div>
      <div className={styles.list}>
        {assets.length === 0 ? (
          <div style={{ padding: "16px", fontSize: 12, color: "var(--text-3)" }}>資産がありません</div>
        ) : (
          assets.map((asset) => {
            const { icon, label } = getIcon(asset.asset_type);
            return (
              <div key={asset.id} className={styles.item} onClick={() => open("asset")} style={{ cursor: "pointer" }}>
                <div className={`${styles.icon} ${ICON_STYLES[icon]}`}>{label}</div>
                <div className={styles.body}>
                  <div className={styles.assetName}>{asset.name}</div>
                  <div className={styles.meta}>{asset.asset_type} · {asset.created_at}</div>
                </div>
                <div className={styles.lockIcon}>🔒</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}