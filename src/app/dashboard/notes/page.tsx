"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { logActivity } from '@/lib/activity';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface TeacherNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  teacher_name: string;
}

export default function NotesPage() {
  const { user } = useAuth();
  const [personalNotes, setPersonalNotes] = useState<Note[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const storageKey = user ? `${user.id}_notes` : null;

  useEffect(() => {
    if (!user) return;

    // Load Personal Notes from localStorage
    const saved = localStorage.getItem(storageKey!);
    if (saved) {
      setPersonalNotes(JSON.parse(saved));
    }

    // Load Teacher Notes from Supabase
    async function fetchTeacherNotes() {
      const { data, error } = await supabase
        .from('teacher_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTeacherNotes(data);
      }
      setLoading(false);
    }

    fetchTeacherNotes();
  }, [user, storageKey]);

  const saveNotes = (notes: Note[]) => {
    setPersonalNotes(notes);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: crypto.randomUUID(),
      title: newNote.title,
      content: newNote.content,
      created_at: new Date().toISOString(),
    };

    saveNotes([note, ...personalNotes]);
    if (user) logActivity(user.id, 'note');
    setNewNote({ title: '', content: '' });
    setShowForm(false);
  };

  const deleteNote = (id: string) => {
    saveNotes(personalNotes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Notes</h1>
          <p className="text-gray-500 mt-1">Organize your thoughts and review teacher materials.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition-all shadow-md active:scale-95"
        >
          {showForm ? 'Cancel' : '+ New Note'}
        </button>
      </div>

      {showForm && (
        <Card className="bg-white border-primary/10 shadow-lg animate-in fade-in slide-in-from-top-4">
          <CardBody className="p-6">
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="e.g., Biology Chapter 1 Summary"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
                <textarea 
                  rows={4}
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Type your notes here..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="submit"
                  className="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-900"
                >
                  Save Note
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Personal Notes Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <div className="w-2 h-6 bg-secondary rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Personal Notes</h2>
          </div>
          
          <div className="space-y-4">
            {personalNotes.length === 0 ? (
              <p className="text-gray-400 italic py-4">No personal notes yet. Click "+ New Note" to start.</p>
            ) : (
              personalNotes.map(note => (
                <Card key={note.id} className="bg-white hover:border-primary/20 transition-colors">
                  <CardBody className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{note.title}</h3>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-4 text-xs text-gray-400">
                      Created: {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Teacher Notes Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Teacher Materials</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-100 rounded-xl"></div>
                <div className="h-32 bg-gray-100 rounded-xl"></div>
              </div>
            ) : teacherNotes.length === 0 ? (
              <p className="text-gray-400 italic py-4">No teacher notes available at this time.</p>
            ) : (
              teacherNotes.map(note => (
                <Card key={note.id} className="bg-blue-50/50 border-blue-100 shadow-none">
                  <CardBody className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Official</span>
                      <h3 className="font-bold text-lg text-gray-900">{note.title}</h3>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">From: {note.teacher_name}</span>
                      <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
