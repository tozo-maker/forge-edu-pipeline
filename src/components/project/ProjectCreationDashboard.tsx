
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuickStartWizard from "./QuickStartWizard";
import TemplateSelector from "./TemplateSelector";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { WizardProvider } from "@/contexts/WizardContext";

const ProjectCreationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [creationMethod, setCreationMethod] = useState<string>("quick");
  
  const handleStandardCreate = () => {
    navigate("/projects/new");
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-1">
          Choose how you want to create your educational content
        </p>
      </div>
      
      <Tabs 
        defaultValue="quick" 
        value={creationMethod}
        onValueChange={setCreationMethod} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="quick">Quick Start</TabsTrigger>
          <TabsTrigger value="template">From Template</TabsTrigger>
          <TabsTrigger value="standard">Standard Wizard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick">
          <WizardProvider>
            <QuickStartWizard />
          </WizardProvider>
        </TabsContent>
        
        <TabsContent value="template">
          <WizardProvider>
            <div className="space-y-6">
              <TemplateSelector />
              
              <div className="flex justify-end">
                <Button onClick={handleStandardCreate} className="gap-2">
                  Continue with Selected Template
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </WizardProvider>
        </TabsContent>
        
        <TabsContent value="standard">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Standard Project Creation</h3>
            <p className="text-gray-600 mb-6">
              Create your project step by step with full customization options using our standard project wizard.
            </p>
            <Button onClick={handleStandardCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Start Standard Wizard
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectCreationDashboard;
