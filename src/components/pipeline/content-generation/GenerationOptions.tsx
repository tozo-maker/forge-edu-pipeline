
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Scale } from 'lucide-react';

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
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="space-y-2 w-full md:w-1/2">
        <label className="text-sm font-medium flex items-center gap-2">
          AI Model 
          <Badge variant="outline" className="font-normal">Claude</Badge>
        </label>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude-3-opus-20240229">Claude 3 Opus (Most Powerful)</SelectItem>
            <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet (Balanced)</SelectItem>
            <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku (Fastest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2 w-full md:w-1/2">
        <label className="text-sm font-medium">Generation Style</label>
        <Select value={style} onValueChange={onStyleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select generation style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creative">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Creative</span>
              </div>
            </SelectItem>
            <SelectItem value="balanced">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-500" />
                <span>Balanced</span>
              </div>
            </SelectItem>
            <SelectItem value="conservative">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span>Conservative</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default GenerationOptions;
