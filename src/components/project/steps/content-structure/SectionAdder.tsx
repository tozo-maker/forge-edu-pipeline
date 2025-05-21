
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

type SectionAdderProps = {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddSection: () => void;
};

const SectionAdder: React.FC<SectionAdderProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onAddSection,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Section title"
          />
        </div>
        <div>
          <Button
            type="button"
            onClick={onAddSection}
            variant="outline"
            className="w-full"
            disabled={!title.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>
      
      <Textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Section description (optional)"
        className="min-h-[80px]"
      />
    </div>
  );
};

export default SectionAdder;
