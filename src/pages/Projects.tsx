
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const Projects: React.FC = () => {
  const { projects, loading } = useProjects();
  const navigate = useNavigate();

  const stageNames = {
    project_config: "Project Config",
    outline_context: "Outline",
    section_details: "Section Details",
    claude_prompts: "Prompts",
    content: "Content",
    validation: "Validation"
  };

  const stageBadgeStyles = {
    project_config: "bg-blue-100 text-blue-800",
    outline_context: "bg-indigo-100 text-indigo-800",
    section_details: "bg-purple-100 text-purple-800",
    claude_prompts: "bg-pink-100 text-pink-800",
    content: "bg-orange-100 text-orange-800",
    validation: "bg-green-100 text-green-800"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button onClick={() => navigate("/projects/new")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <p>Loading projects...</p>
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={stageBadgeStyles[project.pipeline_status as keyof typeof stageBadgeStyles] || ""}
                      >
                        {stageNames[project.pipeline_status as keyof typeof stageNames]}
                      </Badge>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Created {formatDistanceToNow(new Date(project.created_at))} ago
                      </div>
                      <div className="text-xs font-medium">
                        {project.completion_percentage}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">You haven't created any projects yet.</p>
                <Button onClick={() => navigate("/projects/new")}>
                  Create your first project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Projects;
