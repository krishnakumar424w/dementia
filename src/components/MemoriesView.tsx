import React, { useState, useEffect } from 'react';
import { MemoryItem, Role } from '../types';
import { api } from '../services/api';
import { 
  Camera, Volume2, Sparkles, Plus,
  MapPin, Calendar, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MemoriesViewProps {
  patientId: string;
  userRole: Role;
  patientName: string;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  patientId,
  userRole,
  patientName,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [activeAudioPrompt, setActiveAudioPrompt] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [year, setYear] = useState<string>('1984');
  const [location, setLocation] = useState<string>('Cornwall Coast');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80');
  const [audioPrompt, setAudioPrompt] = useState<string>('');

  const loadMemories = async () => {
    try {
      setLoading(true);
      const res = await api.getMemories(patientId);
      setMemories(res.memories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [patientId]);

  const handlePlayAudioPrompt = (promptText: string, id: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    setActiveAudioPrompt(id);
    const utterance = new SpeechSynthesisUtterance(promptText);
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    utterance.onend = () => setActiveAudioPrompt(null);
    utterance.onerror = () => setActiveAudioPrompt(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await api.createMemory({
        patientId,
        title: title.trim(),
        description: description.trim(),
        year: year ? parseInt(year) : undefined,
        location: location.trim(),
        imageUrl: imageUrl.trim(),
        audioPrompt: audioPrompt.trim() || `Remember this special memory of ${title}?`,
        uploadedBy: 'Eleanor Pendelton (Daughter)',
      });

      if (res.memory) {
        setMemories(prev => [res.memory, ...prev]);
        setIsAdding(false);
        setTitle('');
        setDescription('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">Reminiscence Memory Album // Autobiographical Anchors</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">RECORDS: {memories.length}</span>
        </div>

        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Autobiographical Photo & Audio Story Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evocative photographic memories and guided audio stories for {patientName}
            </p>
          </div>

          {(userRole === 'family' || userRole === 'nurse' || userRole === 'admin') && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Memory Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateMemory}
            className="hd-card shadow-2xs p-4 bg-white space-y-3"
          >
            <div className="hd-card-title flex items-center space-x-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Autobiographical Memory & Audio Story</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Holiday in Cornwall with Clara"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs font-mono focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 1984"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. St Ives, Cornwall"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Narrative Story</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the moment, who was there, and special details..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Audio Cue Prompt (Spoken by Aria AI)</label>
                <input
                  type="text"
                  value={audioPrompt}
                  onChange={(e) => setAudioPrompt(e.target.value)}
                  placeholder="e.g. Arthur, look at this peaceful sea breeze. Do you recall how Clara loved the cafe?"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-xs shadow-xs hover:bg-blue-700"
              >
                Save Record
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {memories.map((memory) => {
          const isPlaying = activeAudioPrompt === memory.id;

          return (
            <div
              key={memory.id}
              className="hd-card shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Frame */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={memory.imageUrl}
                    alt={memory.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  
                  {memory.year && (
                    <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border border-white/20">
                      {memory.year}
                    </span>
                  )}

                  {memory.location && (
                    <span className="absolute bottom-2 left-2 bg-white/95 text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs flex items-center space-x-1 border border-slate-200 shadow-2xs">
                      <MapPin className="w-2.5 h-2.5 text-rose-600" />
                      <span>{memory.location}</span>
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    {memory.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {memory.description}
                  </p>
                </div>
              </div>

              {/* Audio Prompt Row */}
              {memory.audioPrompt && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-blue-800 italic truncate">
                    "{memory.audioPrompt}"
                  </span>

                  <button
                    onClick={() => handlePlayAudioPrompt(memory.audioPrompt!, memory.id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-xs text-[10px] font-mono font-bold uppercase shrink-0 transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isPlaying ? 'Speaking' : 'Play'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
