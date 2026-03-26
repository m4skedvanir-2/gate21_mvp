// app/page.tsx

"use client";

import { useTheme } from "@/app/hooks/useTheme";
import { usePage } from "@/app/hooks/usePage";
import Sidebar from "@/app/components/layout/sidebar/Sidebar";
import Topbar from "@/app/components/layout/topbar/Topbar";
import Dashboard from "@/app/components/dashboard/dashboard/Dashboard";
import ProjectDashboard from "./components/project/projectDashboard/ProjectDashboard";
import DocumentsPage from "@/app/components/documents/documentsPage/DocumentsPage";
import MessagesPage from "@/app/components/messages/messagesPage/MessagesPage";
import ProjectsPage from "./components/projects/projectsPage/ProjectsPage";

//Modal一括import
import ProjectModal from "./components/project/projectModal/ProjectModal";
import AssetModal from "./components/project/assetModal/AssetModal";
import CustomerModal from "./components/project/customerModal/CustomerModal";
import TaskModal from "./components/project/taskModal/TaskModal";
import ReplyModal from "./components/messages/replayModal/ReplyModal";
import AssetViewModal from "./components/project/assetViewModal/AssetViewModal";

import { useModalStore } from "./stores/useModalStore";

import { useProjectStore } from "@/app/stores/useProjectStore";

import styles from "./page.module.css";

export default function Home() {
  const { theme, toggle } = useTheme();
  const { pageId, currentProject, goPage, openProject, goHome } = usePage();
  const { open } = useModalStore();
  const { projects } = useProjectStore();

  return (
    <div className={styles.shell}>
      <Sidebar
        pageId={pageId}
        currentProject={currentProject}
        theme={theme}
        onToggleTheme={toggle}
        onGoPage={goPage}
        onOpenProject={openProject}
        onGoHome={goHome}
      />
      <div className={styles.main}>
        <Topbar
          pageId={pageId}
          currentProject={currentProject}
          onOpenModal={() =>
            currentProject ? open("asset", undefined, currentProject.id) : open("project")
          }
        />
        <div className={styles.content}>
          {/*dashboardの追加*/}
          {pageId === "dashboard" && (
            <Dashboard onGoPage={goPage} />
          )}
          {/*project/dashboardの追加*/}
          {currentProject && (
            <ProjectDashboard project={currentProject} />
          )}
          {/*documentの追加*/}
          {pageId === "documents" && !currentProject && (
            <DocumentsPage />
          )}
          {/*messageの追加*/}
          {pageId === "messages" && !currentProject && (
            <MessagesPage />
          )}
          {/*projectsの追加*/}
          {pageId === "projects" && !currentProject && (
            <ProjectsPage onOpenProject={(id) => {
              const project = projects.find((p) => p.id === id);
              if (project) openProject({
                id: project.id,
                label: project.label,
                color: project.color,
              });
            }} />
          )}
          {/* 戻る処理*/}
          {pageId !== "dashboard" && 
           pageId !== "messages" &&
           pageId !== "documents" && 
           pageId !== "projects" &&
           !currentProject && (
            <p style={{ color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
              page: {pageId}
            </p>
          )}
        </div>
      </div>
      {/*モーダル類*/}
      <ProjectModal />
      <AssetModal />
      <AssetViewModal />
      <CustomerModal />
      <TaskModal />
      <ReplyModal/>
    </div>
  );
}