
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Project } from "@/types/pipeline";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/projects")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        <Badge className="text-sm px-3 py-1">
          {project.completion_percentage}% Complete
        </Badge>
      </div>
    </div>
  );
};

export default ProjectHeader;
