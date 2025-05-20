
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  contentId: string;
}

interface ValidationResult {
  quality_score: number;
  standards_alignment_score: number;
  improvement_suggestions: string;
  strengths: string[];
  weaknesses: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get Anthropic API key from environment
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      throw new Error("Anthropic API key not configured");
    }

    // Parse request body
    const { contentId } = await req.json() as RequestBody;
    
    if (!contentId) {
      throw new Error('Content ID is required');
    }

    // Log operation start for monitoring
    console.log(`Validating educational content for ID: ${contentId}`);

    // Fetch the content item
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('*, prompt:prompt_id(*)')
      .eq('id', contentId)
      .single();

    if (contentError || !contentItem) {
      throw new Error(`Error fetching content item: ${contentError?.message || 'Not found'}`);
    }

    // Fetch related section and project configuration
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('*, outline:outline_id(*)')
      .eq('id', contentItem.prompt.section_id)
      .single();

    if (sectionError) {
      throw new Error(`Error fetching section: ${sectionError.message}`);
    }

    const { data: projectConfig, error: configError } = await supabase
      .from('project_configs')
      .select('*')
      .eq('project_id', section.outline.project_id)
      .single();

    if (configError) {
      throw new Error(`Error fetching project configuration: ${configError.message}`);
    }

    // Build validation prompt with educational requirements and content to analyze
    const validationPrompt = buildValidationPrompt(projectConfig.config_data, section, contentItem);

    // Call Anthropic Claude API for validation
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 3000,
        temperature: 0.2, // Lower temperature for more consistent evaluation
        messages: [
          {
            role: "user",
            content: validationPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const apiResponse = await response.json();
    const validationResponse = apiResponse.content && apiResponse.content.length > 0 
      ? apiResponse.content[0].text 
      : null;
    
    if (!validationResponse) {
      throw new Error('Empty validation response from Claude API');
    }

    // Parse validation results
    const validationResult = parseValidationResponse(validationResponse);
    
    // Store validation results in database
    const { error: validationError } = await adminClient
      .from('validations')
      .insert({
        content_id: contentId,
        validation_data: validationResult,
        quality_score: validationResult.quality_score,
        standards_alignment_score: validationResult.standards_alignment_score,
        improvement_suggestions: validationResult.improvement_suggestions,
        is_approved: validationResult.quality_score >= 8.0 && validationResult.standards_alignment_score >= 8.0
      });

    if (validationError) {
      console.error('Error storing validation results:', validationError);
    }

    // Return validation results
    return new Response(
      JSON.stringify({
        success: true,
        validation: validationResult,
        content_id: contentId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in validate-educational-content:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function buildValidationPrompt(projectConfig: any, section: any, contentItem: any): string {
  const gradeLevel = projectConfig.educationalContext?.gradeLevel?.join(', ') || 'N/A';
  const subjectArea = projectConfig.educationalContext?.subjectArea?.join(', ') || 'N/A';
  const standards = projectConfig.educationalContext?.standards?.join('\n- ') || 'N/A';
  
  const teachingMethodology = projectConfig.pedagogicalApproach?.teachingMethodology?.join(', ') || 'standard';
  const assessmentPhilosophy = projectConfig.pedagogicalApproach?.assessmentPhilosophy || 'standard assessment';
  
  const languageComplexity = projectConfig.culturalAccessibility?.languageComplexity || 'moderate';
  const culturalInclusion = projectConfig.culturalAccessibility?.culturalInclusion?.join(', ') || 'inclusive';
  const accessibilityNeeds = projectConfig.culturalAccessibility?.accessibilityNeeds?.join(', ') || 'standard';

  const learningObjectives = projectConfig.learningObjectives?.map((obj: any) => 
    `- ${obj.text} (Bloom's Level: ${obj.bloomsLevel})`
  ).join('\n') || 'N/A';

  // Section specific information
  const sectionInfo = `
## ${section.title}
${section.description || 'No description provided'}

Learning Objectives:
${section.config?.learningObjectives?.map((obj: string) => `- ${obj}`).join('\n') || 'N/A'}

Activity Types:
${section.config?.activityTypes?.map((type: string) => `- ${type}`).join('\n') || 'N/A'}
`;

  return `# Educational Content Validation

## CONTENT TO VALIDATE
\`\`\`
${contentItem.content_text}
\`\`\`

## EVALUATION CRITERIA

Evaluate the educational content above against these criteria:

### EDUCATIONAL PARAMETERS
- Grade Level: ${gradeLevel}
- Subject Area: ${subjectArea}
- Educational Standards: ${standards}

### LEARNING OBJECTIVES
${learningObjectives}

### PEDAGOGICAL APPROACH
- Teaching Methodology: ${teachingMethodology}
- Assessment Philosophy: ${assessmentPhilosophy}

### SECTION REQUIREMENTS
${sectionInfo}

### ACCESSIBILITY AND INCLUSION
- Language Complexity: ${languageComplexity}
- Cultural Inclusion: ${culturalInclusion}
- Accessibility Needs: ${accessibilityNeeds}

## REQUIRED RESPONSE FORMAT
Analyze the content and respond in JSON format with the following structure:
\`\`\`json
{
  "quality_score": [number between 1-10],
  "standards_alignment_score": [number between 1-10],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improvement_suggestions": "Detailed improvement suggestions paragraph"
}
\`\`\`

Ensure your response is formatted exactly as described above with valid JSON. The scores should be numeric values between 1 and 10, with 10 being highest quality.
`;
}

function parseValidationResponse(response: string): ValidationResult {
  try {
    // Extract JSON from response - look for JSON object between triple backticks
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      const parsedJson = JSON.parse(jsonMatch[1]);
      return {
        quality_score: Number(parsedJson.quality_score) || 0,
        standards_alignment_score: Number(parsedJson.standards_alignment_score) || 0,
        improvement_suggestions: parsedJson.improvement_suggestions || '',
        strengths: Array.isArray(parsedJson.strengths) ? parsedJson.strengths : [],
        weaknesses: Array.isArray(parsedJson.weaknesses) ? parsedJson.weaknesses : []
      };
    }
    
    // If no JSON found between backticks, try parsing the entire response
    const parsedJson = JSON.parse(response.trim());
    return {
      quality_score: Number(parsedJson.quality_score) || 0,
      standards_alignment_score: Number(parsedJson.standards_alignment_score) || 0,
      improvement_suggestions: parsedJson.improvement_suggestions || '',
      strengths: Array.isArray(parsedJson.strengths) ? parsedJson.strengths : [],
      weaknesses: Array.isArray(parsedJson.weaknesses) ? parsedJson.weaknesses : []
    };
  } catch (error) {
    console.error('Error parsing validation response:', error);
    
    // Return default values if parsing fails
    return {
      quality_score: 0,
      standards_alignment_score: 0,
      improvement_suggestions: 'Error parsing validation results',
      strengths: [],
      weaknesses: ['Unable to parse validation response']
    };
  }
}
