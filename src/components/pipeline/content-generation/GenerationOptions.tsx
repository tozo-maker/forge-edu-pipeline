
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationOptionsProps {
  model: string;
  onModelChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
}

const GenerationOptions: React.FC<GenerationOptionsProps> = ({
  model,
  onModelChange,
  style,
  onStyleChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="ai-model" className="block text-sm font-medium text-gray-700 mb-1">
          Claude AI Model
        </label>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger id="ai-model" className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude-3-opus-20240229">
              <div className="flex items-center">
                <span>Claude 3 Opus</span>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">Highest Quality</Badge>
              </div>
            </SelectItem>
            <SelectItem value="claude-3-sonnet-20240229">
              <div className="flex items-center">
                <span>Claude 3 Sonnet</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Balanced</Badge>
              </div>
            </SelectItem>
            <SelectItem value="claude-3-haiku-20240307">
              <div className="flex items-center">
                <span>Claude 3 Haiku</span>
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">Fastest</Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Generation Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md border cursor-pointer transition-colors",
              style === "creative" 
                ? "border-primary bg-primary/10" 
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onStyleChange("creative")}
          >
            <Sparkles className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Creative</span>
          </div>
          
          <div
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md border cursor-pointer transition-colors",
              style === "balanced" 
                ? "border-primary bg-primary/10" 
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onStyleChange("balanced")}
          >
            <BookOpen className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Balanced</span>
          </div>
          
          <div
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md border cursor-pointer transition-colors",
              style === "conservative" 
                ? "border-primary bg-primary/10" 
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onStyleChange("conservative")}
          >
            <Library className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Conservative</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptions;
