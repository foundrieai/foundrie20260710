import React, { useState, useEffect } from 'react';
import { InboxItem } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Clock,
  ArrowRight,
  Inbox,
  Globe,
  X,
  Check,
  Archive,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from '../motion-shim';

export const InboxPage: React.FC = () => {
  const { 
    currentIdentity, 
    addToast, 
    addNotification,
    inboxItems: items, 
    setInboxItems: setItems, 
    selectedInboxItemId, 
    setSelectedInboxItemId 
  } = useApp();

  const selectedItem = items.find(item => item.id === selectedInboxItemId) || null;
  const setSelectedItem = (item: InboxItem | null) => {
    setSelectedInboxItemId(item ? item.id : null);
  };

  // State Management
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  
  // Custom states for newly wired functionalities
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedDraftContent, setEditedDraftContent] = useState('');

  // Auto reset draft editor and options when selecting another item
  useEffect(() => {
    setAiDraft(null);
    setIsEditingDraft(false);
    setEditedDraftContent('');
    setIsMoreOptionsOpen(false);
  }, [selectedInboxItemId]);

  useEffect(() => {
    if (items.length > 0) return;
    const seedItem: InboxItem = {
      id: 'demo-inbox-1',
      tenantId: 'foundrie-demo',
      identityId: currentIdentity?.id || 'main-brand',
      platform: 'LinkedIn',
      itemType: 'comment',
      threadId: 'demo-thread-1',
      author: {
        id: 'founder-1',
        handle: '@founderstack',
        displayName: 'Maya Chen',
      },
      text: 'This positioning around AI-era business tools is sharp. How would you recommend a founder sequence brand and company validation?',
      url: 'https://www.linkedin.com/',
      timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
      requiresResponse: true,
      sentiment: 'positive',
      tags: ['founder', 'positioning'],
      status: 'new',
      rawPayload: {},
    };
    setItems([seedItem]);
    addNotification({
      title: 'New LinkedIn Interaction',
      description: `${seedItem.author.displayName}: "${seedItem.text.slice(0, 50)}..."`,
      type: 'info',
      linkPath: 'inbox',
      targetId: seedItem.id,
    });
  }, [addNotification, setItems]);

  // AI draft reply generator call
  const handleAiDraft = async () => {
    if (!selectedItem) return;
    setIsDrafting(true);
    setAiDraft(null);
    setEditedDraftContent('');
    
    try {
      const response = await fetch('/api/ai/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboxItem: selectedItem,
          brandGuide: {
            voice: { personaTraits: ['Professional', 'Helpful'], toneSliders: { professional: 90 } },
            writingRules: { styleGuide: 'Concise and friendly' }
          }
        })
      });
      const data = await response.json();
      setAiDraft(data);
      if (data && data.primaryDraft) {
        setEditedDraftContent(data.primaryDraft);
      }
    } catch (error) {
      console.error('Draft Error:', error);
      addToast('Could not retrieve AI reply draft', 'info');
    } finally {
      setIsDrafting(false);
    }
  };

  // Send draft response
  const handleSendResponse = () => {
    if (!selectedItem) return;
    if (!editedDraftContent.trim()) {
      addToast('Draft response copy cannot be empty.', 'info');
      return;
    }

    // Set item status to 'sent' and remove requiresResponse
    setItems(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: 'sent',
          requiresResponse: false
        };
      }
      return item;
    }));

    addToast(`Successfully published response to ${selectedItem.author.handle} on ${selectedItem.platform}!`, 'success');
    
    // Clear draft states
    setAiDraft(null);
    setEditedDraftContent('');
    setIsEditingDraft(false);
  };

  // Multi-dimensional filtering logic
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery 
      ? item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.author.handle.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesPlatform = filterPlatform === 'all' ? true : item.platform === filterPlatform;
    const matchesSentiment = filterSentiment === 'all' ? true : item.sentiment === filterSentiment;
    const matchesStatus = filterStatus === 'all' ? true : item.status === filterStatus;

    return matchesSearch && matchesPlatform && matchesSentiment && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Unified Inbox</h1>
          <p className="text-slate-500 text-sm">Real-time interactions across all connected platforms.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inbox..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64 text-slate-800"
            />
          </div>

          {/* Filter Dropdown Toggle Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-2 bg-white border rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center space-x-1.5 shadow-sm",
                (filterPlatform !== 'all' || filterSentiment !== 'all' || filterStatus !== 'all') 
                  ? "border-blue-300 bg-blue-50/50 text-blue-600 font-medium" 
                  : "border-slate-200"
              )}
              title="Filter interactions"
            >
              <Filter className="w-5 h-5" />
              {(filterPlatform !== 'all' || filterSentiment !== 'all' || filterStatus !== 'all') && (
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 z-50 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filters</span>
                      {(filterPlatform !== 'all' || filterSentiment !== 'all' || filterStatus !== 'all') && (
                        <button 
                          onClick={() => {
                            setFilterPlatform('all');
                            setFilterSentiment('all');
                            setFilterStatus('all');
                            addToast('Filters reset', 'info');
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Platform Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform</label>
                      <select 
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="all">All Platforms</option>
                        <option value="X">X (Twitter)</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="LinkedIn">LinkedIn</option>
                      </select>
                    </div>

                    {/* Sentiment Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sentiment</label>
                      <select 
                        value={filterSentiment}
                        onChange={(e) => setFilterSentiment(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="all">All Sentiments</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="all">All Statuses</option>
                        <option value="new">New</option>
                        <option value="sent">Replied / Sent</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 min-h-0">
        {/* Feed List */}
        <div className="w-1/3 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{filteredItems.length} Match</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {filteredItems.map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-slate-50 transition-all group relative",
                    selectedItem?.id === item.id ? "bg-blue-50/30" : ""
                  )}
                >
                  {selectedItem?.id === item.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                        {item.author.displayName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">{item.author.displayName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{item.platform} • {item.itemType}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">{item.text}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      {item.sentiment === 'positive' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                      {item.sentiment === 'negative' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                      {item.sentiment === 'neutral' && <span className="w-2 h-2 rounded-full bg-slate-300" />}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.sentiment}</span>
                    </div>

                    {item.status === 'sent' && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center border border-green-100">
                        <Check className="w-3 h-3 mr-1" />
                        Sent
                      </span>
                    )}
                    {item.status === 'archived' && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Archived
                      </span>
                    )}
                    {item.status === 'new' && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        New
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
            {filteredItems.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                  <Inbox className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">No matching interactions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {selectedItem ? (
            <>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 border border-slate-200">
                    {selectedItem.author.displayName[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedItem.author.displayName}</h2>
                    <p className="text-sm text-slate-500">{selectedItem.author.handle}</p>
                  </div>
                </div>
                
                {/* Individual interaction More Options Three-Dot Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {isMoreOptionsOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMoreOptionsOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-left"
                        >
                          <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Actions</div>
                          {selectedItem.status !== 'archived' ? (
                            <button
                              onClick={() => {
                                setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, status: 'archived', requiresResponse: false } : item));
                                addToast('Interaction successfully archived', 'info');
                                setIsMoreOptionsOpen(false);
                              }}
                              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
                            >
                              <Archive className="w-3.5 h-3.5 text-slate-400" />
                              <span>Archive Interaction</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, status: 'new', requiresResponse: true } : item));
                                addToast('Restored interaction to New status', 'info');
                                setIsMoreOptionsOpen(false);
                              }}
                              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
                            >
                              <Archive className="w-3.5 h-3.5 text-slate-400" />
                              <span>Restore to New</span>
                            </button>
                          )}

                          {selectedItem.status !== 'sent' && (
                            <button
                              onClick={() => {
                                setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, status: 'sent', requiresResponse: false } : item));
                                addToast('Marked interaction as manually replied', 'success');
                                setIsMoreOptionsOpen(false);
                              }}
                              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Mark as Replied</span>
                            </button>
                          )}

                          <div className="h-px bg-slate-100 my-1" />

                          <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Override Sentiment</div>
                          {(['positive', 'neutral', 'negative'] as const).map((sent) => (
                            <button
                              key={sent}
                              onClick={() => {
                                setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, sentiment: sent } : item));
                                addToast(`Sentiment changed to ${sent}`, 'success');
                                setIsMoreOptionsOpen(false);
                              }}
                              className="w-full px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors capitalize flex items-center justify-between"
                            >
                              <span>{sent}</span>
                              {selectedItem.sentiment === sent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))}

                          <div className="h-px bg-slate-100 my-1" />

                          <button
                            onClick={() => {
                              setItems(prev => prev.filter(item => item.id !== selectedItem.id));
                              setSelectedItem(null);
                              addToast('Interaction deleted permanently', 'info');
                              setIsMoreOptionsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete Interaction</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 relative">
                    <div className="absolute -top-3 left-6 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Original Message
                    </div>
                    <p className="text-slate-800 leading-relaxed text-lg italic">"{selectedItem.text}"</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 pt-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-400 font-medium">{new Date(selectedItem.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-400 font-medium uppercase">{selectedItem.platform}</span>
                        </div>
                      </div>
                      <a href={selectedItem.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center">
                        View Original <ArrowRight className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  {/* AI Draft Section */}
                  <div className="mt-12 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-blue-600 animate-pulse" />
                        AI Copilot Assistant
                      </h3>
                      {!aiDraft && !isDrafting && (
                        <button 
                          onClick={handleAiDraft}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Draft Reply
                        </button>
                      )}
                    </div>

                    {isDrafting && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                        <Sparkles className="w-8 h-8 text-blue-400 animate-spin" />
                        <p className="text-blue-600 font-medium">Drafting on-brand response...</p>
                      </div>
                    )}

                    {aiDraft && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="space-y-6"
                      >
                        <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-500/5 relative">
                          <div className="absolute -top-3 left-6 px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-widest">
                            Primary AI Draft
                          </div>

                          {/* Editable Text Area or Read-Only display */}
                          {isEditingDraft ? (
                            <div className="space-y-2">
                              <textarea
                                value={editedDraftContent}
                                onChange={(e) => setEditedDraftContent(e.target.value)}
                                rows={5}
                                className="w-full text-slate-900 text-base leading-relaxed border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 bg-slate-50 font-sans"
                                placeholder="Edit your custom response..."
                              />
                              <p className="text-[10px] text-slate-400 italic">Editing active draft copy directly. Click Save Draft to log edits.</p>
                            </div>
                          ) : (
                            <p className="text-slate-900 text-lg leading-relaxed">{editedDraftContent || aiDraft.primaryDraft}</p>
                          )}
                          
                          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Tone: {aiDraft.toneAnalysis}</span>
                              </div>
                              {aiDraft.riskFlags && aiDraft.riskFlags.length > 0 && (
                                <div className="flex items-center space-x-1.5">
                                  <AlertCircle className="w-4 h-4 text-amber-500" />
                                  <span className="text-xs font-bold text-amber-600 uppercase tracking-tight">{aiDraft.riskFlags[0]}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Actions System */}
                            <div className="flex items-center space-x-3">
                              {/* Edit Draft toggle */}
                              <button 
                                onClick={() => setIsEditingDraft(!isEditingDraft)}
                                className={cn(
                                  "px-4 py-2 font-bold text-sm rounded-lg transition-all border",
                                  isEditingDraft 
                                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                )}
                              >
                                {isEditingDraft ? 'Save Draft' : 'Edit Draft'}
                              </button>

                              {/* Send Response button */}
                              <button 
                                onClick={handleSendResponse}
                                className="px-6 py-2 bg-slate-900 text-white border border-slate-900 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center shadow-sm"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send Response
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Alternate responses selector */}
                        {aiDraft.alternates && aiDraft.alternates.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alternate Formulations</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {aiDraft.alternates.map((alt: string, i: number) => (
                                <div 
                                  key={i} 
                                  onClick={() => {
                                    setEditedDraftContent(alt);
                                    addToast('Switched draft to this version!', 'success');
                                  }}
                                  className={cn(
                                    "p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between text-left",
                                    editedDraftContent === alt 
                                      ? "bg-blue-50/50 border-blue-400 shadow-sm" 
                                      : "bg-slate-50 border-slate-200 hover:border-blue-300"
                                  )}
                                >
                                  <p className="text-sm text-slate-600 italic">"{alt}"</p>
                                  <span className="mt-3 text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                    {editedDraftContent === alt ? 'Active Version' : 'Use this formulation'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                <MessageSquare className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Select a message</h3>
              <p className="text-slate-500 mt-2 max-w-xs">Choose an interaction from the feed to view history and draft a response.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
