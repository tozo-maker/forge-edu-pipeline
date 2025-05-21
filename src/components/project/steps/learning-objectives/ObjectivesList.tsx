
import React from "react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Objective, BLOOMS_LEVELS } from "./types";

interface ObjectivesListProps {
  form: UseFormReturn<any>;
  objectives: Objective[];
  removeObjective: (index: number) => void;
}

const ObjectivesList: React.FC<ObjectivesListProps> = ({ 
  form, 
  objectives, 
  removeObjective 
}) => {
  return (
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
  );
};

export default ObjectivesList;
