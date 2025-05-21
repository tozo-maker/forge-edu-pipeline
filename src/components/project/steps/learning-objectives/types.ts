
import { ProjectWizardFormData } from "@/types/project";

export type Objective = {
  text: string;
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
};

export type LearningObjectivesStepProps = {
  data: Partial<ProjectWizardFormData>;
  onNext: (data: Partial<ProjectWizardFormData>) => void;
  onBack: () => void;
};

export const BLOOMS_LEVELS = [
  { value: 'remember', label: 'Remember', description: 'Recall facts and basic concepts' },
  { value: 'understand', label: 'Understand', description: 'Explain ideas or concepts' },
  { value: 'apply', label: 'Apply', description: 'Use information in new situations' },
  { value: 'analyze', label: 'Analyze', description: 'Draw connections among ideas' },
  { value: 'evaluate', label: 'Evaluate', description: 'Justify a stand or decision' },
  { value: 'create', label: 'Create', description: 'Produce new or original work' },
];
