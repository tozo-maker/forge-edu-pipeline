
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, X } from "lucide-react";

type SectionItemProps = {
  section: {
    title: string;
    description: string;
    sequence: number;
  };
  index: number;
  isLast: boolean;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  index,
  isLast,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <div className="flex items-center h-full py-2 cursor-move">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-medium flex items-center">
                <span className="inline-block bg-gray-100 text-gray-700 w-6 h-6 rounded-full text-xs flex items-center justify-center mr-2">
                  {section.sequence}
                </span>
                {section.title}
              </h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveDown(index)}
                  disabled={isLast}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionItem;
