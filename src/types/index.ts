export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  credits: number;
  createdAt: any;
}

export interface BusinessListing {
  id: string;
  name: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  price: number;
  revenue: number;
  profit: number;
  category: string;
  imageUrl?: string;
  ownerId: string;
  ownerName: string;
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  threadId: string;
  content: string;
  timestamp: any;
  read: boolean;
}

export interface MessageThread {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: Record<string, number>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Folder {
  id: string;
  name: string;
  projectId: string;
  userId: string;
  createdAt: any;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  projectId: string;
  userId: string;
  links: string[];
  createdAt: any;
  updatedAt: any;
}

export interface AINode {
  id: string;
  type: "user" | "ai" | "tool" | "thinking" | "browser";
  content: string;
  x: number;
  y: number;
  parentId?: string;
  status: "pending" | "active" | "complete" | "error";
  timestamp: number;
  browserUrl?: string;
  browserScreenshot?: string;
  angle?: number;
  ring?: number;
}

export interface AIConnection {
  from: string;
  to: string;
}

export interface BrowserState {
  url: string;
  title: string;
  screenshot: string;
  isLoading: boolean;
  logs: string[];
}
