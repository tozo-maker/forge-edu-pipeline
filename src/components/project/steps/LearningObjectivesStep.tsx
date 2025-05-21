
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProjectWizardFormData } from "@/types/project";
import { useLearningObjectivesForm } from "./learning-objectives/useLearningObjectivesForm";
import ObjectiveForm from "./learning-objectives/ObjectiveForm";
import ObjectivesList from "./learning-objectives/ObjectivesList";
import { LearningObjectivesStepProps } from "./learning-objectives/types";

const LearningObjectivesStep: React.FC<LearningObjectivesStepProps> = ({ 
  data, 
  onNext, 
  onBack 
}) => {
  // Provide default values for all required properties
  const initialObjectives = data.objectives?.map(obj => ({
    text: obj.text || "Learning Objective", // Default value instead of empty string
    bloomsLevel: obj.bloomsLevel || "understand"
  })) || [];

  const {
    form,
    objectives,
    newObjectiveText,
    setNewObjectiveText,
    newObjectiveBloom,
    setNewObjectiveBloom,
    addObjective,
    removeObjective,
  } = useLearningObjectivesForm(initialObjectives);

  const handleSubmit = (values: any) => {
    // Ensure all objectives have required properties before submitting
    const validObjectives = values.objectives.map((objective: any) => ({
      text: objective.text || "Learning Objective",
      bloomsLevel: objective.bloomsLevel || "understand"
    }));
    
    onNext({
      objectives: validObjectives
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Learning Objectives</h2>
          <p className="text-sm text-gray-500">
            Define what students should know or be able to do after engaging with your content
          </p>
        </div>

        <ObjectiveForm
          newObjectiveText={newObjectiveText}
          setNewObjectiveText={setNewObjectiveText}
          newObjectiveBloom={newObjectiveBloom}
          setNewObjectiveBloom={setNewObjectiveBloom}
          addObjective={addObjective}
        />

        <ObjectivesList 
          form={form} 
          objectives={objectives} 
          removeObjective={removeObjective} 
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={objectives.length === 0}>Continue</Button>
        </div>
      </form>
    </Form>
  );
};

export default LearningObjectivesStep;
