
import React from "react";
import { 
  FileText, 
  Clock, 
  BarChart4 
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";

const StatsCards: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading } = useProjects();
  
  const projectsCount = loading ? 0 : projects.length;
  
  // Calculate content generated (assume each project has 3 pages on average)
  const contentGenerated = projectsCount * 3;
  
  // Calculate time saved (assume 1.5 hours saved per project)
  const timeSaved = Math.round(projectsCount * 1.5);

  if (!user) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <FileText className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Projects Created</p>
            <h3 className="text-2xl font-bold">{projectsCount}</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <BarChart4 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Content Generated</p>
            <h3 className="text-2xl font-bold">{contentGenerated} pages</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Time Saved</p>
            <h3 className="text-2xl font-bold">{timeSaved} hours</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
