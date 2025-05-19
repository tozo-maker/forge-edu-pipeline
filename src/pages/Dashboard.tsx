
import React from "react";
import { PipelineStage } from "@/types/pipeline";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import PipelineOverview from "@/components/dashboard/PipelineOverview";
import CreateProjectCard from "@/components/dashboard/CreateProjectCard";
import RecentProjects from "@/components/dashboard/RecentProjects";
import Sidebar from "@/components/navigation/Sidebar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

// Mock data for the dashboard
const mockUser = {
  name: "Jane Smith",
  role: "Curriculum Developer"
};

const mockProjects = [
  {
    id: "proj-1",
    title: "Biology 101 Curriculum",
    description: "Introductory biology course materials for high school students",
    currentStage: "content" as PipelineStage,
    completionPercentage: 75,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: "proj-2",
    title: "Math Lesson Plans",
    description: "Weekly lesson plans for 8th grade algebra",
    currentStage: "validation" as PipelineStage,
    completionPercentage: 90,
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: "proj-3",
    title: "History Interactive Quiz",
    description: "Interactive quizzes for World War II unit",
    currentStage: "section_details" as PipelineStage,
    completionPercentage: 40,
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];

const mockProjectProgress = [
  {
    id: "proj-1",
    title: "Biology 101 Curriculum",
    currentStage: 5, // Content stage
    completionPercentage: 75
  },
  {
    id: "proj-2",
    title: "Math Lesson Plans",
    currentStage: 6, // Validation stage
    completionPercentage: 90
  },
  {
    id: "proj-3",
    title: "History Interactive Quiz",
    currentStage: 3, // Section Details stage
    completionPercentage: 40
  }
];

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader userName={mockUser.name} userRole={mockUser.role} />
        <Breadcrumbs />
        
        <div className="flex-1 bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {mockUser.name} 👋</h1>
            
            <StatsCards 
              projectsCount={3} 
              contentGenerated={12} 
              timeSaved={24} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PipelineOverview projects={mockProjectProgress} />
              <CreateProjectCard />
            </div>
            
            <RecentProjects projects={mockProjects} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
