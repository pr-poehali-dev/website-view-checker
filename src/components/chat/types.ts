export type RoomTheme = 'general' | 'tech' | 'gaming' | 'music' | 'art' | 'sports';
export type RoomBadge = 'adult' | 'music' | 'video' | 'none';
export type UserRole = 'guest' | 'user' | 'moderator' | 'admin';

export type Account = {
  id: string;
  password: string;
  username: string;
  role: UserRole;
  avatar: string;
  bgColor: string;
};

export type RoomParticipant = {
  username: string;
  avatar: string;
};

export type Room = {
  id: string;
  name: string;
  description?: string;
  theme: RoomTheme;
  badge?: RoomBadge;
  password?: string;
  creatorId: string;
  creatorUsername: string;
  currentParticipants: number;
  maxParticipants: number;
  participants: RoomParticipant[];
  bannedUsers: string[];
};

export type Message = {
  id: string;
  user: string;
  avatar: string;
  bgColor: string;
  text: string;
  timestamp: string;
  isReply?: boolean;
  replyTo?: string;
  isSystemMessage?: boolean;
};

export const STANDARD_AVATARS = [
  'https://cdn.poehali.dev/files/90c55e86-49a4-46f2-b041-0d2934b03dbc.png',
  'https://cdn.poehali.dev/files/a73c7cc5-ab03-4413-8658-82ddea3f4f62.png',
  'https://cdn.poehali.dev/files/e63965a5-418e-4797-9ffe-5aa15bf0a608.png',
  'https://cdn.poehali.dev/files/03b0d38a-b9c0-47ad-9108-e008295023c4.png',
  'https://cdn.poehali.dev/files/1531e4f6-da32-40f7-84f0-b191e723fbb8.png',
];

export const BACKGROUND_COLORS = [
  { name: 'GRAY', value: '#2D2D2D' },
  { name: 'RED', value: '#633946' },
  { name: 'BLUE', value: '#1e3a8a' },
  { name: 'GREEN', value: '#166534' },
  { name: 'PURPLE', value: '#581c87' },
  { name: 'ORANGE', value: '#9a3412' },
];

export const ROOM_THEME_COLORS: Record<RoomTheme, string> = {
  general: '#6B7280',
  tech: '#3B82F6',
  gaming: '#8B5CF6',
  music: '#EC4899',
  art: '#F59E0B',
  sports: '#10B981',
};

export const ROOM_THEME_NAMES: Record<RoomTheme, string> = {
  general: 'ОБЩЕЕ',
  tech: 'ТЕХНО',
  gaming: 'ИГРЫ',
  music: 'МУЗЫКА',
  art: 'ИСКУССТВО',
  sports: 'СПОРТ',
};

export const ROOM_BADGES: Record<RoomBadge, { icon: string; label: string }> = {
  none: { icon: '', label: 'БЕЗ ЗНАЧКА' },
  adult: { icon: '18+', label: '18+' },
  music: { icon: '🎵', label: 'МУЗЫКА' },
  video: { icon: '🎬', label: 'ВИДЕО' },
};