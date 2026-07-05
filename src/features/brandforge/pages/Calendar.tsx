import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Image as ImageIcon,
  Video,
  Hash,
  Sparkles,
  Check,
  X,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

import { useApp } from '../context/AppContext';
import { Platform, ScheduledPost } from '../types';

export const CalendarPage: React.FC = () => {
  const { addToast, connections, scheduledPosts, schedulePost, updateScheduledPost, deleteScheduledPost, currentIdentity, connectPlatform } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showComposer, setShowComposer] = useState(false);

  // Composer Form States
  const [content, setContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [activeDetailPost, setActiveDetailPost] = useState<ScheduledPost | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Media & AI Content States
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [mediaRefs, setMediaRefs] = useState<string[]>([]);
  
  // AI Image generator states
  const [showAiImageGenerator, setShowAiImageGenerator] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // AI content optimization states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [bestTimeSuggestion, setBestTimeSuggestion] = useState('Today @ 4:30 PM');
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([
    "Keep spacing clean and use paragraphs to structure readability.",
    "Add hashtags appropriately to increase trending discovery.",
    "Target active posting windows to maximize initial engagements."
  ]);

  useEffect(() => {
    if (showComposer) {
      const activePlatforms = connections
        .filter(c => c.identityId === currentIdentity?.id && c.status === 'active' && c.accountDisplayName)
        .map(c => c.platform as Platform);
      
      const supported = ['X', 'Instagram', 'LinkedIn', 'Facebook'].filter(p => 
        activePlatforms.includes(p as Platform)
      ) as Platform[];

      setSelectedPlatforms(supported);
    }
  }, [showComposer, connections]);

  const resizeBase64Image = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          const compressed = await resizeBase64Image(reader.result);
          if (compressed.length > 800000) {
            addToast(`Image ${file.name} is still too large after compression.`, 'info');
          } else {
            setMediaRefs(prev => [...prev, compressed]);
            addToast(`Attached image: ${file.name}`, 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // For videos, we cannot easily compress them in the browser without WebCodecs/FFmpeg
    // We will just store a placeholder URL or reject if it's too large.
    // Since this is a prototype, we'll check size to prevent Firestore crashes.
    if (file.size > 700000) {
      addToast(`Video ${file.name} is too large (max 700KB for Firestore). Please use Firebase Storage for large files.`, 'info');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setMediaRefs(prev => [...prev, reader.result as string]);
        addToast(`Attached video: ${file.name}`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiImage = async () => {
    if (!aiImagePrompt.trim()) {
      addToast('Please enter a concept prompt for the AI image.', 'info');
      return;
    }
    setIsGeneratingImage(true);
    addToast('Gemini is sketching your custom brand asset...', 'info');
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiImagePrompt })
      });
      const data = await response.json();
      if (data.imageUrl) {
        let finalUrl = data.imageUrl;
        if (finalUrl.startsWith('data:image')) {
            finalUrl = await resizeBase64Image(finalUrl);
        }
        if (finalUrl.length > 800000) {
           addToast('Generated image is too large for Firestore.', 'info');
        } else {
           setMediaRefs(prev => [...prev, finalUrl]);
           addToast('AI Image generated successfully and added to post!', 'success');
           setAiImagePrompt('');
           setShowAiImageGenerator(false);
        }
      } else {
        addToast('Could not generate graphic, using fallbacks', 'info');
      }
    } catch (err) {
      console.error(err);
      addToast('AI image creation failed', 'info');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleOptimizeContent = async () => {
    if (!content.trim()) {
      addToast('Write draft content first to optimize.', 'info');
      return;
    }
    setIsOptimizing(true);
    addToast('Applying Gemini post copy optimization...', 'info');
    try {
      const response = await fetch('/api/ai/optimize-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          brandIdentity: currentIdentity
        })
      });
      const data = await response.json();
      if (data.optimizedContent) {
        setContent(data.optimizedContent);
        if (data.suggestions) {
          setOptimizationSuggestions(data.suggestions);
        }
        if (data.bestTime) {
          setBestTimeSuggestion(data.bestTime);
          
          const timeMatch = data.bestTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let hour = parseInt(timeMatch[1]);
            const minute = timeMatch[2];
            const ampm = timeMatch[3].toUpperCase();
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            const formattedHour = hour.toString().padStart(2, '0');
            setScheduleTime(`${formattedHour}:${minute}`);
          }
        }
        addToast('Copy updated with Gemini smart optimization!', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Post optimization failed', 'info');
    } finally {
      setIsOptimizing(false);
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setMediaRefs(prev => prev.filter((_, index) => index !== indexToRemove));
    addToast('Media removed from post', 'info');
  };

  const handleSchedulePostSubmit = async () => {
    if (!content.trim()) {
      addToast('Please enter post content.', 'info');
      return;
    }
    if (selectedPlatforms.length === 0) {
      addToast('Please select at least one target platform.', 'info');
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      addToast('Please specify date and time to schedule.', 'info');
      return;
    }

    const localDateObj = new Date(`${scheduleDate}T${scheduleTime}`);
    const scheduledAt = localDateObj.toISOString();
    
    if (editingPostId) {
      await updateScheduledPost(editingPostId, {
        content,
        platformTargets: selectedPlatforms,
        scheduledAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        mediaRefs: mediaRefs
      });
    } else {
      await schedulePost({
        content,
        platformTargets: selectedPlatforms,
        scheduledAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        mediaRefs: mediaRefs
      });
    }

    // Reset form
    setContent('');
    setSelectedPlatforms([]);
    setMediaRefs([]);
    setShowComposer(false);
    setEditingPostId(null);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Calendar</h1>
          <p className="text-slate-500 text-sm">Plan, schedule, and approve posts across all channels.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-50 rounded-md transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-4 text-sm font-bold text-slate-700 min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-50 rounded-md transition-all"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <button 
            onClick={() => {
              setEditingPostId(null);
              setContent('');
              setMediaRefs([]);
              setScheduleDate(format(new Date(), 'yyyy-MM-dd'));
              setScheduleTime('12:00');
              setSelectedPlatforms([]);
              setShowComposer(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-slate-100">
          {days.map((day, i) => (
            <div 
              key={i} 
              onClick={() => {
                setEditingPostId(null);
                setContent('');
                setMediaRefs([]);
                setScheduleDate(format(day, 'yyyy-MM-dd'));
                setScheduleTime('12:00');
                setSelectedPlatforms([]);
                setShowComposer(true);
              }}
              className={cn(
                "min-h-[120px] p-2 transition-all hover:bg-slate-50/50 cursor-pointer group",
                !isSameMonth(day, currentDate) ? "bg-slate-50/30 opacity-40" : ""
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                  isSameDay(day, new Date()) ? "bg-blue-600 text-white" : "text-slate-500"
                )}>
                  {format(day, 'd')}
                </span>
                <Plus className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              {/* Real Scheduled Posts */}
              {(() => {
                const dayPosts = scheduledPosts.filter(post => {
                  try {
                    const postDateStr = format(new Date(post.scheduledAt), 'yyyy-MM-dd');
                    const dayDateStr = format(day, 'yyyy-MM-dd');
                    return postDateStr === dayDateStr;
                  } catch (e) {
                    return isSameDay(new Date(post.scheduledAt), day);
                  }
                });
                return dayPosts.map((post) => {
                  const isPastPost = new Date(post.scheduledAt) < new Date();
                  
                  return (
                    <div 
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDetailPost(post);
                      }}
                      className={cn(
                        "rounded p-1.5 mb-1 cursor-pointer transition-all text-left border",
                        isPastPost 
                          ? "bg-slate-50 border-slate-200 hover:bg-slate-100" 
                          : "bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200"
                      )}
                    >
                      <p className={cn("text-[10px] font-bold truncate", isPastPost ? "text-slate-500" : "text-blue-700")}>{post.content}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {post.platformTargets.map(platform => (
                          <div key={platform} className="flex items-center space-x-1 shrink-0">
                            <div className={cn("w-1 h-1 rounded-full", post.status === 'published' ? "bg-green-500" : post.status === 'failed' ? "bg-red-500" : isPastPost ? "bg-slate-400" : "bg-blue-500")} />
                            <span className={cn("text-[8px] font-bold uppercase", post.status === 'published' ? "text-green-600" : post.status === 'failed' ? "text-red-600" : isPastPost ? "text-slate-400" : "text-blue-500")}>{platform}</span>
                          </div>
                        ))}
                        {post.status === 'published' && <span className="text-[8px] font-bold text-green-600 ml-auto flex items-center"><Check className="w-2.5 h-2.5 mr-0.5"/></span>}
                        {post.status === 'failed' && <span className="text-[8px] font-bold text-red-600 ml-auto flex items-center"><X className="w-2.5 h-2.5 mr-0.5"/></span>}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Composer Modal Overlay */}
      {showComposer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{editingPostId ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={() => { setShowComposer(false); setEditingPostId(null); setContent(''); setMediaRefs([]); }} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex space-x-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Content</label>
                  <textarea 
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Schedule Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Schedule Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="time" 
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center flex-wrap gap-3">
                    <button 
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Add Image</span>
                    </button>
                    <button 
                      onClick={() => setShowAiImageGenerator(!showAiImageGenerator)}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border",
                        showAiImageGenerator 
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                      )}
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>AI Brand Graphic</span>
                    </button>
                    <button 
                      onClick={() => videoInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>Add Video</span>
                    </button>
                  </div>

                  {/* Hidden inputs for uploads */}
                  <input 
                    type="file" 
                    ref={imageInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                  />
                  <input 
                    type="file" 
                    ref={videoInputRef} 
                    onChange={handleVideoUpload} 
                    accept="video/*" 
                    className="hidden" 
                  />

                  {/* AI Brand Graphic Input Area */}
                  {showAiImageGenerator && (
                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                          Gemini Image Generator
                        </label>
                        <button 
                          onClick={() => setShowAiImageGenerator(false)} 
                          className="text-purple-400 hover:text-purple-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-purple-600">Type what you want to create (e.g. "Abstract modern business background with warm blue light and minimalist geometric lines")</p>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          placeholder="Describe the desired brand asset..." 
                          value={aiImagePrompt}
                          onChange={(e) => setAiImagePrompt(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          disabled={isGeneratingImage}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleGenerateAiImage();
                            }
                          }}
                        />
                        <button 
                          onClick={handleGenerateAiImage}
                          disabled={isGeneratingImage}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center shrink-0"
                        >
                          {isGeneratingImage ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                              Generating...
                            </>
                          ) : 'Generate'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Attached Media Previews */}
                  {mediaRefs.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Attached Media ({mediaRefs.length})</label>
                      <div className="flex flex-wrap gap-3">
                        {mediaRefs.map((ref, idx) => {
                          const isVideo = ref.startsWith('data:video/') || ref.includes('video') || ref.endsWith('.mp4');
                          return (
                            <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                              {isVideo ? (
                                <video src={ref} className="w-full h-full object-cover" />
                              ) : (
                                <img src={ref} alt="Attached media" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              )}
                              <button 
                                onClick={() => removeMedia(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-slate-900/70 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-80 space-y-6">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest flex items-center mb-3">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                    AI Optimization
                  </h3>
                  <div className="space-y-3.5">
                    <div className="p-3 bg-white rounded-lg border border-blue-200/60">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Best Time to Post</p>
                      <p className="text-sm font-bold text-blue-900">{bestTimeSuggestion}</p>
                      <p className="text-[10px] text-blue-600 mt-1">Based on peak engagement and targeted networks.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Active Suggestions</p>
                      <div className="space-y-1.5">
                        {optimizationSuggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-start text-[11px] text-slate-600">
                            <Check className="w-3.5 h-3.5 text-blue-500 mr-1.5 shrink-0 mt-0.5" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleOptimizeContent}
                      disabled={isOptimizing}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center shadow-md shadow-blue-500/10 disabled:opacity-50"
                    >
                      {isOptimizing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                          Apply AI Suggestions
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Platforms</label>
                  <div className="space-y-2">
                    {['X', 'Instagram', 'LinkedIn', 'Facebook'].map(p => {
                      const conn = connections.find(c => c.identityId === currentIdentity?.id && c.platform.toLowerCase() === p.toLowerCase());
                      const isConnected = conn && conn.status === 'active' && conn.accountDisplayName;

                      const isSelected = selectedPlatforms.includes(p as Platform);

                      return (
                        <div 
                          key={p} 
                          onClick={() => {
                            if (!isConnected) {
                              addToast(`Establishing simulated connection for ${p} to enable scheduling...`, 'success');
                              connectPlatform(p as Platform, '@brandforge_demo');
                            }
                            setSelectedPlatforms(prev => 
                              prev.includes(p as Platform)
                                ? prev.filter(x => x !== p)
                                : [...prev, p as Platform]
                            );
                          }}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-lg transition-all cursor-pointer",
                            isSelected
                              ? "bg-blue-50/80 border-blue-400 hover:bg-blue-100 ring-2 ring-blue-500/10"
                              : isConnected 
                                ? "bg-slate-50 border-slate-200 hover:bg-slate-100" 
                                : "bg-slate-100/50 border-slate-200/60 hover:bg-slate-100 opacity-80"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">{p}</span>
                            {isConnected ? (
                              <span className="text-[10px] text-green-600 font-medium">{conn.accountDisplayName}</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">Click to instantly connect</span>
                            )}
                          </div>
                          <input 
                            type="checkbox" 
                            checked={selectedPlatforms.includes(p as Platform)}
                            readOnly
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-4">
              <button onClick={() => { setShowComposer(false); setEditingPostId(null); setContent(''); setMediaRefs([]); }} className="px-6 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-all">
                Cancel
              </button>
              <button 
                onClick={handleSchedulePostSubmit}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                {editingPostId ? 'Update Post' : 'Schedule Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Detail Post Modal */}
      {activeDetailPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Scheduled Post Details</h2>
              <button onClick={() => setActiveDetailPost(null)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Content</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-250 whitespace-pre-wrap">{activeDetailPost.content}</p>
              </div>

              {activeDetailPost.mediaRefs && activeDetailPost.mediaRefs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Attached Media ({activeDetailPost.mediaRefs.length})</p>
                  <div className="grid grid-cols-2 gap-3">
                    {activeDetailPost.mediaRefs.map((ref, idx) => {
                      const isVideo = ref.startsWith('data:video/') || ref.includes('video') || ref.endsWith('.mp4');
                      return (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                          {isVideo ? (
                            <video src={ref} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={ref} alt="Attached Media" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled Date</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {format(new Date(activeDetailPost.scheduledAt), 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {format(new Date(activeDetailPost.scheduledAt), 'p')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    activeDetailPost.status === 'published' ? "bg-green-100 text-green-700" :
                    activeDetailPost.status === 'failed' ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {activeDetailPost.status.charAt(0).toUpperCase() + activeDetailPost.status.slice(1)}
                  </div>
                  {activeDetailPost.status === 'failed' && (
                    <p className="text-xs text-slate-500">{activeDetailPost.publishResult || 'Post failed to publish. Check your connections.'}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Platforms</p>
                <div className="flex gap-2">
                  {activeDetailPost.platformTargets.map(p => (
                    <span key={p} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold uppercase">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button 
                onClick={async () => {
                  await deleteScheduledPost(activeDetailPost.id);
                  setActiveDetailPost(null);
                }} 
                className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all"
              >
                Cancel Schedule
              </button>
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    setEditingPostId(activeDetailPost.id);
                    setContent(activeDetailPost.content);
                    const postDate = new Date(activeDetailPost.scheduledAt);
                    setScheduleDate(format(postDate, 'yyyy-MM-dd'));
                    setScheduleTime(format(postDate, 'HH:mm'));
                    setSelectedPlatforms(activeDetailPost.platformTargets);
                    setMediaRefs(activeDetailPost.mediaRefs || []);
                    setActiveDetailPost(null);
                    setShowComposer(true);
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xs hover:bg-blue-100 rounded-lg transition-all"
                >
                  Edit Post
                </button>
                <button onClick={() => setActiveDetailPost(null)} className="px-6 py-2 bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 rounded-lg transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
