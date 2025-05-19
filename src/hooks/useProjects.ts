
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PipelineStage } from '@/types/pipeline';

export type ProjectData = {
  id: string;
  title: string;
  description: string | null;
  pipeline_status: PipelineStage;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  config_dna: any;
};

export const useProjects = (limit?: number) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let query = supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setProjects(data as ProjectData[]);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Error fetching projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    // Set up real-time subscription
    const projectsSubscription = supabase
      .channel('projects_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: user ? `user_id=eq.${user.id}` : undefined 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, [user, limit]);

  const createProject = async (project: { title: string; description: string }) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: project.title,
          description: project.description,
          pipeline_status: 'project_config',
          completion_percentage: 0
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setProjects((prev) => [data as ProjectData, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating project:', err);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, createProject };
};
