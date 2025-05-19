
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'teacher' | 'instructional_designer' | 'curriculum_developer';
  preferences: any;
  created_at: string;
  updated_at: string;
};

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setProfile(data as UserProfile);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data as UserProfile);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
};
