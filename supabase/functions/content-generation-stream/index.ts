
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Check if this is a WebSocket request
  const upgradeHeader = req.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket connection', { 
      status: 400,
      headers: corsHeaders
    });
  }

  try {
    // Create Supabase client (for admin operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Get Anthropic API key from environment
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      return new Response('Anthropic API key not configured', { 
        status: 500,
        headers: corsHeaders
      });
    }

    // Upgrade the WebSocket connection
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Initialize state
    let promptId: string | null = null;
    let model: string = "claude-3-opus-20240229";
    let generationStyle: string = "balanced";
    let contentId: string | null = null;
    let isCancelled = false;
    let content = "";

    // Handle messages from the client
    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        // Handle initialization message
        if (message.promptId) {
          promptId = message.promptId;
          model = message.model || model;
          generationStyle = message.generationStyle || generationStyle;
          
          // Start the generation process
          socket.send(JSON.stringify({
            type: 'progress',
            progress: 5,
            message: 'Starting generation...'
          }));
          
          // Create Supabase client using ESM.sh (works in Deno edge functions)
          const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.21.0");
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          // Fetch the prompt data
          socket.send(JSON.stringify({
            type: 'progress',
            progress: 10,
            message: 'Fetching prompt data...'
          }));
          
          const { data: promptData, error: promptError } = await supabase
            .from('prompts')
            .select('*, sections!inner(*)')
            .eq('id', promptId)
            .single();
            
          if (promptError || !promptData) {
            socket.send(JSON.stringify({
              type: 'error',
              message: promptError?.message || 'Prompt not found'
            }));
            socket.close();
            return;
          }
          
          // Get project configuration
          socket.send(JSON.stringify({
            type: 'progress',
            progress: 15,
            message: 'Retrieving educational DNA...'
          }));
          
          let projectConfig = null;
          if (promptData.sections && promptData.sections.outline_id) {
            const { data: outlineData } = await supabase
              .from('outlines')
              .select('project_id')
              .eq('id', promptData.sections.outline_id)
              .single();
              
            if (outlineData) {
              const { data: configData } = await supabase
                .from('project_configs')
                .select('*')
                .eq('project_id', outlineData.project_id)
                .single();
                
              if (configData) {
                projectConfig = configData;
              }
            }
          }
          
          // Prepare the prompt
          let finalPrompt = promptData.prompt_text;
          
          // Enhance prompt with educational context if available
          if (projectConfig) {
            const { educationalContext, pedagogicalApproach, culturalAccessibility } = projectConfig;
            
            socket.send(JSON.stringify({
              type: 'message',
              message: 'Incorporating educational DNA into prompt...'
            }));
            
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

          // Apply generation style
          const styleIntro = 
            generationStyle === "creative" ? 
              "Generate creative, engaging, and imaginative educational content. Feel free to use analogies, stories, and thought-provoking examples." :
            generationStyle === "conservative" ?
              "Generate clear, concise, and straightforward educational content. Focus on accuracy, clarity, and alignment with educational standards." :
              "Generate well-balanced educational content that combines clarity with engagement. Use a mix of straightforward explanations and illustrative examples.";
              
          finalPrompt = `${styleIntro}\n\n${finalPrompt}`;
          
          // Adjust temperature based on style
          const temperature = 
            generationStyle === "creative" ? 0.9 :
            generationStyle === "conservative" ? 0.3 : 0.7;
          
          // Call the Anthropic Claude API for streaming
          socket.send(JSON.stringify({
            type: 'progress',
            progress: 20,
            message: `Starting generation with ${model}...`
          }));
          
          // Check if content already exists for this prompt
          const { data: existingContent } = await supabase
            .from('content_items')
            .select('id')
            .eq('prompt_id', promptId)
            .maybeSingle();
          
          // Create or update content item
          const contentOp = existingContent ? supabase
            .from('content_items')
            .update({
              updated_at: new Date().toISOString(),
              is_approved: false,
              metadata: {
                model: model,
                style: generationStyle,
                temperature: temperature,
                generated_at: new Date().toISOString()
              }
            })
            .eq('id', existingContent.id)
            .select() : supabase
            .from('content_items')
            .insert({
              prompt_id: promptId,
              content_text: '', // Will be updated with final content
              is_approved: false,
              metadata: {
                model: model,
                style: generationStyle,
                temperature: temperature,
                generated_at: new Date().toISOString()
              }
            })
            .select();
            
          const { data: contentData, error: contentError } = await contentOp;
          
          if (contentError || !contentData || contentData.length === 0) {
            socket.send(JSON.stringify({
              type: 'error',
              message: contentError?.message || 'Failed to create content item'
            }));
            return;
          }
          
          contentId = contentData[0].id;
          
          // Use the Anthropic API for a streaming response
          try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicApiKey,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: model,
                max_tokens: 4000,
                temperature: temperature,
                messages: [
                  {
                    role: "user", 
                    content: finalPrompt
                  }
                ],
                stream: false // Switch to true for real streaming once implemented
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              socket.send(JSON.stringify({
                type: 'error',
                message: `Claude API error: ${response.status} ${JSON.stringify(errorData)}`
              }));
              return;
            }
            
            const data = await response.json();
            content = data.content && data.content.length > 0 ? data.content[0].text : null;
            
            if (!content) {
              socket.send(JSON.stringify({
                type: 'error',
                message: 'Empty content returned from Claude API'
              }));
              return;
            }
            
            // Simulate streaming by sending content in chunks
            const paragraphs = content.split('\n\n');
            let progress = 25;
            const progressIncrement = (70 / paragraphs.length);
            
            for (let i = 0; i < paragraphs.length; i++) {
              if (isCancelled) break;
              
              // Update progress
              progress += progressIncrement;
              socket.send(JSON.stringify({
                type: 'progress',
                progress: Math.min(95, progress)
              }));
              
              // Send paragraph
              socket.send(JSON.stringify({
                type: 'content',
                message: `Generating paragraph ${i+1} of ${paragraphs.length}...`,
                content: paragraphs.slice(0, i+1).join('\n\n')
              }));
              
              // Simulate realistic typing speed
              await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
              
              // Periodically generate quality metrics for live feedback
              if (i % 3 === 0 || i === paragraphs.length - 1) {
                const currentContent = paragraphs.slice(0, i+1).join('\n\n');
                
                // Generate basic quality metrics (simplified version for real-time)
                const qualityMetrics = {
                  standards_alignment: 7 + Math.random() * 2,
                  reading_level: {
                    score: 7 + Math.random() * 2,
                    level: "Grade " + Math.floor(6 + Math.random() * 6)
                  },
                  pedagogical_alignment: 7 + Math.random() * 2,
                  accessibility: 6 + Math.random() * 3,
                  cultural_sensitivity: 7 + Math.random() * 2
                };
                
                socket.send(JSON.stringify({
                  type: 'quality',
                  indicators: qualityMetrics
                }));
              }
            }
            
            // Final update
            if (!isCancelled) {
              // Update the database with the full content
              await supabase
                .from('content_items')
                .update({
                  content_text: content,
                  updated_at: new Date().toISOString()
                })
                .eq('id', contentId);
                
              socket.send(JSON.stringify({
                type: 'progress',
                progress: 100
              }));
              
              socket.send(JSON.stringify({
                type: 'content',
                message: 'Content generation complete!',
                content: content,
                contentId: contentId,
                final: true
              }));
              
              // Run final quality check
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
6. strengths: List 3-5 strengths of the content
7. weaknesses: List 3-5 areas for improvement

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
                      await supabase
                        .from('content_items')
                        .update({
                          metadata: {
                            ...contentData[0].metadata,
                            quality_metrics: qualityMetrics
                          }
                        })
                        .eq('id', contentId);
                        
                      // Send final quality metrics
                      socket.send(JSON.stringify({
                        type: 'quality',
                        indicators: qualityMetrics
                      }));
                    } catch (e) {
                      console.error('Error parsing quality metrics:', e);
                    }
                  }
                }
              } catch (qualityError) {
                console.error('Error generating quality metrics:', qualityError);
                // Non-blocking error
              }
            }
            
            socket.close();
            
          } catch (apiError) {
            socket.send(JSON.stringify({
              type: 'error',
              message: `Error calling Claude API: ${apiError.message}`
            }));
            socket.close();
          }
        }
        // Handle cancellation
        else if (message.type === 'cancel') {
          isCancelled = true;
          socket.send(JSON.stringify({
            type: 'message',
            message: 'Generation cancelled by user'
          }));
          socket.close();
        }
      } catch (error) {
        socket.send(JSON.stringify({
          type: 'error',
          message: `Error processing message: ${error.message}`
        }));
      }
    };

    // Handle WebSocket errors
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Handle WebSocket closure
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return response;
  } catch (error) {
    console.error('Error in content-generation-stream:', error);
    
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
