import { create } from "zustand";

export type ModalType = "project" | "asset" | "assetView" | "customer" | "task" | "reply" | "forward" | null;

interface ModalStore {
  openModal: ModalType;
  selectedAssetId: string | null;
  currentProjectId: string | null;
  open: (type: ModalType, assetId?: string | null, projectId?: string | null) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  openModal: null,
  selectedAssetId: null,
  currentProjectId: null,
  open: (type, assetId = null, projectId = null) => set({ openModal: type, selectedAssetId: assetId, currentProjectId: projectId }),
  close: () => set({ openModal: null, selectedAssetId: null, currentProjectId: null }),
}));