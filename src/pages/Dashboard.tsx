
import React, { useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import PipelineOverview from "@/components/dashboard/PipelineOverview";
import RecentProjects from "@/components/dashboard/RecentProjects";
import CreateProjectCard from "@/components/dashboard/CreateProjectCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <StatsCards />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PipelineOverview />
          <div className="space-y-6">
            <RecentProjects />
            <CreateProjectCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
