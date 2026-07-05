/**
 * Core Product Model for BrandForge
 */

export type Role = 'Owner' | 'Admin' | 'Publisher' | 'Approver' | 'Analyst' | 'ReadOnly';

export interface Tenant {
  id: string;
  name: string;
  plan: 'basic' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  tenantMemberships: string[]; // List of tenant IDs
  rolesByTenant: Record<string, Role>;
  createdAt: string;
}

export interface BrandIdentity {
  id: string;
  tenantId: string;
  type: 'corporate' | 'executive';
  displayName: string;
  description: string;
  defaultApprovalPolicy: 'none' | 'required' | 'strict';
  createdAt: string;
}

export interface BrandGuide {
  id: string;
  tenantId: string;
  identityId: string;
  voice: {
    toneSliders: Record<string, number>; // e.g., { professional: 80, witty: 20 }
    personaTraits: string[];
    forbiddenTopics: string[];
    sensitiveClaims: string[];
    requiredDisclaimers: string[];
  };
  writingRules: {
    styleGuide: string;
    capitalization: string;
    emojiRules: string;
    hashtagRules: string;
  };
  examples: {
    bestPosts: string[];
    worstPosts: string[];
    doDontPairs: { do: string; dont: string }[];
    signaturePhrases: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export type Platform = 'X' | 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'TikTok';

export interface SocialConnection {
  id: string;
  tenantId: string;
  identityId: string;
  platform: Platform;
  accountDisplayName: string;
  accountId: string;
  scopes: string[];
  status: 'active' | 'expired' | 'error';
  rateLimitProfile: Record<string, any>;
  tokenRef: string;
  createdAt: string;
  accessToken?: string;
  refreshToken?: string;
}

export type InboxItemType = 'comment' | 'reply' | 'mention' | 'dm';
export type InboxItemStatus = 'new' | 'triaged' | 'drafted' | 'approved' | 'sent' | 'archived';

export interface InboxItem {
  id: string;
  tenantId: string;
  identityId: string;
  platform: Platform;
  itemType: InboxItemType;
  threadId: string;
  author: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl?: string;
  };
  text: string;
  url: string;
  timestamp: string;
  requiresResponse: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  status: InboxItemStatus;
  rawPayload: any;
}

export interface Draft {
  id: string;
  tenantId: string;
  identityId: string;
  platform: Platform;
  draftType: 'reply' | 'dm' | 'post';
  linkedInboxItemId?: string;
  scheduledPostId?: string;
  content: string;
  altVersions: string[];
  riskFlags: string[];
  citations: string[];
  createdBy: 'ai' | 'human';
  createdAt: string;
}

export interface Approval {
  id: string;
  tenantId: string;
  identityId: string;
  draftId: string;
  state: 'pending' | 'approved' | 'rejected';
  reviewerUserId?: string;
  notes?: string;
  decidedAt?: string;
}

export interface ScheduledPost {
  id: string;
  tenantId: string;
  identityId: string;
  platformTargets: Platform[];
  content: string;
  mediaRefs: string[];
  scheduledAt: string;
  timezone: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishResult?: any;
}

export interface ListeningTopic {
  id: string;
  tenantId: string;
  identityScope: 'all' | string; // 'all' or specific identityId
  queryText: string;
  platforms: Platform[];
  createdAt: string;
}

export interface ListeningMention {
  id: string;
  tenantId: string;
  identityId?: string;
  platform: Platform;
  topicId: string;
  author: string;
  text: string;
  url: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  entities: string[];
  rawPayload: any;
}

export interface AnalyticsDailyRollup {
  tenantId: string;
  identityId: string;
  platform: Platform;
  date: string;
  metrics: {
    impressions: number;
    engagements: number;
    replies: number;
    clicks: number;
    followerDelta: number;
    responseTime: number;
  };
  createdAt: string;
}

export interface Forecast {
  tenantId: string;
  identityId: string;
  platform: Platform;
  metricName: string;
  horizonDays: number;
  forecastSeries: { date: string; value: number }[];
  drivers: string[];
  createdAt: string;
}

export interface AuditLogEvent {
  id: string;
  tenantId: string;
  actorUserId?: string;
  actorType: 'user' | 'system' | 'ai';
  eventType: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  metadata: any;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'alert' | 'schedule';
  linkPath?: string;
  targetId?: string;
}

