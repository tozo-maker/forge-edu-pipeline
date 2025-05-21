
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Objective } from "./types";

const objectiveSchema = z.object({
  text: z.string().min(3, "Objective text is required"),
  bloomsLevel: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']),
});

const learningObjectivesSchema = z.object({
  objectives: z.array(objectiveSchema).min(1, "At least one learning objective is required"),
});

export const useLearningObjectivesForm = (initialObjectives: Objective[] = []) => {
  const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
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

  return {
    form,
    objectives,
    newObjectiveText,
    setNewObjectiveText,
    newObjectiveBloom,
    setNewObjectiveBloom,
    addObjective,
    removeObjective,
  };
};
