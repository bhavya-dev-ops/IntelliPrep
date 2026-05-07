"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadFile, getUserFiles, deleteFile, FileMetadata } from '@/lib/storage';
import { getStudentResources, TeacherResource } from '@/lib/teacherResources';
import { Card, CardBody } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { logActivity } from '@/lib/activity';
import { 
  BookOpen, 
  ClipboardList, 
  FileText, 
  Layers, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Download, 
  Search,
  AlertCircle,
  Plus,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaterialsFilesPage() {
  const { user, refreshUserData } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [teacherResources, setTeacherResources] = useState<TeacherResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadAllData();
      
      // REAL-TIME SYNC for teacher resources
      const channel = supabase
        .channel('teacher-resources-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_resources' }, () => {
          loadAllData();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  async function loadAllData() {
    if (!user) return;
    
    // Fetch user files and new teacher resources
    const [userFiles, officialResources] = await Promise.all([
      getUserFiles(user.id),
      getStudentResources('SDE-1 Boot Camp') // Default class mapping
    ]);
    
    // Fetch legacy teacher notes
    const { data: legacyNotes } = await supabase
      .from('teacher_notes')
      .select('*')
      .order('created_at', { ascending: false });

    // Combine them
    let combinedResources = [...officialResources];
    if (legacyNotes) {
      const mappedLegacy = legacyNotes.map(note => ({
        id: note.id,
        teacher_id: 'legacy',
        teacher_name: note.teacher_name || 'Instructor',
        title: note.title,
        description: note.content,
        category: 'Notes',
        subject: 'General',
        target_class: 'All',
        created_at: note.created_at
      } as TeacherResource));
      combinedResources = [...combinedResources, ...mappedLegacy];
    }

    setFiles(userFiles);
    setTeacherResources(combinedResources);
    setLoading(false);
  }

  // Log activity when a file is opened
  useEffect(() => {
    if (selectedFile && user) {
      logActivity(user.id, 'material');
    }
  }, [selectedFile, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const newFile = await uploadFile(file, user.id);
      setFiles([newFile, ...files]);
    } catch (err) {
      setError("Failed to upload file. Please check your connection.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this personal file?")) return;
    try {
      await deleteFile(id, url);
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-rose-500" />;
    if (type.includes('image')) return <Layers className="text-emerald-500" />;
    if (type.includes('word') || type.includes('officedocument')) return <BookOpen className="text-blue-500" />;
    return <Layers className="text-indigo-500" />;
  };

  const categories = [
    { name: 'Assignment', icon: <ClipboardList className="text-amber-500" />, color: 'bg-amber-50' },
    { name: 'Study Material', icon: <BookOpen className="text-blue-500" />, color: 'bg-blue-50' },
    { name: 'Notes', icon: <FileText className="text-emerald-500" />, color: 'bg-emerald-50' },
    { name: 'Resource', icon: <Layers className="text-indigo-500" />, color: 'bg-indigo-50' },
  ];

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 relative">
      {/* File Viewer Overlay (unchanged logic) */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-xl">
          <div className="flex items-center justify-between p-6 text-white border-b border-white/10">
            <div>
               <h2 className="font-black text-lg truncate max-w-md uppercase tracking-tight">{selectedFile.file_name}</h2>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Personal Encrypted Vault</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-blue-400 font-black tracking-widest animate-pulse border border-blue-500/30 px-3 py-1 rounded-full">● LIVE STUDY TRACKING</span>
              <button 
                onClick={() => setSelectedFile(null)}
                className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full overflow-hidden">
            {selectedFile.file_type.includes('pdf') ? (
              <iframe 
                src={`${selectedFile.file_url}#toolbar=0`} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            ) : selectedFile.file_type.includes('image') ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img src={selectedFile.file_url} alt="Full view" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
                   <Layers size={40} className="text-slate-500" />
                </div>
                <div className="text-center">
                   <p className="text-xl font-black uppercase tracking-tight">Preview Unavailable</p>
                   <p className="text-slate-500 text-sm mt-2">This file type must be audited locally.</p>
                </div>
                <a href={selectedFile.file_url} className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Download Archive</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-2 h-8 bg-primary rounded-full"></div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Knowledge Base</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">Access your personal study vault and official course materials curated by your instructors.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search repository..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/20 w-64 lg:w-80 outline-none"
              />
           </div>
           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={uploading}
             className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/20 flex items-center gap-3"
           >
             {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Upload size={18} />}
             {uploading ? 'Syncing...' : 'Upload Personal'}
           </button>
           <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-[2rem] text-sm font-black flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* OFFICIAL RESOURCES SECTION */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" size={24} />
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Official Course Materials</h2>
           </div>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-1.5 bg-slate-100 rounded-full">
              SDE-1 Boot Camp • Verified
           </div>
        </div>

        <div className="space-y-12">
          {teacherResources.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
               <Layers size={40} className="mx-auto mb-4 text-slate-200" />
               <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No official materials distributed yet.</p>
            </div>
          ) : (
            categories.map(category => {
               const categoryResources = teacherResources.filter(r => r.category === category.name);
               if (categoryResources.length === 0) return null;
               
               return (
                  <div key={category.name} className="space-y-6">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className={`p-2 rounded-xl ${category.color}`}>
                           {category.icon}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">{category.name}{category.name !== 'Notes' && 's'}</h3>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categoryResources.map((resource) => (
                           <motion.div key={resource.id} whileHover={{ y: -5 }} className="group">
                             <Card className="bg-white border-none shadow-sm hover:shadow-xl transition-all rounded-[2.5rem] overflow-hidden flex flex-col h-full border-l-4 border-transparent hover:border-primary">
                               <CardBody className="p-8 flex flex-col h-full">
                                 <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${category.color}`}>
                                       {category.icon}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{resource.subject}</div>
                                      <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                        <Clock size={10} /> {new Date(resource.created_at).toLocaleDateString('en-GB')}
                                      </div>
                                    </div>
                                 </div>
             
                                 <div className="flex-1">
                                   <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-primary transition-colors">{resource.title}</h3>
                                   <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6">{resource.description || 'Verified course resource.'}</p>
                                 </div>
             
                                 <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black text-slate-900 uppercase">{resource.teacher_name}</span>
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Instructor</span>
                                    </div>
                                    {resource.file_url ? (
                                      <a 
                                        href={resource.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 shadow-lg"
                                      >
                                        Open <ExternalLink size={12} />
                                      </a>
                                    ) : (
                                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Reference only</span>
                                    )}
                                 </div>
                               </CardBody>
                             </Card>
                           </motion.div>
                        ))}
                     </div>
                  </div>
               );
            })
          )}
        </div>
      </section>

      {/* PERSONAL REPOSITORY SECTION */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-t border-slate-100 pt-12">
           <div className="flex items-center gap-3">
              <Layers className="text-slate-400" size={24} />
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Personal Study Vault</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.length} items stored</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {files.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="text-4xl mb-4 opacity-20">📁</div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Your personal vault is empty. Upload your first document!</p>
            </div>
          ) : (
            files.map((file) => (
              <Card key={file.id} className="group bg-white border-none shadow-sm hover:shadow-lg transition-all rounded-[2rem] overflow-hidden">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                      {getFileIcon(file.file_type)}
                    </div>
                    <button 
                      onClick={() => handleDelete(file.id, file.file_url)}
                      className="text-slate-200 hover:text-rose-500 p-1 transition-colors"
                    >
                      <Plus className="rotate-45" size={20} />
                    </button>
                  </div>
                  
                  <h3 className="font-black text-slate-900 text-xs line-clamp-2 min-h-[32px] mb-4 uppercase tracking-tight" title={file.file_name}>
                    {file.file_name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                       <Clock size={10} className="text-slate-300" />
                       <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(file)}
                      className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      Audit <ChevronRight size={12} />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
