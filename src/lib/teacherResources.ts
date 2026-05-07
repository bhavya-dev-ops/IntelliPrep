import { supabase } from './supabaseClient';

export interface TeacherResource {
  id: string;
  teacher_id: string;
  teacher_name: string;
  title: string;
  description?: string;
  content?: string;
  file_url?: string;
  file_type?: string;
  category: 'Study Material' | 'Notes' | 'Assignment' | 'Resource';
  subject: string;
  target_class: string;
  created_at: string;
}

export async function uploadResource(
  file: File | null,
  metadata: Omit<TeacherResource, 'id' | 'created_at' | 'file_url' | 'file_type'>
) {
  let fileUrl = '';
  let fileType = '';

  if (file) {
    const fileName = `teacher_resources/${metadata.teacher_id}/${Date.now()}_${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('materials')
      .upload(fileName, file);

    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);
    
    fileUrl = publicUrl;
    fileType = file.type;
  }

  const { data, error } = await supabase
    .from('teacher_resources')
    .insert([{
      ...metadata,
      file_url: fileUrl || null,
      file_type: fileType || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as TeacherResource;
}

export async function getTeacherResources(teacherId: string): Promise<TeacherResource[]> {
  try {
    const { data, error } = await supabase
      .from('teacher_resources')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        console.warn('Table "teacher_resources" does not exist. Please run the SQL setup script.');
      } else {
        console.error('Error fetching teacher resources:', error);
      }
      return [];
    }
    return data || [];
  } catch (e) {
    return [];
  }
}

export async function getStudentResources(studentClass: string): Promise<TeacherResource[]> {
  try {
    const { data, error } = await supabase
      .from('teacher_resources')
      .select('*')
      .eq('target_class', studentClass)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        console.warn('Table "teacher_resources" does not exist. Please run the SQL setup script.');
      } else {
        console.error('Error fetching student resources:', error);
      }
      return [];
    }
    return data || [];
  } catch (e) {
    return [];
  }
}

export async function deleteResource(id: string, fileUrl?: string) {
  if (fileUrl) {
    const path = fileUrl.split('/materials/')[1];
    await supabase.storage.from('materials').remove([path]);
  }

  const { error } = await supabase
    .from('teacher_resources')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
