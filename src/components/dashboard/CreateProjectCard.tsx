
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { ArrowRight, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

const CreateProjectCard: React.FC = () => {
  return (
    <Card className="border-dashed border-2 hover:border-primary-400 hover:bg-primary-50 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="mr-2 h-5 w-5 text-primary-500" />
          Create New Project
        </CardTitle>
        <CardDescription>
          Start creating new educational content through our six-stage pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {PIPELINE_STAGES.map((stage, index) => (
              <div 
                key={stage.id} 
                className="text-center space-y-1"
              >
                <div className="flex-1 mx-auto h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">{stage.title}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Button asChild className="w-full">
          <Link to="/projects/create">
            Start Creating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateProjectCard;
