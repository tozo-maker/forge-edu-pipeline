
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  promptId?: string;
  prompt?: string;
  parameters?: {
    model: string;
    style?: string;
    max_tokens: number;
    temperature: number;
    [key: string]: any;
  };
}

// Maximum number of retries for API calls
const MAX_RETRIES = 3;

// Exponential backoff for retries
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    const { promptId, prompt, parameters } = await req.json() as RequestBody;
    
    let finalPrompt = prompt;
    let finalParams = parameters || { model: "claude-3-opus-20240229", max_tokens: 4000, temperature: 0.7 };
    let sectionId: string | null = null;
    let projectId: string | null = null;
    let projectConfig: any = null;
    
    // If promptId is provided, fetch the prompt from the database
    if (promptId) {
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select('*, sections!inner(*)')
        .eq('id', promptId)
        .single();

      if (promptError) {
        throw new Error(`Error fetching prompt: ${promptError.message}`);
      }

      if (!promptData) {
        throw new Error(`Prompt with ID ${promptId} not found`);
      }

      finalPrompt = promptData.prompt_text;
      finalParams = promptData.parameters || finalParams;
      sectionId = promptData.section_id;
      
      // Get project ID from section
      if (promptData.sections) {
        const outlineId = promptData.sections.outline_id;
        
        const { data: outlineData } = await supabase
          .from('outlines')
          .select('project_id')
          .eq('id', outlineId)
          .single();
          
        if (outlineData) {
          projectId = outlineData.project_id;
          
          // Get project config for educational DNA
          const { data: configData } = await supabase
            .from('project_configs')
            .select('*')
            .eq('project_id', projectId)
            .single();
            
          if (configData) {
            projectConfig = configData;
          }
        }
      }
    }

    // Ensure we have a prompt to use
    if (!finalPrompt) {
      throw new Error('No prompt provided');
    }

    // Enhance prompt with educational context if available
    if (projectConfig) {
      const { educationalContext, pedagogicalApproach, culturalAccessibility } = projectConfig;
      
      // Add educational DNA as system context
      finalPrompt = `
Educational Context:
- Grade Level: ${educationalContext?.gradeLevel?.join(', ') || 'Not specified'}
- Subject Area: ${educationalContext?.subjectArea?.join(', ') || 'Not specified'}
- Standards: ${educationalContext?.standards?.join(', ') || 'Not specified'}

Pedagogical Approach:
- Teaching Methodology: ${pedagogicalApproach?.teachingMethodology?.join(', ') || 'Not specified'}
- Assessment Philosophy: ${pedagogicalApproach?.assessmentPhilosophy || 'Not specified'}

Accessibility Requirements:
- Language Complexity: ${culturalAccessibility?.languageComplexity || 'Not specified'}
- Cultural Inclusion: ${culturalAccessibility?.culturalInclusion?.join(', ') || 'Not specified'}
- Accessibility Needs: ${culturalAccessibility?.accessibilityNeeds?.join(', ') || 'Not specified'}

${finalPrompt}`;
    }

    // Apply generation style if specified
    if (finalParams.style) {
      const styleIntro = 
        finalParams.style === "creative" ? 
          "Generate creative, engaging, and imaginative educational content. Feel free to use analogies, stories, and thought-provoking examples." :
        finalParams.style === "conservative" ?
          "Generate clear, concise, and straightforward educational content. Focus on accuracy, clarity, and alignment with educational standards." :
          "Generate well-balanced educational content that combines clarity with engagement. Use a mix of straightforward explanations and illustrative examples.";
          
      finalPrompt = `${styleIntro}\n\n${finalPrompt}`;
    }

    // Adjust temperature based on style if not explicitly set
    if (finalParams.style && !parameters?.temperature) {
      finalParams.temperature = 
        finalParams.style === "creative" ? 0.9 :
        finalParams.style === "conservative" ? 0.3 : 0.7;
    }

    // Log operation start for monitoring
    console.log(`Generating content with Claude API for prompt${promptId ? ` ID: ${promptId}` : ''}`);

    // Call Anthropic Claude API with retry logic
    let content = null;
    let error = null;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        console.log(`API attempt ${retries + 1} of ${MAX_RETRIES}`);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: finalParams.model,
            max_tokens: finalParams.max_tokens,
            temperature: finalParams.temperature,
            messages: [
              {
                role: "user",
                content: finalPrompt
              }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Claude API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        content = data.content && data.content.length > 0 ? data.content[0].text : null;
        
        if (!content) {
          throw new Error('Empty content returned from Claude API');
        }
        
        // Success - break out of retry loop
        break;
      } catch (err) {
        error = err;
        console.error(`Attempt ${retries + 1} failed: ${err.message}`);
        
        // Increment retry counter
        retries++;
        
        // If we've exhausted retries, break and throw the error
        if (retries >= MAX_RETRIES) {
          break;
        }
        
        // Exponential backoff: wait 2^retries * 1000ms before retrying
        const backoffTime = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${backoffTime}ms...`);
        await sleep(backoffTime);
      }
    }

    // Check if content generation failed after all retries
    if (!content) {
      throw new Error(`Failed to generate content after ${MAX_RETRIES} retries: ${error?.message || 'Unknown error'}`);
    }

    // Store content in database if related to a section
    let contentId: string | null = null;
    if (sectionId && promptId) {
      // Check if content already exists for this prompt
      const { data: existingContent } = await adminClient
        .from('content_items')
        .select('id')
        .eq('prompt_id', promptId)
        .maybeSingle();

      // Insert or update content
      const contentOp = existingContent ? adminClient
        .from('content_items')
        .update({
          content_text: content,
          updated_at: new Date().toISOString(),
          is_approved: false,
          metadata: {
            model: finalParams.model,
            style: finalParams.style || 'balanced',
            temperature: finalParams.temperature,
            generated_at: new Date().toISOString()
          }
        })
        .eq('id', existingContent.id)
        .select() : adminClient
        .from('content_items')
        .insert({
          prompt_id: promptId,
          content_text: content,
          is_approved: false,
          metadata: {
            model: finalParams.model,
            style: finalParams.style || 'balanced',
            temperature: finalParams.temperature,
            generated_at: new Date().toISOString()
          }
        })
        .select();
        
      const { data: contentData, error: contentError } = await contentOp;

      if (contentError) {
        console.error('Error storing content:', contentError);
      } else if (contentData && contentData.length > 0) {
        contentId = contentData[0].id;
        
        // Run basic quality check in the background
        try {
          const qualityPrompt = `
You are an educational content quality assessor. Analyze the following educational content and provide quality metrics:

${content}

Provide a JSON response with these quality metrics (scores from 0-10):
1. standards_alignment: How well the content aligns with typical educational standards
2. reading_level: What reading level the content is appropriate for (score and level name)
3. pedagogical_alignment: How well it supports effective teaching and learning
4. accessibility: How accessible the content is for diverse learners
5. cultural_sensitivity: How culturally inclusive and sensitive the content is

Return ONLY valid JSON with no explanatory text.
`;

          const qualityResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicApiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: "claude-3-haiku-20240307",
              max_tokens: 1000,
              temperature: 0.2,
              messages: [{ role: "user", content: qualityPrompt }]
            })
          });
  
          if (qualityResponse.ok) {
            const qualityData = await qualityResponse.json();
            let qualityText = qualityData.content && qualityData.content.length > 0 
              ? qualityData.content[0].text : null;
            
            if (qualityText) {
              // Try to parse as JSON, but handle if it's wrapped in text
              try {
                // Extract JSON if it's in a code block format
                const jsonMatch = qualityText.match(/```json\n([\s\S]*?)\n```/) || 
                                qualityText.match(/```([\s\S]*?)```/);
                
                if (jsonMatch && jsonMatch[1]) {
                  qualityText = jsonMatch[1];
                }
                
                const qualityMetrics = JSON.parse(qualityText);
                
                // Store the quality metrics with the content
                await adminClient
                  .from('content_items')
                  .update({
                    metadata: {
                      ...contentData[0].metadata,
                      quality_metrics: qualityMetrics
                    }
                  })
                  .eq('id', contentId);
              } catch (e) {
                console.error('Error parsing quality metrics:', e);
              }
            }
          }
        } catch (qualityError) {
          console.error('Error generating quality metrics:', qualityError);
          // Non-blocking, we still return the generated content
        }
      }
    }

    // Return generated content
    return new Response(
      JSON.stringify({
        success: true,
        content,
        contentId,
        metadata: {
          model: finalParams.model,
          style: finalParams.style || 'balanced',
          temperature: finalParams.temperature,
          tokens: content.split(' ').length, // Rough estimate
          generated_at: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-educational-content:', error);
    
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
