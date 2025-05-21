
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProjectCreationDashboard from "@/components/project/ProjectCreationDashboard";

const ProjectCreationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="py-6">
        <ProjectCreationDashboard />
      </main>
    </div>
  );
};

export default ProjectCreationPage;
