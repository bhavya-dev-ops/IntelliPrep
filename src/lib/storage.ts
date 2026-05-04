import { supabase } from './supabaseClient';

export interface FileMetadata {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export async function uploadFile(file: File, userId: string) {
  // 1. Upload file to Supabase Storage
  // We store it in a folder named after the user_id for security
  const fileName = `${userId}/${Date.now()}_${file.name}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('materials')
    .upload(fileName, file);

  if (storageError) {
    console.error('Storage Error:', storageError);
    throw storageError;
  }

  // 2. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('materials')
    .getPublicUrl(fileName);

  // 3. Save metadata to database
  const { data, error: dbError } = await supabase
    .from('materials_files')
    .insert([{
      user_id: userId,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
    }])
    .select()
    .single();

  if (dbError) {
    console.error('Database Error:', dbError);
    throw dbError;
  }

  return data as FileMetadata;
}

export async function getUserFiles(userId: string): Promise<FileMetadata[]> {
  const { data, error } = await supabase
    .from('materials_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Error:', error);
    return [];
  }
  return data || [];
}

export async function deleteFile(fileId: string, fileUrl: string) {
  // 1. Extract file path from URL
  const path = fileUrl.split('/materials/')[1];
  
  // 2. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from('materials')
    .remove([path]);

  if (storageError) console.error('Storage Delete Error:', storageError);

  // 3. Delete from Database
  const { error: dbError } = await supabase
    .from('materials_files')
    .delete()
    .eq('id', fileId);

  if (dbError) throw dbError;
  return true;
}
