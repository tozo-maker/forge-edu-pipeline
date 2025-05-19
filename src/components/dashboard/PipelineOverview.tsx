
import React from "react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";

const PipelineOverview: React.FC = () => {
  const { projects, loading } = useProjects();
  
  // Calculate current stage index for each project
  const projectsWithStageIndex = projects.map(project => {
    const stageIndex = PIPELINE_STAGES.findIndex(stage => stage.id === project.pipeline_status);
    return {
      ...project,
      currentStage: stageIndex >= 0 ? stageIndex + 1 : 1 // Default to stage 1 if not found
    };
  });
  
  // Sort by updated_at and take the first 3
  const displayedProjects = projectsWithStageIndex
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
        <CardDescription>
          Current progress of your educational content projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : displayedProjects.length > 0 ? (
          <div className="space-y-6">
            {displayedProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Link 
                    to={`/projects/${project.id}`}
                    className="font-medium hover:text-primary-500"
                  >
                    {project.title}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {project.completion_percentage}% complete
                  </span>
                </div>
                <Progress value={project.completion_percentage} className="h-2" />
                <div className="flex justify-between items-center mt-2">
                  {PIPELINE_STAGES.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                      <div 
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                          index + 1 < project.currentStage 
                            ? "bg-primary-500 text-white" 
                            : index + 1 === project.currentStage
                              ? "bg-primary-200 text-primary-800 ring-2 ring-primary-500"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < PIPELINE_STAGES.length - 1 && (
                        <div className="flex-grow border-t border-gray-200 mx-1"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            
            {projects.length > 3 && (
              <Link 
                to="/projects" 
                className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center mt-4"
              >
                View all projects
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any projects yet.</p>
            <Link 
              to="/projects/new" 
              className="text-primary-500 hover:text-primary-600 font-medium flex items-center justify-center"
            >
              Create your first project
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PipelineOverview;
