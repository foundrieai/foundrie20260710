import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { 
  Bell, 
  Search, 
  Globe, 
  User as UserIcon,
  Zap,
  ChevronDown,
  Plus,
  X,
  Info,
  Calendar,
  MessageSquare,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from '../motion-shim';

export const Layout: React.FC<{ children: React.ReactNode; currentPath: string; onNavigate: (path: string) => void }> = ({ children, currentPath, onNavigate }) => {
  const { 
    currentTenant, 
    currentIdentity, 
    identities,
    setCurrentIdentity,
    addIdentity,
    addToast,
    toasts,
    connections,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setInboxItems,
    setSelectedInboxItemId,
    scheduledPosts,
    inboxItems,
    setCurrentPath
  } = useApp();

  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandVoice, setNewBrandVoice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addIdentity(newBrandName, newBrandVoice);
      setIsAddingBrand(false);
      setNewBrandName('');
      setNewBrandVoice('');
      addToast(`Brand "${newBrandName}" added successfully`, 'success');
    } catch (error) {
      addToast('Failed to add brand', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceholderClick = (label: string) => {
    addToast(`${label} feature coming soon!`, 'info');
  };

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredIdentities = searchQuery
    ? identities.filter(id => 
        id.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        id.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredPosts = searchQuery
    ? scheduledPosts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredInbox = searchQuery
    ? inboxItems.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.author.handle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasSearchResults = filteredIdentities.length > 0 || filteredPosts.length > 0 || filteredInbox.length > 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identity:</span>
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <span>{currentIdentity?.displayName || 'Select Identity'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block overflow-hidden z-50">
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {identities.map((id) => (
                      <button
                        key={id.id}
                        onClick={() => setCurrentIdentity(id)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors",
                          currentIdentity?.id === id.id ? "text-blue-600 font-bold bg-blue-50" : "text-slate-700"
                        )}
                      >
                        {id.displayName}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsAddingBrand(true)}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Brand
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platforms:</span>
              <div className="flex -space-x-1">
                {['X', 'Instagram', 'LinkedIn', 'Facebook'].map((p) => {
                  const conn = connections.find(c => c.identityId === currentIdentity?.id && c.platform.toLowerCase() === p.toLowerCase());
                  const isConnected = conn && conn.status === 'active' && conn.accountDisplayName;
                  
                  let brandColor = "bg-slate-100 text-slate-400 border-slate-200 opacity-40 hover:opacity-75";
                  if (isConnected) {
                    if (p === 'X') brandColor = "bg-black text-white border-white hover:bg-slate-900";
                    else if (p === 'Instagram') brandColor = "bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white border-white hover:opacity-90";
                    else if (p === 'LinkedIn') brandColor = "bg-blue-600 text-white border-white hover:bg-blue-700";
                    else brandColor = "bg-blue-800 text-white border-white hover:bg-blue-900";
                  }

                  const handlePlatformClick = () => {
                    if (isConnected) {
                      addToast(`${p} platform is active and connected as ${conn.accountDisplayName}!`, 'success');
                    } else {
                      addToast(`Redirecting to Settings to connect your ${p} account...`, 'info');
                      setCurrentPath('settings');
                    }
                  };

                  return (
                    <div 
                      key={p} 
                      onClick={handlePlatformClick}
                      title={`${p}: ${isConnected ? `Connected as ${conn.accountDisplayName}` : 'Not connected (click to connect)'}`}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all",
                        brandColor
                      )}
                    >
                      {p[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[480px] flex flex-col"
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                          <h4 className="text-sm font-bold text-slate-950">Notifications</h4>
                          <p className="text-[10px] text-slate-400 font-medium">You have {unreadNotificationsCount} unread items</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {unreadNotificationsCount > 0 && (
                            <button 
                              onClick={() => {
                                markAllNotificationsAsRead();
                                addToast('All notifications marked as read', 'success');
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button 
                              onClick={() => {
                                clearNotifications();
                                addToast('Notifications cleared', 'info');
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[350px]">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.linkPath) {
                                onNavigate(notif.linkPath);
                                if (notif.targetId) {
                                  setSelectedInboxItemId(notif.targetId);
                                }
                              }
                              setIsNotificationsOpen(false);
                            }}
                            className={cn(
                              "p-4 text-left hover:bg-slate-50 transition-all cursor-pointer flex items-start space-x-3 relative",
                              !notif.read ? "bg-blue-50/20" : ""
                            )}
                          >
                            {!notif.read && (
                              <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            )}
                            <div className="mt-0.5 shrink-0">
                              {notif.type === 'success' && (
                                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                              {notif.type === 'schedule' && (
                                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                  <Calendar className="w-4 h-4" />
                                </div>
                              )}
                              {notif.type === 'alert' && (
                                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                                  <Info className="w-4 h-4" />
                                </div>
                              )}
                              {notif.type === 'info' && (
                                <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                                  <MessageSquare className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words">{notif.description}</p>
                              <span className="text-[9px] text-slate-400 font-medium block mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}

                        {notifications.length === 0 && (
                          <div className="p-8 text-center text-slate-400">
                            <span className="text-2xl mb-2 block">🎉</span>
                            <p className="text-xs font-bold text-slate-500">All caught up!</p>
                            <p className="text-[10px] text-slate-400 mt-1">No new notifications at this time.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(true);
              }}
              title="Global Search (Cmd+K)"
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <Globe className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

        {/* Add Brand Modal */}
        <AnimatePresence>
          {isAddingBrand && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingBrand(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Add New Brand</h2>
                    <button onClick={() => setIsAddingBrand(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={handleAddBrand} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Name</label>
                      <input 
                        autoFocus
                        required
                        type="text" 
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Voice Profile</label>
                      <textarea 
                        required
                        value={newBrandVoice}
                        onChange={(e) => setNewBrandVoice(e.target.value)}
                        placeholder="Describe the brand's personality and tone..."
                        className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      />
                    </div>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating Brand...' : 'Create Brand Identity'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toasts */}
        <div className="fixed bottom-8 right-8 z-[110] flex flex-col space-y-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-xl border min-w-[240px]",
                  toast.type === 'success' ? "bg-white border-green-100 text-green-800" : "bg-white border-slate-200 text-slate-800"
                )}
              >
                {toast.type === 'success' ? (
                  <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <span className="text-sm font-bold">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Global Search Modal */}
        <AnimatePresence>
          {isSearchOpen && (
            <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[15vh]">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSearchOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -20 }}
                className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[60vh] z-50"
              >
                <div className="flex items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <input 
                    autoFocus
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts, inbox interactions, brand identities..."
                    className="flex-1 bg-transparent text-slate-900 text-sm focus:outline-none placeholder-slate-400"
                  />
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 uppercase shrink-0">ESC</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {searchQuery ? (
                    hasSearchResults ? (
                      <div className="space-y-6">
                        {/* Brand Identities Group */}
                        {filteredIdentities.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Brand Identities</h5>
                            <div className="space-y-1">
                              {filteredIdentities.map(id => (
                                <button
                                  key={id.id}
                                  onClick={() => {
                                    setCurrentIdentity(id);
                                    addToast(`Switched identity to: ${id.displayName}`, 'success');
                                    setIsSearchOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{id.displayName}</p>
                                    <p className="text-xs text-slate-500 truncate max-w-md">{id.description}</p>
                                  </div>
                                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Switch</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Scheduled Posts Group */}
                        {filteredPosts.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Scheduled Posts</h5>
                            <div className="space-y-1">
                              {filteredPosts.map(post => (
                                <button
                                  key={post.id}
                                  onClick={() => {
                                    onNavigate('calendar');
                                    setIsSearchOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-all flex items-start space-x-3 group cursor-pointer"
                                >
                                  <div className="mt-0.5 p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                    <Calendar className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{post.content}</p>
                                    <p className="text-xs text-slate-500">
                                      Platforms: {post.platformTargets.join(', ')} • Date: {post.scheduledAt.split('T')[0]}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Inbox Group */}
                        {filteredInbox.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Inbox Interactions</h5>
                            <div className="space-y-1">
                              {filteredInbox.map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedInboxItemId(item.id);
                                    onNavigate('inbox');
                                    setIsSearchOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-all flex items-start space-x-3 group cursor-pointer"
                                >
                                  <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                                    <MessageSquare className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.author.displayName}</span>
                                      <span className="text-[10px] text-slate-400 font-bold uppercase">{item.platform} • {item.itemType}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1">{item.text}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-400">
                        <span className="text-2xl mb-2 block">🔍</span>
                        <p className="text-sm font-bold text-slate-500">No results found</p>
                        <p className="text-xs text-slate-400 mt-1">We couldn't find any matches for "{searchQuery}"</p>
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-4">
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          Type a keyword to search across Scheduled Posts, Inbox messages, author names, or Brand Identities.
                        </p>
                        <div className="flex justify-center space-x-4 text-[10px] text-slate-400 font-bold uppercase">
                          <span className="bg-slate-50 px-2 py-1 border border-slate-200 rounded-md">↑↓ Navigate</span>
                          <span className="bg-slate-50 px-2 py-1 border border-slate-200 rounded-md">↵ Select</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
