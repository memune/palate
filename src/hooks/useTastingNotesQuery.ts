'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { TastingNote } from '@/types';
import { transformSupabaseToTastingNote, transformTastingNoteToSupabase } from '@/lib/data-transformers';

const QUERY_KEYS = {
  tastingNotes: (userId: string) => ['tasting-notes', userId],
  tastingNote: (id: string) => ['tasting-note', id],
} as const;

// Fetch all tasting notes
export function useTastingNotes() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.tastingNotes(user?.id || ''),
    queryFn: async (): Promise<TastingNote[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(transformSupabaseToTastingNote);
    },
    enabled: !!user?.id,
  });
}

// Fetch single tasting note
export function useTastingNote(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.tastingNote(id),
    queryFn: async (): Promise<TastingNote | null> => {
      if (!user?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      return transformSupabaseToTastingNote(data);
    },
    enabled: !!user?.id && !!id,
  });
}

// Create tasting note mutation
export function useCreateTastingNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (note: Partial<TastingNote>): Promise<TastingNote> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const noteData = {
        user_id: user.id,
        title: note.title || '새 테이스팅 노트',
        date: note.date || new Date().toISOString(),
        extracted_text: note.extracted_text || null,
        country: note.country || null,
        farm: note.farm || null,
        region: note.region || null,
        variety: note.variety || null,
        altitude: note.altitude || null,
        process: note.process || null,
        cup_notes: note.cup_notes || null,
        store_info: note.store_info || null,
        ratings: note.ratings,
        notes: note.notes || null,
        image_url: note.image_url || null,
      };

      const { data, error } = await supabase
        .from('tasting_notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;
      
      // Return the raw data with id for redirect, transform for cache
      const transformedNote = transformSupabaseToTastingNote(data);
      return { ...transformedNote, id: data.id };
    },
    onSuccess: (newNote) => {
      // Update the cache with the new note
      queryClient.setQueryData(
        QUERY_KEYS.tastingNotes(user?.id || ''),
        (oldData: TastingNote[] | undefined) => {
          return oldData ? [newNote, ...oldData] : [newNote];
        }
      );
      
      // Set cache for individual note
      queryClient.setQueryData(QUERY_KEYS.tastingNote(newNote.id), newNote);
    },
  });
}

// Update tasting note mutation
export function useUpdateTastingNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: Partial<TastingNote> }): Promise<TastingNote> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const updateData = transformTastingNoteToSupabase(note);
      
      const { data, error } = await supabase
        .from('tasting_notes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      return transformSupabaseToTastingNote(data);
    },
    onSuccess: (updatedNote) => {
      // Update the cache with the updated note
      queryClient.setQueryData(
        QUERY_KEYS.tastingNotes(user?.id || ''),
        (oldData: TastingNote[] | undefined) => {
          return oldData?.map(note => 
            note.id === updatedNote.id ? updatedNote : note
          ) || [];
        }
      );
      
      // Update individual note cache
      queryClient.setQueryData(QUERY_KEYS.tastingNote(updatedNote.id), updatedNote);
    },
  });
}

// Delete tasting note mutation
export function useDeleteTastingNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (noteId: string): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('tasting_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, noteId) => {
      // Remove from cache
      queryClient.setQueryData(
        QUERY_KEYS.tastingNotes(user?.id || ''),
        (oldData: TastingNote[] | undefined) => {
          return oldData?.filter(note => note.id !== noteId) || [];
        }
      );
      
      // Remove individual note cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.tastingNote(noteId) });
    },
  });
}