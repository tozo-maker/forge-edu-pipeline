
import React from "react";
import { FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Objective, BLOOMS_LEVELS } from "./types";

interface ObjectiveFormProps {
  newObjectiveText: string;
  setNewObjectiveText: (text: string) => void;
  newObjectiveBloom: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  setNewObjectiveBloom: React.Dispatch<React.SetStateAction<'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'>>;
  addObjective: () => void;
}

// Common learning objectives by Bloom's level
const COMMON_OBJECTIVES: Record<string, string[]> = {
  remember: [
    "Recall key facts about...",
    "Define the term...",
    "List the main components of...",
    "Identify the important events in..."
  ],
  understand: [
    "Explain the concept of...",
    "Summarize the main points of...",
    "Describe how... works",
    "Interpret the meaning of..."
  ],
  apply: [
    "Use the principles of... to solve problems",
    "Implement the concept of... in a new situation",
    "Demonstrate how to...",
    "Calculate using the formula for..."
  ],
  analyze: [
    "Compare and contrast... and...",
    "Analyze the causes and effects of...",
    "Examine the relationship between...",
    "Categorize... according to..."
  ],
  evaluate: [
    "Assess the effectiveness of...",
    "Judge the validity of...",
    "Critique the argument for...",
    "Evaluate the evidence for..."
  ],
  create: [
    "Design a new approach to...",
    "Develop a plan for...",
    "Create an original...",
    "Construct a model that..."
  ]
};

const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  newObjectiveText,
  setNewObjectiveText,
  newObjectiveBloom,
  setNewObjectiveBloom,
  addObjective,
}) => {
  const handleSuggestionClick = (suggestion: string) => {
    setNewObjectiveText(suggestion);
  };
  
  const handleBloomChange = (value: string) => {
    // Assert the type to ensure it's one of the valid bloom levels
    setNewObjectiveBloom(value as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create');
  };
  
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <FormItem>
            <FormLabel>Learning Objective Text</FormLabel>
            <Input
              value={newObjectiveText}
              onChange={(e) => setNewObjectiveText(e.target.value)}
              placeholder="Enter a learning objective..."
            />
            <FormDescription>
              What should students learn or be able to do?
            </FormDescription>
          </FormItem>
        </div>

        <div className="w-[180px]">
          <FormItem>
            <FormLabel>Bloom's Level</FormLabel>
            <Select
              value={newObjectiveBloom}
              onValueChange={handleBloomChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remember">Remember</SelectItem>
                <SelectItem value="understand">Understand</SelectItem>
                <SelectItem value="apply">Apply</SelectItem>
                <SelectItem value="analyze">Analyze</SelectItem>
                <SelectItem value="evaluate">Evaluate</SelectItem>
                <SelectItem value="create">Create</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </div>
      </div>
      
      {newObjectiveBloom && (
        <div>
          <FormLabel>Common Objectives (Click to use)</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            {COMMON_OBJECTIVES[newObjectiveBloom]?.map((suggestion, index) => (
              <div 
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm p-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-200"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={addObjective}
          disabled={!newObjectiveText || !newObjectiveBloom}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Objective
        </Button>
      </div>
    </div>
  );
};

export default ObjectiveForm;
