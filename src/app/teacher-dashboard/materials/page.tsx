"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  uploadResource, 
  getTeacherResources, 
  deleteResource, 
  TeacherResource 
} from '@/lib/teacherResources';
import { Card, CardBody } from '@/components/ui/Card';
import { 
  Plus, 
  FileText, 
  BookOpen, 
  ClipboardList, 
  Layers, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeacherResourcesPage() {
  const { user, userData } = useAuth();
  const [resources, setResources] = useState<TeacherResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Study Material' as TeacherResource['category'],
    subject: '',
    target_class: 'SDE-1 Boot Camp',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  async function fetchResources() {
    if (!user) return;
    const data = await getTeacherResources(user.id);
    setResources(data);
    setLoading(false);
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    if (!formData.title || !formData.subject) {
      alert("Please fill in the required fields.");
      return;
    }

    setIsUploading(true);
    try {
      await uploadResource(selectedFile, {
        teacher_id: user.id,
        teacher_name: userData.name || 'Teacher',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subject: formData.subject,
        target_class: formData.target_class,
      });

      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Study Material',
        subject: '',
        target_class: 'SDE-1 Boot Camp',
      });
      setSelectedFile(null);
      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Failed to upload resource. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl?: string) => {
    if (!confirm("Are you sure you want to remove this resource? It will be deleted for all students.")) return;
    try {
      await deleteResource(id, fileUrl);
      setResources(resources.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete resource.");
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesFilter = filter === 'All' || r.category === filter;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'Study Material': return <BookOpen className="text-blue-500" />;
      case 'Notes': return <FileText className="text-emerald-500" />;
      case 'Assignment': return <ClipboardList className="text-amber-500" />;
      default: return <Layers className="text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="text-primary" /> Resource Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Upload and manage learning materials for your students.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-xl shadow-slate-900/20 flex items-center gap-2"
        >
          <Plus size={18} /> Add New Resource
        </button>
      </div>

      {/* Stats/Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Resources', value: resources.length, icon: Layers, color: 'bg-blue-500' },
          { label: 'Assignments', value: resources.filter(r => r.category === 'Assignment').length, icon: ClipboardList, color: 'bg-amber-500' },
          { label: 'Active Classes', value: new Set(resources.map(r => r.target_class)).size, icon: CheckCircle2, color: 'bg-emerald-500' },
          { label: 'Storage Used', value: '14.2 MB', icon: Upload, color: 'bg-slate-700' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardBody className="p-6 flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
          {['All', 'Study Material', 'Notes', 'Assignment', 'Resource'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === cat ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-full py-3 pl-12 pr-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]"></div>
          ))
        ) : filteredResources.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Layers size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No resources found matching your criteria</p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={resource.id}
            >
              <Card className="group bg-white border-none shadow-sm hover:shadow-xl transition-all rounded-[2.5rem] overflow-hidden border-b-4 border-transparent hover:border-primary h-full flex flex-col">
                <CardBody className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary/5 transition-colors">
                      {getIcon(resource.category)}
                    </div>
                    <button 
                      onClick={() => handleDelete(resource.id, resource.file_url)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{resource.subject}</span>
                      <span className="text-[9px] font-black bg-blue-50 text-blue-500 px-3 py-1 rounded-full uppercase tracking-widest">{resource.category}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-primary transition-colors">{resource.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{resource.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-400">{new Date(resource.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{resource.target_class}</span>
                      {resource.file_url && (
                        <a 
                          href={resource.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-slate-900 text-white p-2 rounded-xl hover:bg-primary transition-colors shadow-lg"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Resource Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-950 p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">Distribute Resource</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Populate student dashboards instantly</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="e.g. DFS vs BFS Deep Dive"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="e.g. Data Structures"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option>Study Material</option>
                      <option>Notes</option>
                      <option>Assignment</option>
                      <option>Resource</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Class</label>
                    <input 
                      type="text" 
                      required
                      value={formData.target_class}
                      onChange={(e) => setFormData({...formData, target_class: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="Briefly describe what this resource covers..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Attachment</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all ${
                      selectedFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="text-emerald-500 mb-2" size={32} />
                        <p className="text-sm font-black text-slate-900">{selectedFile.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Ready to upload</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="text-slate-300 mb-2" size={32} />
                        <p className="text-sm font-bold text-slate-500">Drag & drop or <span className="text-primary underline">browse files</span></p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, DOCX, PPT, IMAGES (MAX 50MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <AlertCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Instant Student Synchronization Active</span>
                  </div>
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] disabled:opacity-50"
                  >
                    {isUploading ? 'Distributing...' : 'Upload & Notify Students'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
