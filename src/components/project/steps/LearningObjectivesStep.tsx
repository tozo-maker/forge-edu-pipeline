import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { ProjectWizardFormData } from "@/types/project";

const objectiveSchema = z.object({
  text: z.string().min(3, "Objective text is required"),
  bloomsLevel: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']),
});

const learningObjectivesSchema = z.object({
  objectives: z.array(objectiveSchema).min(1, "At least one learning objective is required"),
});

const BLOOMS_LEVELS = [
  { value: 'remember', label: 'Remember', description: 'Recall facts and basic concepts' },
  { value: 'understand', label: 'Understand', description: 'Explain ideas or concepts' },
  { value: 'apply', label: 'Apply', description: 'Use information in new situations' },
  { value: 'analyze', label: 'Analyze', description: 'Draw connections among ideas' },
  { value: 'evaluate', label: 'Evaluate', description: 'Justify a stand or decision' },
  { value: 'create', label: 'Create', description: 'Produce new or original work' },
];

type LearningObjectivesStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
  onBack: () => void;
};

type Objective = {
  text: string;
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
};

const LearningObjectivesStep: React.FC<LearningObjectivesStepProps> = ({ data, onNext, onBack }) => {
  // Provide default values for all required properties
  const [objectives, setObjectives] = useState<Objective[]>(
    data.objectives?.map(obj => ({
      text: obj.text || "Learning Objective", // Default value instead of empty string
      bloomsLevel: obj.bloomsLevel || "understand"
    })) || []
  );
  
  const [newObjectiveText, setNewObjectiveText] = useState("");
  const [newObjectiveBloom, setNewObjectiveBloom] = useState<'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'>('understand');

  const form = useForm<z.infer<typeof learningObjectivesSchema>>({
    resolver: zodResolver(learningObjectivesSchema),
    defaultValues: {
      objectives: objectives,
    },
  });

  const addObjective = () => {
    if (!newObjectiveText.trim()) return;
    
    const newObjective: Objective = {
      text: newObjectiveText,
      bloomsLevel: newObjectiveBloom
    };
    
    const updatedObjectives = [...objectives, newObjective];
    setObjectives(updatedObjectives);
    form.setValue("objectives", updatedObjectives);
    setNewObjectiveText("");
  };

  const removeObjective = (index: number) => {
    const updatedObjectives = objectives.filter((_, i) => i !== index);
    setObjectives(updatedObjectives);
    form.setValue("objectives", updatedObjectives);
  };

  const handleSubmit = (values: z.infer<typeof learningObjectivesSchema>) => {
    // Ensure all objectives have required properties before submitting
    const validObjectives = values.objectives.map(objective => ({
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3">
              <FormLabel>Objective Text</FormLabel>
              <Input 
                value={newObjectiveText}
                onChange={(e) => setNewObjectiveText(e.target.value)}
                placeholder="e.g., Identify the main components of photosynthesis..."
              />
            </div>
            <div>
              <FormLabel>Bloom's Level</FormLabel>
              <Select 
                value={newObjectiveBloom} 
                onValueChange={(value: any) => setNewObjectiveBloom(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOMS_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="button" 
            onClick={addObjective}
            variant="outline"
            className="w-full"
            disabled={!newObjectiveText.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Learning Objective
          </Button>
        </div>

        <FormField
          control={form.control}
          name="objectives"
          render={() => (
            <FormItem>
              <div className="space-y-3">
                {objectives.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No objectives added yet</p>
                ) : (
                  objectives.map((objective, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{objective.text}</p>
                          <p className="text-sm text-muted-foreground">
                            Bloom's Level: {BLOOMS_LEVELS.find(l => l.value === objective.bloomsLevel)?.label}
                          </p>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeObjective(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
                <FormMessage />
              </div>
            </FormItem>
          )}
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
