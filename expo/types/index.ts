export interface User {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  accountAge: string;
  completedCycles: number;
  onTimeRate: number;
  circlesCount: number;
  totalSaved: number;
  isBusinessOwner: boolean;
  storefrontListings: StorefrontListing[];
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export interface StorefrontListing {
  id: string;
  title: string;
  description: string;
  category: 'business' | 'service' | 'cause';
  listingType?: 'service' | 'product';
  image: string;
  price?: number;
  fundingGoal?: number;
  fundingRaised?: number;
  supportCount: number;
  tags: string[];
  duration?: string;
  availableSlots?: TimeSlot[];
  variants?: ProductVariant[];
  inventory?: number;
  deliveryInfo?: string;
}

export interface CircleMember {
  id: string;
  username: string;
  avatar: string;
  hasPaid: boolean;
  payoutOrder: number;
  completedCycles: number;
  onTimeRate: number;
  accountAge: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  completedCycles: number;
  onTimeRate: number;
  accountAge: string;
  status: 'pending' | 'approved' | 'declined';
  monthlyIncome?: number;
  message?: string;
}

export interface Circle {
  id: string;
  name: string;
  avatar: string;
  contribution: number;
  duration: string;
  totalSeats: number;
  filledSeats: number;
  status: 'recruiting' | 'active' | 'completed' | 'voting';
  members: CircleMember[];
  pendingRequests: JoinRequest[];
  currentMonth: number;
  nextPayoutDate: string;
  nextPayoutMember?: string;
  totalPool: number;
  vaultContribution: number;
  description: string;
  createdBy: string;
  creatorId: string;
}

export interface VaultContributor {
  id: string;
  username: string;
  avatar: string;
  contributed: number;
}

export interface VaultMilestone {
  id: string;
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'in_progress' | 'verified' | 'rejected';
  verificationDocId?: string;
  verifiedDate?: string;
  createdBy: string;
}

export interface VaultMediaItem {
  id: string;
  type: 'image' | 'document' | 'link';
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByAvatar: string;
  uploadedDate: string;
  linkedMilestoneId?: string;
}

export interface VaultMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  attachedMediaId?: string;
  type: 'message' | 'update' | 'milestone_verified' | 'contribution';
}

export interface VaultVote {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  vote: 'approve' | 'deny';
  timestamp: string;
}

export interface Vault {
  id: string;
  name: string;
  icon: string;
  goal: number;
  raised: number;
  description: string;
  organizerNotes?: string;
  organizer: string;
  organizerId: string;
  contributors: VaultContributor[];
  milestones: VaultMilestone[];
  media: VaultMediaItem[];
  messages: VaultMessage[];
  votes: VaultVote[];
  familyId?: string;
  status: 'active' | 'milestones_met' | 'voting' | 'released';
  category: 'circle_vault' | 'goal' | 'cause';
  createdDate: string;
}

export interface VaultFamily {
  id: string;
  name: string;
  icon: string;
  vaultIds: string[];
}

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  bookmarks: number;
  liked: boolean;
  bookmarked: boolean;
  attachedListing?: StorefrontListing;
  tags: string[];
  mentions: string[];
}

export interface OpportunityCard {
  id: string;
  title: string;
  description: string;
  category: 'business' | 'cause' | 'external';
  listingType?: 'service' | 'product';
  price?: number;
  fundingGoal?: number;
  fundingRaised?: number;
  fundingContributors?: { id: string; username: string; avatar: string; amount: number }[];
  image: string;
  externalUrl?: string;
  tags: string[];
  ownerId?: string;
  ownerUsername?: string;
  ownerAvatar?: string;
  supportCount?: number;
  contactEnabled?: boolean;
  organizerNote?: string;
  duration?: string;
  availableSlots?: TimeSlot[];
  variants?: ProductVariant[];
  inventory?: number;
  deliveryInfo?: string;
}

export type LearnCategory = 'all' | 'circles' | 'investing' | 'trading' | 'savings' | 'bonds' | 'stocks' | 'crypto' | 'real-estate' | 'budgeting';

export interface LearnLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz' | 'interactive';
  completed: boolean;
}

export interface LearnModule {
  id: string;
  title: string;
  summary: string;
  image: string;
  duration: string;
  completed: boolean;
  lessons: number;
  category: LearnCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: string;
  authorAvatar: string;
  rating: number;
  enrolledCount: number;
  lessonsList?: LearnLesson[];
  keyTakeaways?: string[];
}

export interface Conversation {
  id: string;
  participantId: string;
  participantUsername: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'circle' | 'social' | 'payout' | 'system' | 'vault' | 'request';
}

export interface PayoutPlan {
  totalPayout: number;
  vaultContribution: number;
  personalAmount: number;
  suggestedModules: string[];
  suggestedOpportunities: string[];
}

export interface CartItem {
  opportunityId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariants: Record<string, string>;
  sellerId: string;
  sellerUsername: string;
  sellerAvatar: string;
  deliveryInfo?: string;
}

export interface CartStore {
  sellerId: string;
  sellerUsername: string;
  sellerAvatar: string;
  items: CartItem[];
}
