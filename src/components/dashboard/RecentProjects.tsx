
import React from "react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PipelineStage } from "@/types/pipeline";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string;
  currentStage: PipelineStage;
  completionPercentage: number;
  updated_at: string;
}

interface RecentProjectsProps {
  projects: Project[];
}

const stageBadgeStyles = {
  project_config: "bg-blue-100 text-blue-800",
  outline_context: "bg-indigo-100 text-indigo-800",
  section_details: "bg-purple-100 text-purple-800",
  claude_prompts: "bg-pink-100 text-pink-800",
  content: "bg-orange-100 text-orange-800",
  validation: "bg-green-100 text-green-800"
};

const stageNames = {
  project_config: "Project Config",
  outline_context: "Outline",
  section_details: "Section Details",
  claude_prompts: "Prompts",
  content: "Content",
  validation: "Validation"
};

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>
          Your most recently updated educational content projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link 
                key={project.id}
                to={`/projects/${project.id}`}
                className="block"
              >
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={
                        stageBadgeStyles[project.currentStage] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {stageNames[project.currentStage]}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Updated {formatDistanceToNow(new Date(project.updated_at))} ago
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {project.completionPercentage}% complete
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            <Link 
              to="/projects" 
              className="text-center block text-primary-500 hover:text-primary-600 font-medium text-sm py-2"
            >
              View all projects
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">You haven't created any projects yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProjects;
