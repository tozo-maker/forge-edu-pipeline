
import React from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BLOOMS_LEVELS } from "./types";

interface ObjectiveFormProps {
  newObjectiveText: string;
  setNewObjectiveText: (text: string) => void;
  newObjectiveBloom: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  setNewObjectiveBloom: (value: any) => void;
  addObjective: () => void;
}

const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  newObjectiveText,
  setNewObjectiveText,
  newObjectiveBloom,
  setNewObjectiveBloom,
  addObjective,
}) => {
  return (
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
  );
};

export default ObjectiveForm;
