import StatCards from "@/app/components/project/statCards/StatCards";
import TaskBoard from "@/app/components/project/taskBoard/TaskBoard";
import AssetList from "@/app/components/project/assetList/AssetList";
import CustomerTable from "@/app/components/project/customerTable/CustomerTable";
import type { Project } from "@/app/types";
import styles from "./ProjectDashboard.module.css";

interface Props {
  project: Project;
}

export default function ProjectDashboard({ project }: Props) {
  return (
    <div className={styles.wrap}>
      <StatCards />
      <TaskBoard project={project} />
      <AssetList projectId={project.id}/>
      <CustomerTable />
    </div>
  );
}