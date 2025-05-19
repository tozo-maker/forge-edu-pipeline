
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  active: boolean;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);
  
  React.useEffect(() => {
    const buildBreadcrumbs = () => {
      const pathParts = location.pathname.split('/').filter(Boolean);
      const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/', active: pathParts.length === 0 },
      ];
      
      let currentPath = '';
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath += `/${part}`;
        
        // Handle special cases
        if (part === 'projects' && i === 0) {
          items.push({ label: 'Projects', href: currentPath, active: i === pathParts.length - 1 });
        } 
        else if (i === 1 && pathParts[0] === 'projects') {
          // This is likely a project ID
          items.push({ 
            label: 'Project Details', 
            href: currentPath, 
            active: i === pathParts.length - 1
          });
        }
        else if (i === 2 && pathParts[0] === 'projects') {
          // This is likely a pipeline stage
          const stage = PIPELINE_STAGES.find(s => s.id === part);
          if (stage) {
            items.push({ 
              label: stage.title, 
              href: currentPath, 
              active: true
            });
          }
        }
        else {
          // Format the label (capitalize first letter and replace hyphens with spaces)
          const label = part
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          items.push({ 
            label, 
            href: currentPath, 
            active: i === pathParts.length - 1 
          });
        }
      }
      
      return items;
    };
    
    setBreadcrumbs(buildBreadcrumbs());
  }, [location]);
  
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav className="py-3 px-6 bg-white border-b border-gray-200">
      <ol className="flex flex-wrap text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-3 w-3 mx-2 text-gray-400" />}
            {breadcrumb.active ? (
              <span className="font-medium text-gray-900">{breadcrumb.label}</span>
            ) : (
              <Link 
                to={breadcrumb.href} 
                className="text-gray-500 hover:text-primary-500"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
