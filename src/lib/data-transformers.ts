import { TastingNote } from '@/types';
import { DEFAULT_RATINGS } from '@/constants/defaults';

/**
 * Supabase 데이터를 TastingNote 형태로 변환
 */
export function transformSupabaseToTastingNote(data: any): TastingNote {
  return {
    id: data.id,
    title: data.title || '',
    date: data.date || data.created_at,
    created_at: data.created_at,
    country: data.country || undefined,
    farm: data.farm || undefined,
    region: data.region || undefined,
    variety: data.variety || undefined,
    altitude: data.altitude || undefined,
    process: data.process || undefined,
    cup_notes: data.cup_notes || undefined,
    store_info: data.store_info || undefined,
    ratings: data.ratings || DEFAULT_RATINGS,
    notes: data.notes || undefined,
    extracted_text: data.extracted_text || undefined,
    image_url: data.image_url || undefined,
  };
}

/**
 * TastingNote를 Supabase 업데이트용 데이터로 변환
 */
export function transformTastingNoteToSupabase(note: Partial<TastingNote>) {
  return {
    title: note.title,
    date: note.date,
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
    updated_at: new Date().toISOString(),
  };
}

/**
 * 폼 데이터를 Supabase 삽입용 데이터로 변환
 */
export function transformFormDataToSupabase(formData: any, userId: string) {
  return {
    user_id: userId,
    title: formData.title,
    date: formData.date,
    country: formData.country || null,
    farm: formData.farm || null,
    region: formData.region || null,
    variety: formData.variety || null,
    altitude: formData.altitude || null,
    process: formData.process || null,
    cup_notes: formData.cup_notes || null,
    store_info: formData.store_info || null,
    ratings: formData.ratings,
    notes: formData.notes || null,
  };
}