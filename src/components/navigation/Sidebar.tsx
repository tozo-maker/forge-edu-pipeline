
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  HelpCircle, 
  User,
  ChevronDown
} from "lucide-react";

interface SidebarProps {
  projectId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ projectId }) => {
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full py-4 hidden md:block">
      <div className="px-4 py-2">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-primary-500">EduForge AI</span>
        </Link>
      </div>
      
      <nav className="mt-8 px-2 space-y-1">
        <Link to="/dashboard">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start", 
              isActive("/dashboard") && "bg-primary-50 text-primary-500"
            )}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Button>
        </Link>
        
        <Link to="/projects">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start", 
              isActive("/projects") && !projectId && "bg-primary-50 text-primary-500"
            )}
          >
            <FolderOpen className="h-5 w-5 mr-3" />
            Projects
          </Button>
        </Link>
        
        {projectId && (
          <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="ml-6 mt-2 border-l-2 border-gray-200 pl-2"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm"
              >
                <ChevronDown className={cn("h-4 w-4 mr-1 transition-transform", open ? "transform rotate-180" : "")} />
                Project Pipeline
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {PIPELINE_STAGES.map((stage) => (
                <Link 
                  key={stage.id} 
                  to={`/projects/${projectId}/${stage.id}`}
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "w-full justify-start pl-6 text-xs", 
                      isActive(`/projects/${projectId}/${stage.id}`) && "bg-primary-50 text-primary-500"
                    )}
                  >
                    {stage.title}
                  </Button>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        <Link to="/settings">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start", 
              isActive("/settings") && "bg-primary-50 text-primary-500"
            )}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Button>
        </Link>
        
        <Link to="/help">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start", 
              isActive("/help") && "bg-primary-50 text-primary-500"
            )}
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            Help
          </Button>
        </Link>
        
        <Link to="/profile">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start", 
              isActive("/profile") && "bg-primary-50 text-primary-500"
            )}
          >
            <User className="h-5 w-5 mr-3" />
            Profile
          </Button>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
