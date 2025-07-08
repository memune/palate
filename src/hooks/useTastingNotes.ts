'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { TastingNote } from '@/types';

export function useTastingNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<TastingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to TastingNote format
      const transformedNotes: TastingNote[] = data.map(note => ({
        id: note.id,
        title: note.title,
        date: note.date || note.created_at,
        extractedText: note.extracted_text || undefined,
        country: note.country || undefined,
        farm: note.farm || undefined,
        region: note.region || undefined,
        variety: note.variety || undefined,
        altitude: note.altitude || undefined,
        process: note.process || undefined,
        cupNotes: note.cup_notes || undefined,
        storeInfo: note.store_info || undefined,
        ratings: note.ratings || {
          aroma: 5,
          flavor: 5,
          acidity: 5,
          sweetness: 5,
          body: 5,
          aftertaste: 5,
          balance: 5,
          overall: 5,
        },
        notes: note.notes || undefined,
        imageUrl: note.image_url || undefined,
      }));

      setNotes(transformedNotes);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (note: Partial<TastingNote>): Promise<TastingNote | null> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const noteData = {
        user_id: user.id,
        title: note.title || '새 테이스팅 노트',
        date: note.date || new Date().toISOString(),
        extracted_text: note.extractedText || null,
        country: note.country || null,
        farm: note.farm || null,
        region: note.region || null,
        variety: note.variety || null,
        altitude: note.altitude || null,
        process: note.process || null,
        cup_notes: note.cupNotes || null,
        store_info: note.storeInfo || null,
        ratings: note.ratings || {
          aroma: 5,
          flavor: 5,
          acidity: 5,
          sweetness: 5,
          body: 5,
          aftertaste: 5,
          balance: 5,
          overall: 5,
        },
        notes: note.notes || null,
        image_url: note.imageUrl || null,
      };

      const { data, error } = await supabase
        .from('tasting_notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      // Transform back to TastingNote format
      const savedNote: TastingNote = {
        id: data.id,
        title: data.title,
        date: data.date || data.created_at,
        extractedText: data.extracted_text || undefined,
        country: data.country || undefined,
        farm: data.farm || undefined,
        region: data.region || undefined,
        variety: data.variety || undefined,
        altitude: data.altitude || undefined,
        process: data.process || undefined,
        cupNotes: data.cup_notes || undefined,
        storeInfo: data.store_info || undefined,
        ratings: data.ratings,
        notes: data.notes || undefined,
        imageUrl: data.image_url || undefined,
      };

      // Update local state
      setNotes(prev => [savedNote, ...prev]);
      return savedNote;
    } catch (err) {
      console.error('Error saving note:', err);
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('tasting_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    saveNote,
    deleteNote,
  };
}