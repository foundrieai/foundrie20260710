import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Wand2, 
  Check, 
  AlertTriangle,
  MessageSquare,
  Type,
  Smile,
  ShieldCheck,
  X,
  Globe,
  FileText,
  Sparkles,
  Save,
  Trash2,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from '../motion-shim';

export const BrandGuidesPage: React.FC = () => {
  const { addToast, currentIdentity, identities, setCurrentIdentity, addIdentity } = useApp();
  const [activeTab, setActiveTab] = useState('voice');
  
  // Guided Profile States
  const [personaTraits, setPersonaTraits] = useState<string[]>([]);
  const [toneSliders, setToneSliders] = useState<Record<string, number>>({
    'Formal vs Casual': 50,
    'Serious vs Playful': 50,
    'Concise vs Detailed': 50
  });
  const [emojiRules, setEmojiRules] = useState('Sparse (Max 1 per post)');
  const [hashtagRules, setHashtagRules] = useState('Niche & Targeted');
  const [styleGuide, setStyleGuide] = useState('');
  const [forbiddenTopics, setForbiddenTopics] = useState<string[]>([]);

  // AI Voice Discovery states
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [discoveryType, setDiscoveryType] = useState<'url' | 'text'>('url');
  const [discoveryUrl, setDiscoveryUrl] = useState('');
  const [discoveryText, setDiscoveryText] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);

  // New Identity profile modal state
  const [isNewIdentityOpen, setIsNewIdentityOpen] = useState(false);
  const [newIdentityName, setNewIdentityName] = useState('');
  const [newIdentityDesc, setNewIdentityDesc] = useState('');
  const [isCreatingIdentity, setIsCreatingIdentity] = useState(false);

  // Excluded topic temporary state
  const [newTopic, setNewTopic] = useState('');
  
  const [missionStatement, setMissionStatement] = useState('');
  const [primaryVoice, setPrimaryVoice] = useState('');

  // Handle switching profiles & loading initial state
  useEffect(() => {
    if (!currentIdentity) return;
    
    // Check local storage first
    const saved = localStorage.getItem(`brand_guide_${currentIdentity.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPersonaTraits(parsed.personaTraits || []);
        setToneSliders(parsed.toneSliders || {
          'Formal vs Casual': 50,
          'Serious vs Playful': 50,
          'Concise vs Detailed': 50
        });
        setEmojiRules(parsed.emojiRules || 'Sparse (Max 1 per post)');
        setHashtagRules(parsed.hashtagRules || 'Niche & Targeted');
        setStyleGuide(parsed.styleGuide || '');
        setForbiddenTopics(parsed.forbiddenTopics || []);
        return;
      } catch (e) {}
    }

    // Default fallbacks based on identityId
    if (currentIdentity.id === 'demo-brand-identity-id') {
      setPersonaTraits(['Professional', 'Helpful', 'Innovative', 'Empathetic']);
      setToneSliders({
        'Formal vs Casual': 30,
        'Serious vs Playful': 70,
        'Concise vs Detailed': 20,
      });
      setEmojiRules('Moderate (2-3 per post)');
      setHashtagRules('Niche & Targeted');
      setStyleGuide('Always use Oxford commas. Never use exclamation points in executive replies. Keep spacing clean, use bullet points, and always address the user directly.');
      setForbiddenTopics(['Competitor Pricing', 'Internal Roadmap', 'Legal Disputes', 'Medical Advice']);
    } else {
      // Clean baseline for new identities
      setPersonaTraits(['Professional', 'Helpful']);
      setToneSliders({
        'Formal vs Casual': 50,
        'Serious vs Playful': 50,
        'Concise vs Detailed': 50,
      });
      setEmojiRules('Sparse (Max 1 per post)');
      setHashtagRules('Niche & Targeted');
      setStyleGuide(`Official voice guide for ${currentIdentity.displayName}. Focus on being informative, encouraging, and welcoming.`);
      setForbiddenTopics(['Internal Roadmap', 'Competitor Pricing']);
    }
  }, [currentIdentity]);

  // Persist Voice guide values
  const handleSaveVoiceGuide = () => {
    if (!currentIdentity) {
      addToast('No active brand identity selected.', 'info');
      return;
    }

    const dataToSave = {
      personaTraits,
      toneSliders,
      emojiRules,
      hashtagRules,
      styleGuide,
      forbiddenTopics
    };

    localStorage.setItem(`brand_guide_${currentIdentity.id}`, JSON.stringify(dataToSave));
    addToast(`Successfully saved voice guidelines for "${currentIdentity.displayName}"!`, 'success');
  };

  // AI Voice Discovery triggers
  const handleVoiceDiscovery = async () => {
    if (discoveryType === 'url' && !discoveryUrl.trim()) {
      addToast('Please enter a website URL.', 'info');
      return;
    }
    if (discoveryType === 'text' && !discoveryText.trim()) {
      addToast('Please enter some brand copywriting sample text.', 'info');
      return;
    }

    setIsDiscovering(true);
    addToast('Analyzing brand resources to discover unique voice profile...', 'info');

    try {
      const response = await fetch('/api/ai/discover-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: discoveryType === 'url' ? discoveryUrl : undefined,
          sampleText: discoveryType === 'text' ? discoveryText : undefined
        })
      });
      
      const data = await response.json();
      
      if (data) {
        // Pre-fill states
        setPersonaTraits(data.personaTraits || []);
        setToneSliders(data.toneSliders || {
          'Formal vs Casual': 50,
          'Serious vs Playful': 50,
          'Concise vs Detailed': 50
        });
        setStyleGuide(data.styleGuide || '');
        setEmojiRules(data.emojiUsage || 'Sparse (Max 1 per post)');
        setHashtagRules(data.hashtagStrategy || 'Niche & Targeted');
        setForbiddenTopics(data.forbiddenTopics || []);

        addToast('Voice profile successfully discovered and applied below!', 'success');
        setIsDiscoveryOpen(false);
        setDiscoveryUrl('');
        setDiscoveryText('');
      }
    } catch (e) {
      console.error(e);
      addToast('AI voice discovery analysis failed', 'info');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Create brand guide profile
  const handleCreateNewIdentity = async () => {
    if (!newIdentityName.trim()) {
      addToast('Please provide an identity name.', 'info');
      return;
    }

    setIsCreatingIdentity(true);
    try {
      await addIdentity(newIdentityName, newIdentityDesc || 'Custom brand voice profile');
      addToast(`Created brand identity profile "${newIdentityName}"!`, 'success');
      
      setIsNewIdentityOpen(false);
      setNewIdentityName('');
      setNewIdentityDesc('');
    } catch (e) {
      console.error(e);
      addToast('Could not create brand identity profile', 'info');
    } finally {
      setIsCreatingIdentity(false);
    }
  };

  // Add / Remove excluded topics
  const handleAddTopic = () => {
    if (!newTopic.trim()) {
      addToast('Please enter a topic name.', 'info');
      return;
    }
    if (forbiddenTopics.includes(newTopic.trim())) {
      addToast('This topic is already excluded.', 'info');
      return;
    }
    setForbiddenTopics(prev => [...prev, newTopic.trim()]);
    setNewTopic('');
    addToast('Excluded topic added', 'success');
  };

  const handleRemoveTopic = (topic: string) => {
    setForbiddenTopics(prev => prev.filter(t => t !== topic));
    addToast('Excluded topic removed', 'info');
  };

  const commonTraits = ['Professional', 'Witty', 'Empathetic', 'Authoritative', 'Innovative', 'Helpful', 'Bold', 'Friendly', 'Calm', 'Sassy'];
  
  const toggleTrait = (trait: string) => {
    if (personaTraits.includes(trait)) {
      setPersonaTraits(prev => prev.filter(t => t !== trait));
    } else {
      setPersonaTraits(prev => [...prev, trait]);
    }
  };

  const tabs = [
    { id: 'core', label: 'Core Identity' },
    { id: 'voice', label: 'Voice Spectrums' },
    { id: 'platform', label: 'Platform Rules' },
    { id: 'executive', label: 'Executive Personas' },
  ];

  return (
    <div className="h-full flex flex-col space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brand Strategy</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your brand's DNA for AI-native content generation.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSaveVoiceGuide}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Brand Selector Ribbon */}
      {currentIdentity && (
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-sm font-medium text-slate-700">
              Editing profile for: <span className="font-bold text-slate-900">{currentIdentity.displayName}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Switch Voice Profile:</span>
            <select
              value={currentIdentity.id}
              onChange={(e) => {
                const target = identities.find(id => id.id === e.target.value);
                if (target) {
                  setCurrentIdentity(target);
                }
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg py-1 px-3 font-semibold text-slate-700 focus:outline-none"
            >
              {identities.map((id) => (
                <option key={id.id} value={id.id}>{id.displayName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex space-x-2 border-b border-slate-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-semibold rounded-full border transition-all",
              activeTab === tab.id 
                ? "bg-white border-slate-200 text-slate-900 shadow-sm" 
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Primary Workspace */}
      <div className="flex-1 flex min-h-0">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-16">
          
          {/* CORE IDENTITY TAB */}
          {activeTab === 'core' && (
            <div className="max-w-4xl space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center text-slate-900 font-bold mb-4">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    Mission Statement
                  </div>
                  <textarea 
                    value={missionStatement}
                    onChange={(e) => setMissionStatement(e.target.value)}
                    className="w-full h-32 text-sm text-slate-700 bg-transparent resize-none focus:outline-none placeholder:text-slate-400"
                    placeholder="What is your core purpose?"
                  />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center text-slate-900 font-bold mb-4">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                    Primary Voice
                  </div>
                  <textarea 
                    value={primaryVoice}
                    onChange={(e) => setPrimaryVoice(e.target.value)}
                    className="w-full h-32 text-sm text-slate-700 bg-transparent resize-none focus:outline-none placeholder:text-slate-400"
                    placeholder="Describe your overall tone..."
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center text-slate-900 font-bold mb-4">
                  <ShieldCheck className="w-4 h-4 mr-2 text-red-500" />
                  Prohibited Content
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    placeholder="Add prohibited keyword..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
                  />
                  <button 
                    onClick={handleAddTopic}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {forbiddenTopics.map(topic => (
                    <span key={topic} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full flex items-center">
                      {topic}
                      <button onClick={() => handleRemoveTopic(topic)} className="ml-2 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EXECUTIVE PERSONAS TAB */}
          {activeTab === 'executive' && (
            <div className="max-w-4xl">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-bold text-slate-900">Executive Personas</h3>
                    <p className="text-sm text-slate-500 mt-1">Individual voice profiles for leadership content.</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold flex items-center hover:bg-slate-50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Persona
                  </button>
                </div>
                <div className="text-center py-12 text-sm text-slate-400 italic">
                  No executive personas defined.
                </div>
              </div>
            </div>
          )}
            
          {/* VOICE & PERSONA TAB */}
          {activeTab === 'voice' && (
              <div className="max-w-3xl space-y-10">
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Persona Traits</h3>
                    <span className="text-[10px] text-slate-400">Click to select or deselect traits</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {commonTraits.map(trait => {
                      const isActive = personaTraits.includes(trait);
                      return (
                        <button 
                          key={trait} 
                          onClick={() => toggleTrait(trait)}
                          className={cn(
                            "flex items-center justify-between p-3.5 border rounded-xl transition-all text-left",
                            isActive 
                              ? "bg-blue-50/50 border-blue-400 text-blue-700 font-bold shadow-sm" 
                              : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-700"
                          )}
                        >
                          <span className="text-xs">{trait}</span>
                          {isActive && (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Tone Sliders</h3>
                  <div className="space-y-8">
                    {[
                      { key: 'Formal vs Casual', left: 'Formal', right: 'Casual' },
                      { key: 'Serious vs Playful', left: 'Serious', right: 'Playful' },
                      { key: 'Concise vs Detailed', left: 'Concise', right: 'Detailed' },
                    ].map(slider => {
                      const currentValue = toneSliders[slider.key] ?? 50;
                      return (
                        <div key={slider.key}>
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter mb-3">
                            <span className={cn(currentValue < 40 ? "text-blue-600 font-black" : "")}>{slider.left} ({100 - currentValue}%)</span>
                            <span>{slider.key}</span>
                            <span className={cn(currentValue > 60 ? "text-blue-600 font-black" : "")}>{slider.right} ({currentValue}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full relative">
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              value={currentValue}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setToneSliders(prev => ({
                                  ...prev,
                                  [slider.key]: val
                                }));
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"
                              style={{ left: `calc(${currentValue}% - 8px)` }}
                            />
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${currentValue}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

          {/* PLATFORM RULES TAB */}
          {activeTab === 'platform' && (
            <div className="max-w-3xl space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Emoji Usage</label>
                  <select 
                    value={emojiRules}
                    onChange={(e) => setEmojiRules(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Sparse (Max 1 per post)">Sparse (Max 1 per post)</option>
                    <option value="Moderate (2-3 per post)">Moderate (2-3 per post)</option>
                    <option value="Frequent (Emoji-heavy)">Frequent (Emoji-heavy)</option>
                    <option value="None (Professional only)">None (Professional only)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Hashtag Strategy</label>
                  <select 
                    value={hashtagRules}
                    onChange={(e) => setHashtagRules(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Niche & Targeted">Niche & Targeted</option>
                    <option value="Broad & Trending">Broad & Trending</option>
                    <option value="Branded Only">Branded Only</option>
                    <option value="No Hashtags">No Hashtags</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Style Guide Notes & Rules</label>
                <textarea 
                  value={styleGuide}
                  onChange={(e) => setStyleGuide(e.target.value)}
                  rows={6}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-sans"
                  placeholder="e.g. Always use Oxford commas. Never use exclamation points in executive replies. Keep descriptions helpful..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: AI VOICE DISCOVERY OVERLAY */}
      <AnimatePresence>
        {isDiscoveryOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                  <h2 className="text-lg font-bold text-slate-900">AI Voice Discovery Engine</h2>
                </div>
                <button 
                  onClick={() => setIsDiscoveryOpen(false)} 
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Analyzing existing company branding material enables Gemini to instantly craft a compliant, custom voice guide with matched tone profiles.
                  </p>
                </div>

                {/* Tabs to select Url vs Text */}
                <div className="flex border-b border-slate-100">
                  <button 
                    onClick={() => setDiscoveryType('url')}
                    className={cn(
                      "flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all",
                      discoveryType === 'url' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Analyze Website URL
                  </button>
                  <button 
                    onClick={() => setDiscoveryType('text')}
                    className={cn(
                      "flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all",
                      discoveryType === 'text' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Analyze Sample Text
                  </button>
                </div>

                {discoveryType === 'url' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Company URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="url"
                        placeholder="https://mycompany.com"
                        value={discoveryUrl}
                        onChange={(e) => setDiscoveryUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Gemini will scan this landing page to model tone, wording preferences, and forbidden claims.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Voice Copy Samples</label>
                    <textarea 
                      placeholder="Paste newsletter clips, blog articles, or sample replies showing the desired tone..."
                      rows={6}
                      value={discoveryText}
                      onChange={(e) => setDiscoveryText(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-sans"
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
                <button 
                  onClick={() => setIsDiscoveryOpen(false)}
                  disabled={isDiscovering}
                  className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVoiceDiscovery}
                  disabled={isDiscovering}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Discover Voice
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: NEW VOICE GUIDE PROFILE OVERLAY */}
      <AnimatePresence>
        {isNewIdentityOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Create Voice Guide Profile</h2>
                <button 
                  onClick={() => setIsNewIdentityOpen(false)} 
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Voice Identity Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Acme Tech Corp, Jane Doe (CEO)"
                    value={newIdentityName}
                    onChange={(e) => setNewIdentityName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Objective / Context</label>
                  <textarea 
                    placeholder="Briefly state who this voice guide profile represents or what they offer..."
                    rows={3}
                    value={newIdentityDesc}
                    onChange={(e) => setNewIdentityDesc(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-sans"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
                <button 
                  onClick={() => setIsNewIdentityOpen(false)}
                  disabled={isCreatingIdentity}
                  className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateNewIdentity}
                  disabled={isCreatingIdentity}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isCreatingIdentity ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Create Guide Profile
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
