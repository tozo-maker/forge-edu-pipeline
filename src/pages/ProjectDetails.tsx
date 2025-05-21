
import React from "react";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PipelineStageNavigation from "@/components/pipeline/PipelineStageNavigation";
import useProjectDetails from "@/hooks/useProjectDetails";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectStatusCard from "@/components/project/ProjectStatusCard";
import ProjectMetadataSidebar from "@/components/project/ProjectMetadataSidebar";

const ProjectDetails: React.FC = () => {
  const {
    projectId,
    project,
    loading,
    completedStages,
    currentStageInfo,
    handleStageSelect,
    handleContinue,
  } = useProjectDetails();

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container max-w-5xl mx-auto p-6">
        <ProjectHeader project={project} />
        
        <div className="mt-6">
          <PipelineStageNavigation 
            projectId={projectId || ""}
            currentStage={project.pipeline_status}
            completedStages={completedStages}
            onStageSelect={handleStageSelect}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <ProjectStatusCard 
            currentStageInfo={currentStageInfo}
            handleContinue={handleContinue}
          />
          
          <ProjectMetadataSidebar 
            project={project}
            projectId={projectId || ""}
            currentStageInfo={currentStageInfo}
            completedStages={completedStages}
            handleContinue={handleContinue}
          />
        </div>
      </main>
      <Outlet />
    </div>
  );
};

export default ProjectDetails;
