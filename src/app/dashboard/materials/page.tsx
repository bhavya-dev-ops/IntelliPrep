"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadFile, getUserFiles, deleteFile, FileMetadata } from '@/lib/storage';
import { Card, CardBody } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { logActivity } from '@/lib/activity';

export default function MaterialsFilesPage() {
  const { user, refreshUserData } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [studyStartTime, setStudyStartTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  // Timer logic when a file is opened
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedFile && user) {
      setStudyStartTime(Date.now());
      logActivity(user.id, 'material');
    } else if (studyStartTime && user) {
      // Calculate total seconds spent
      const secondsSpent = Math.floor((Date.now() - studyStartTime) / 1000);
      updateStudyTime(user.id, secondsSpent);
      setStudyStartTime(null);
    }
    return () => clearInterval(interval);
  }, [selectedFile]);

  async function updateStudyTime(userId: string, seconds: number) {
    if (seconds < 5) return; // Don't track if less than 5 seconds
    const { data: currentUser } = await supabase.from('users').select('study_time_seconds').eq('id', userId).single();
    const newTotal = (Number(currentUser?.study_time_seconds) || 0) + seconds;
    await supabase.from('users').update({ study_time_seconds: newTotal }).eq('id', userId);
    refreshUserData();
  }

  async function fetchFiles() {
    if (!user) return;
    const data = await getUserFiles(user.id);
    setFiles(data);
    setLoading(false);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (10MB)
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
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await deleteFile(id, url);
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('officedocument')) return '📝';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
    return '📁';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your materials...</div>;

  return (
    <div className="space-y-8 relative">
      {/* File Viewer Overlay */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white bg-gray-900">
            <h2 className="font-bold truncate max-w-md">{selectedFile.file_name}</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs text-blue-400 font-mono animate-pulse">● TRACKING STUDY TIME</span>
              <button 
                onClick={() => setSelectedFile(null)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full">
            {selectedFile.file_type.includes('pdf') ? (
              <iframe 
                src={`${selectedFile.file_url}#toolbar=0`} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            ) : selectedFile.file_type.includes('image') ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img src={selectedFile.file_url} alt="Full view" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
                <p>This file type cannot be previewed. Please download it to study.</p>
                <a href={selectedFile.file_url} className="bg-primary px-8 py-3 rounded-lg font-bold">Download File</a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-500 mt-1">Upload and manage your study documents securely.</p>
        </div>
        
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition-all shadow-md active:scale-95 disabled:bg-gray-400 flex items-center gap-2"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Material
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.length === 0 ? (
          <div className="lg:col-span-4 py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-400">No materials uploaded yet. Start by uploading a PDF or Image!</p>
          </div>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="group hover:border-primary/20 transition-all bg-white overflow-hidden">
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="text-3xl p-3 bg-gray-50 rounded-xl mb-4 group-hover:bg-blue-50 transition-colors">
                    {getFileIcon(file.file_type)}
                  </div>
                  <button 
                    onClick={() => handleDelete(file.id, file.file_url)}
                    className="text-gray-300 hover:text-red-500 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 min-h-[40px] mb-2" title={file.file_name}>
                  {file.file_name}
                </h3>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => setSelectedFile(file)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Open File
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
