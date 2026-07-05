'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/firebase';
import type {
  AppNotification,
  BrandIdentity,
  InboxItem,
  Platform,
  ScheduledPost,
  SocialConnection,
  Tenant,
  User,
} from '../types';

interface AppContextType {
  user: User | null;
  currentTenant: Tenant | null;
  currentIdentity: BrandIdentity | null;
  identities: BrandIdentity[];
  setCurrentTenant: (tenant: Tenant) => void;
  setCurrentIdentity: (identity: BrandIdentity) => void;
  addIdentity: (name: string, voiceProfile: string) => Promise<void>;
  addToast: (message: string, type?: 'info' | 'success') => void;
  toasts: { id: string; message: string; type: 'info' | 'success' }[];
  loading: boolean;
  logout: () => Promise<void>;
  connections: SocialConnection[];
  connectPlatform: (platform: Platform, handle: string, accessToken?: string, refreshToken?: string) => Promise<void>;
  disconnectPlatform: (platform: Platform) => Promise<void>;
  scheduledPosts: ScheduledPost[];
  schedulePost: (post: Omit<ScheduledPost, 'id' | 'tenantId' | 'identityId' | 'status'>) => Promise<void>;
  updateScheduledPost: (id: string, post: Partial<Omit<ScheduledPost, 'id' | 'tenantId' | 'identityId'>>, showToast?: boolean) => Promise<void>;
  deleteScheduledPost: (id: string) => Promise<void>;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  inboxItems: InboxItem[];
  setInboxItems: React.Dispatch<React.SetStateAction<InboxItem[]>>;
  selectedInboxItemId: string | null;
  setSelectedInboxItemId: (id: string | null) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const storageKey = (name: string, uid?: string) => `foundrie_brandforge_${uid || 'demo'}_${name}`;

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getPlatformScopes(platform: Platform): string[] {
  switch (platform) {
    case 'LinkedIn':
      return ['r_liteprofile', 'w_member_social', 'openid', 'profile', 'email'];
    case 'X':
      return ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];
    case 'Instagram':
      return ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'];
    case 'Facebook':
      return ['public_profile', 'pages_manage_posts', 'pages_read_engagement'];
    default:
      return [];
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: foundrieUser, isUserLoading } = useUser();
  const uid = foundrieUser?.uid || 'demo';
  const [currentPath, setCurrentPath] = useState('overview');
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'info' | 'success' }[]>([]);
  const [selectedInboxItemId, setSelectedInboxItemId] = useState<string | null>(null);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [identities, setIdentities] = useState<BrandIdentity[]>([]);
  const [currentIdentity, setCurrentIdentity] = useState<BrandIdentity | null>(null);

  const currentTenant = useMemo<Tenant>(
    () => ({
      id: `foundrie-${uid}`,
      name: foundrieUser?.displayName ? `${foundrieUser.displayName}'s BrandForge Workspace` : 'Foundrie BrandForge Workspace',
      plan: 'pro',
      settings: {},
      createdAt: new Date().toISOString(),
    }),
    [foundrieUser?.displayName, uid]
  );

  const user = useMemo<User | null>(() => {
    if (!foundrieUser) return null;
    return {
      id: foundrieUser.uid,
      email: foundrieUser.email || '',
      displayName: foundrieUser.displayName || 'Foundrie User',
      tenantMemberships: [currentTenant.id],
      rolesByTenant: { [currentTenant.id]: 'Owner' },
      createdAt: new Date().toISOString(),
    };
  }, [currentTenant.id, foundrieUser]);

  useEffect(() => {
    const defaultIdentity: BrandIdentity = {
      id: 'main-brand',
      tenantId: currentTenant.id,
      type: 'corporate',
      displayName: 'Main Brand',
      description: 'Primary brand identity for Foundrie AI planning, publishing, and governance.',
      defaultApprovalPolicy: 'none',
      createdAt: new Date().toISOString(),
    };
    const loadedIdentities = readStored<BrandIdentity[]>(storageKey('identities', uid), [defaultIdentity]);
    setIdentities(loadedIdentities);
    setCurrentIdentity(loadedIdentities[0] || defaultIdentity);
    setConnections(readStored<SocialConnection[]>(storageKey('connections', uid), []));
    setNotifications(readStored<AppNotification[]>(storageKey('notifications', uid), []));
    setInboxItems(readStored<InboxItem[]>(storageKey('inbox', uid), []));
    setScheduledPosts(
      readStored<ScheduledPost[]>(storageKey('scheduled_posts', uid), [
        {
          id: 'post-1',
          tenantId: currentTenant.id,
          identityId: defaultIdentity.id,
          platformTargets: ['LinkedIn', 'X'],
          content: 'We are refining our brand system for the AI era of business. Stronger voice, sharper presence, better momentum.',
          mediaRefs: [],
          scheduledAt: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
          timezone: 'UTC',
          status: 'scheduled',
        },
        {
          id: 'post-2',
          tenantId: currentTenant.id,
          identityId: defaultIdentity.id,
          platformTargets: ['Instagram'],
          content: 'Behind every enduring company is a brand system that compounds trust.',
          mediaRefs: [],
          scheduledAt: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
          timezone: 'UTC',
          status: 'scheduled',
        },
      ])
    );
  }, [currentTenant.id, uid]);

  const addToast = useCallback((message: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 3000);
  }, []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => {
      const next = [
        {
          ...notification,
          id: `notif-${Math.random().toString(36).slice(2)}`,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ];
      writeStored(storageKey('notifications', uid), next);
      return next;
    });
  }, [uid]);

  const addIdentity = useCallback(async (name: string, voiceProfile: string) => {
    const identity: BrandIdentity = {
      id: Math.random().toString(36).slice(2),
      tenantId: currentTenant.id,
      type: 'corporate',
      displayName: name,
      description: voiceProfile || 'Brand identity workspace',
      defaultApprovalPolicy: 'none',
      createdAt: new Date().toISOString(),
    };
    setIdentities(prev => {
      const next = [...prev, identity];
      writeStored(storageKey('identities', uid), next);
      return next;
    });
    setCurrentIdentity(identity);
  }, [currentTenant.id, uid]);

  const connectPlatform = useCallback(async (platform: Platform, handle: string, accessToken?: string, refreshToken?: string) => {
    const connId = `${currentIdentity?.id || 'main-brand'}_${platform}`;
    const connection: SocialConnection = {
      id: connId,
      tenantId: currentTenant.id,
      identityId: currentIdentity?.id || 'main-brand',
      platform,
      accountDisplayName: handle,
      accountId: `${platform.toLowerCase()}-${Math.random().toString(36).slice(2)}`,
      scopes: getPlatformScopes(platform),
      status: 'active',
      rateLimitProfile: {},
      tokenRef: `token-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      accessToken,
      refreshToken,
    };
    setConnections(prev => {
      const next = [...prev.filter(item => item.id !== connId), connection];
      writeStored(storageKey('connections', uid), next);
      return next;
    });
    addToast(`${platform} connected successfully.`, 'success');
    addNotification({ title: `${platform} Connected`, description: `Linked ${handle}.`, type: 'success', linkPath: 'settings' });
  }, [addNotification, addToast, currentIdentity?.id, currentTenant.id, uid]);

  const disconnectPlatform = useCallback(async (platform: Platform) => {
    setConnections(prev => {
      const next = prev.map(item => item.platform === platform && item.identityId === currentIdentity?.id ? { ...item, status: 'expired' as const, accountDisplayName: '' } : item);
      writeStored(storageKey('connections', uid), next);
      return next;
    });
    addToast(`${platform} disconnected.`, 'info');
  }, [addToast, currentIdentity?.id, uid]);

  const schedulePost = useCallback(async (post: Omit<ScheduledPost, 'id' | 'tenantId' | 'identityId' | 'status'>) => {
    const nextPost: ScheduledPost = {
      ...post,
      id: `post-${Math.random().toString(36).slice(2)}`,
      tenantId: currentTenant.id,
      identityId: currentIdentity?.id || 'main-brand',
      status: 'scheduled',
    };
    setScheduledPosts(prev => {
      const next = [...prev, nextPost];
      writeStored(storageKey('scheduled_posts', uid), next);
      return next;
    });
    addToast('Post scheduled successfully.', 'success');
    addNotification({ title: 'Post Scheduled', description: `New post scheduled for ${post.platformTargets.join(', ')}.`, type: 'schedule', linkPath: 'calendar' });
  }, [addNotification, addToast, currentIdentity?.id, currentTenant.id, uid]);

  const updateScheduledPost = useCallback(async (id: string, post: Partial<Omit<ScheduledPost, 'id' | 'tenantId' | 'identityId'>>, showToast = true) => {
    setScheduledPosts(prev => {
      const next = prev.map(item => item.id === id ? { ...item, ...post } : item);
      writeStored(storageKey('scheduled_posts', uid), next);
      return next;
    });
    if (showToast) addToast('Scheduled post updated.', 'success');
  }, [addToast, uid]);

  const deleteScheduledPost = useCallback(async (id: string) => {
    setScheduledPosts(prev => {
      const next = prev.filter(item => item.id !== id);
      writeStored(storageKey('scheduled_posts', uid), next);
      return next;
    });
    addToast('Scheduled post removed.', 'info');
  }, [addToast, uid]);

  const value: AppContextType = {
    user,
    currentTenant,
    currentIdentity,
    identities,
    setCurrentTenant: () => undefined,
    setCurrentIdentity,
    addIdentity,
    addToast,
    toasts,
    loading: isUserLoading,
    logout: async () => undefined,
    connections,
    connectPlatform,
    disconnectPlatform,
    scheduledPosts,
    schedulePost,
    updateScheduledPost,
    deleteScheduledPost,
    notifications,
    addNotification,
    markNotificationAsRead: id => setNotifications(prev => prev.map(item => item.id === id ? { ...item, read: true } : item)),
    markAllNotificationsAsRead: () => setNotifications(prev => prev.map(item => ({ ...item, read: true }))),
    clearNotifications: () => setNotifications([]),
    inboxItems,
    setInboxItems,
    selectedInboxItemId,
    setSelectedInboxItemId,
    currentPath,
    setCurrentPath,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
