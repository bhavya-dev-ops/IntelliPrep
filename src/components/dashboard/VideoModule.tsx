import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { AlertCircle, CheckCircle2, Play, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TECHNICAL_KEYWORDS = [
  'data structures', 'algorithms', 'coding', 'tutorial', 'programming', 
  'web development', 'interview prep', 'system design', 'javascript', 
  'java', 'python', 'react', 'database', 'striver', 'love babbar', 'freecodecamp',
  'backend', 'frontend', 'fullstack', 'machine learning', 'devops',
  'linked list', 'dsa', 'interview', 'tutorial'
];

const VERIFIED_EDUCATORS = [
  'striver', 'takeuforward', 'loverbabbar', 'codewithharry', 'freecodecamp', 
  'hiteshchoudhary', 'hitesh choudhary', 'akshat saini', 'codehelp', 'apna college', 
  'traversy media', 'fireship', 'web dev simplified'
];

const EXPLICITLY_ALLOWED_IDS = ['yVdKa8dnKiE'];

interface VideoPreview {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  author_name?: string;
  isVerified?: boolean;
}

interface VideoModuleProps {
  onValidatedAdd: (video: VideoPreview) => void;
}

export const VideoModule: React.FC<VideoModuleProps> = ({ onValidatedAdd }) => {
  const [url, setUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [preview, setPreview] = useState<VideoPreview | null>(null);

  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const validateEducationalContent = (url: string, videoTitle: string, authorName: string = '', videoId: string = '') => {
    if (EXPLICITLY_ALLOWED_IDS.includes(videoId)) return true;

    const combinedText = `${url} ${videoTitle} ${authorName}`.toLowerCase();
    
    // Check for verified educators first
    const isVerified = VERIFIED_EDUCATORS.some(educator => 
      combinedText.includes(educator.toLowerCase())
    );
    
    if (isVerified) return true;

    // Check for keywords
    return TECHNICAL_KEYWORDS.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
  };

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsValidating(true);
    setError(null);
    setPreview(null);

    const videoId = getYouTubeId(url);
    if (!videoId) {
      setError("Invalid YouTube URL format.");
      setIsValidating(false);
      return;
    }

    try {
      // Fetch metadata from YouTube OEmbed
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!response.ok) throw new Error("Could not fetch video metadata.");
      
      const data = await response.json();
      const fetchedTitle = data.title;
      const authorName = data.author_name;

      const isEducational = validateEducationalContent(url, fetchedTitle, authorName, videoId);

      if (!isEducational) {
        setError("Content Restricted: IntelliPrep only allows technical and educational videos to ensure focus-driven learning.");
        setUrl(''); // Clear input on failure as requested
        setIsValidating(false);
        return;
      }

      // Check if it's from a verified educator for UI purposes
      const isVerified = VERIFIED_EDUCATORS.some(educator => 
        authorName.toLowerCase().includes(educator.toLowerCase()) || 
        fetchedTitle.toLowerCase().includes(educator.toLowerCase())
      ) || EXPLICITLY_ALLOWED_IDS.includes(videoId);

      // Success logic
      const videoPreview: VideoPreview = {
        id: videoId,
        title: fetchedTitle,
        author_name: authorName,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        url: url,
        isVerified: isVerified
      };

      setPreview(videoPreview);
      setIsValidating(false);
    } catch (err) {
      console.error(err);
      // Fallback if API fails: validate based on user input
      const isEducational = validateEducationalContent(url, title, '', videoId);
      if (!isEducational) {
        setError("Could not verify content. Please ensure it's an educational video.");
        setIsValidating(false);
        return;
      }
      
      setPreview({
        id: videoId,
        title: title || "Educational Content",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        url: url,
        isVerified: false
      });
      setIsValidating(false);
    }
  };

  const handleConfirm = () => {
    if (preview && onValidatedAdd) {
      onValidatedAdd(preview);
      setPreview(null);
      setUrl('');
      setTitle('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-md">
        <CardBody className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Educational Video Firewall</h2>
              <p className="text-slate-500 text-sm font-medium">Add technical content to your study library</p>
            </div>
          </div>

          <form onSubmit={handleValidation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Title</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., React Hooks Explained"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isValidating || !url}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Validate & Add Content</>
              )}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error-alert"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 shadow-sm"
              >
                <div className="p-1.5 bg-red-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-red-900 font-bold text-sm">Validation Failed</h4>
                  <p className="text-red-600 text-xs mt-0.5 leading-relaxed font-medium">
                    {error}
                  </p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {preview && (
              <motion.div
                key="video-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 overflow-hidden rounded-2xl border border-slate-100 shadow-xl bg-white"
              >
                <div className="aspect-video relative group">
                  <img src={preview.thumbnail} alt={preview.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white">
                      <Play className="w-8 h-8 fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <CheckCircle2 className="w-3 h-3" />
                      Content Verified
                    </span>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{preview.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-slate-500 text-xs font-medium">{preview.author_name || "Unknown Creator"}</p>
                      {preview.isVerified && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified Educator
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleConfirm}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 whitespace-nowrap"
                  >
                    Confirm & Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardBody>
      </Card>
      
      <div className="flex items-center justify-center gap-6 py-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Educators</span>
        <div className="h-px w-12 bg-slate-200" />
        <span className="text-[11px] font-bold text-slate-600">Striver</span>
        <span className="text-[11px] font-bold text-slate-600">Love Babbar</span>
        <span className="text-[11px] font-bold text-slate-600">CodeWithHarry</span>
        <span className="text-[11px] font-bold text-slate-600">freeCodeCamp</span>
        <span className="text-[11px] font-bold text-slate-600">Hitesh Choudhary</span>
      </div>
    </div>
  );
};
