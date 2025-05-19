
export type PipelineStage =
  | "project_config"
  | "outline_context"
  | "section_details"
  | "claude_prompts" 
  | "content"
  | "validation";

export type PipelineStageInfo = {
  id: PipelineStage;
  title: string;
  description: string;
  icon: string;
  position: number;
};

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: "project_config",
    title: "Project Configuration",
    description: "Set up your project parameters and learning objectives",
    icon: "settings",
    position: 1
  },
  {
    id: "outline_context",
    title: "Outline Context",
    description: "Define the structure and context for your content",
    icon: "layout",
    position: 2
  },
  {
    id: "section_details",
    title: "Section Details",
    description: "Specify detailed requirements for each content section",
    icon: "list-check",
    position: 3
  },
  {
    id: "claude_prompts",
    title: "Claude Prompts",
    description: "Generate or customize AI prompts for content creation",
    icon: "message-square",
    position: 4
  },
  {
    id: "content",
    title: "Content",
    description: "Review and edit the AI-generated educational content",
    icon: "file-text",
    position: 5
  },
  {
    id: "validation",
    title: "Validation",
    description: "Validate content against standards and requirements",
    icon: "check-circle",
    position: 6
  }
];

export type Project = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  current_stage: PipelineStage;
  completion_percentage: number;
  user_id: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "instructional_designer" | "curriculum_developer";
  preferences: {
    subject_areas: string[];
    grade_levels: string[];
    teaching_style: string;
  };
};
