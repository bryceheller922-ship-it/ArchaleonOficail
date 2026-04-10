export interface Business {
  id: string;
  name: string;
  industry: string;
  sector: string;
  description: string;
  revenue: string;
  ebitda: string;
  valuation: string;
  employees: number;
  founded: number;
  location: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  logo: string;
  tags: string[];
  status: "Active" | "Under LOI" | "Acquired" | "Seeking Capital";
  askingPrice: string;
  grossMargin: string;
  yoyGrowth: string;
  ownerName: string;
  ownerTitle: string;
  ownerAvatar: string;
  listedAt: string;
  website: string;
  dealType: string;
  imageUrls?: string[];
  createdBy?: string;
}

export interface Professional {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  avatar: string;
  connections: number;
  bio: string;
  tags: string[];
  isConnected: boolean;
  isPending: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars: string[];
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  businessName?: string;
}
