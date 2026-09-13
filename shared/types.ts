export type Role = 'member' | 'admin' | 'superadmin';
export interface Member {
  id: string;
  name: string;
  color: string;
  bio: string;
}
export interface User extends Member {
  email: string;
  role: Role;
}
export interface Milestone {
  eventId?: string | null;
  id: string;
  title: string;
  body: string;
  date: string;
  kind: 'personal' | 'club';
  category: string;
  image: string;
  authorId: string;
  author: Member;
  participants: Member[];
  likes: number;
  liked: boolean;
}
export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  place: string;
  brief: string;
  body: string;
  image: string;
  category: string;
  capacity: number;
  attendees: number;
  joined: boolean;
}
export interface Application {
  id: string;
  nickname: string;
  realName: string;
  studentId: string;
  qq: string;
  department: string;
  note: string;
  status: 'pending' | 'contacted' | 'accepted';
  createdAt: string;
}
export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  createdAt: string;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
export interface Stats {
  members: number;
  milestones: number;
  events: number;
}

export const noteColors = ['random', 'butter', 'rose', 'sage', 'sky', 'lavender'] as const;
export type NoteColor = (typeof noteColors)[number];
export interface WallNote {
  id: number;
  body: string;
  nickname: string;
  color: NoteColor;
  isDemo: boolean;
  registered: boolean;
  createdAt: string;
  canDelete: boolean;
}
export interface WallPageData {
  items: WallNote[];
  total: number;
  nextCursor: number | null;
}

export interface MemoryChapter {
  month: string;
  count: number;
  people: number;
  cover: string;
}
export interface MemoryGroup {
  key: string;
  type: 'event' | 'day';
  eventId: string | null;
  date: string;
  title: string;
  cover: string;
  count: number;
  people: number;
  preview: Milestone[];
}
