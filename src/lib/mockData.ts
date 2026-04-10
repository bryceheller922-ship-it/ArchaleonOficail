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

export const businesses: Business[] = [
  {
    id: "1",
    name: "Vertex Industrial Solutions",
    industry: "Manufacturing",
    sector: "Industrials",
    description: "Leading provider of precision-engineered components for aerospace and defense contractors. 15-year track record with blue-chip clientele and long-term government contracts. ITAR certified with proprietary CNC machining capabilities.",
    revenue: "$42.8M",
    ebitda: "$9.6M",
    valuation: "$86M",
    employees: 312,
    founded: 2009,
    location: "Dallas, TX",
    city: "Dallas",
    state: "TX",
    country: "USA",
    lat: 32.7767,
    lng: -96.7970,
    logo: "VI",
    tags: ["Aerospace", "Defense", "ITAR", "CNC", "Government Contracts"],
    status: "Seeking Capital",
    askingPrice: "$86M",
    grossMargin: "38.2%",
    yoyGrowth: "+14.7%",
    ownerName: "Marcus Holt",
    ownerTitle: "CEO & Founder",
    ownerAvatar: "MH",
    listedAt: "2025-01-15",
    website: "vertexindustrial.com",
    dealType: "Full Acquisition"
  },
  {
    id: "2",
    name: "Meridian Health Analytics",
    industry: "Healthcare Technology",
    sector: "Technology",
    description: "SaaS platform providing AI-driven patient outcome analytics to hospital systems. 94 enterprise clients across 22 states with 97% retention rate. Proprietary ML models trained on 50M+ patient records.",
    revenue: "$18.4M",
    ebitda: "$5.2M",
    valuation: "$130M",
    employees: 89,
    founded: 2017,
    location: "Boston, MA",
    city: "Boston",
    state: "MA",
    country: "USA",
    lat: 42.3601,
    lng: -71.0589,
    logo: "MH",
    tags: ["SaaS", "AI/ML", "Healthcare", "Analytics", "Enterprise"],
    status: "Active",
    askingPrice: "$130M",
    grossMargin: "76.4%",
    yoyGrowth: "+31.2%",
    ownerName: "Dr. Priya Nair",
    ownerTitle: "CEO",
    ownerAvatar: "PN",
    listedAt: "2025-01-22",
    website: "meridianhealth.ai",
    dealType: "Growth Equity"
  },
  {
    id: "3",
    name: "Cascade Logistics Group",
    industry: "Logistics & Supply Chain",
    sector: "Transportation",
    description: "Regional last-mile logistics provider with 18 distribution centers across the Pacific Northwest. Proprietary route optimization software reduces delivery costs by 23%. Strong Amazon and Walmart partnerships.",
    revenue: "$67.3M",
    ebitda: "$11.8M",
    valuation: "$95M",
    employees: 824,
    founded: 2011,
    location: "Seattle, WA",
    city: "Seattle",
    state: "WA",
    country: "USA",
    lat: 47.6062,
    lng: -122.3321,
    logo: "CL",
    tags: ["Last-Mile", "Logistics", "Supply Chain", "E-commerce", "Regional"],
    status: "Under LOI",
    askingPrice: "$95M",
    grossMargin: "29.1%",
    yoyGrowth: "+22.4%",
    ownerName: "Derek Vanstone",
    ownerTitle: "President",
    ownerAvatar: "DV",
    listedAt: "2025-02-03",
    website: "cascadelogistics.com",
    dealType: "Full Acquisition"
  },
  {
    id: "4",
    name: "Apex Financial Technologies",
    industry: "Fintech",
    sector: "Financial Services",
    description: "B2B payments infrastructure serving community banks and credit unions. Processing $2.4B in annual transaction volume with 99.98% uptime SLA. Core banking integration with 47 legacy systems.",
    revenue: "$31.7M",
    ebitda: "$14.2M",
    valuation: "$215M",
    employees: 143,
    founded: 2014,
    location: "Chicago, IL",
    city: "Chicago",
    state: "IL",
    country: "USA",
    lat: 41.8781,
    lng: -87.6298,
    logo: "AF",
    tags: ["Fintech", "Payments", "B2B", "Banking", "Infrastructure"],
    status: "Active",
    askingPrice: "$215M",
    grossMargin: "81.7%",
    yoyGrowth: "+28.9%",
    ownerName: "James Wilder",
    ownerTitle: "CEO",
    ownerAvatar: "JW",
    listedAt: "2025-01-08",
    website: "apexfintech.io",
    dealType: "Recapitalization"
  },
  {
    id: "5",
    name: "SolarEdge Commercial Systems",
    industry: "Clean Energy",
    sector: "Energy",
    description: "Commercial and industrial solar installation and maintenance company serving Fortune 500 clients. 340+ completed projects totaling 890MW of installed capacity. Long-term O&M contracts provide recurring revenue.",
    revenue: "$54.1M",
    ebitda: "$8.7M",
    valuation: "$72M",
    employees: 491,
    founded: 2013,
    location: "Phoenix, AZ",
    city: "Phoenix",
    state: "AZ",
    country: "USA",
    lat: 33.4484,
    lng: -112.0740,
    logo: "SC",
    tags: ["Solar", "Clean Energy", "Commercial", "ESG", "Renewable"],
    status: "Seeking Capital",
    askingPrice: "$72M",
    grossMargin: "34.8%",
    yoyGrowth: "+19.3%",
    ownerName: "Elena Rodriguez",
    ownerTitle: "CEO & Co-Founder",
    ownerAvatar: "ER",
    listedAt: "2025-02-11",
    website: "solaredgecommercial.com",
    dealType: "Growth Equity"
  },
  {
    id: "6",
    name: "Pinnacle Defense Contractors",
    industry: "Defense",
    sector: "Industrials",
    description: "Specialized electronic warfare systems manufacturer with active DoD contracts worth $340M. Top Secret facility clearance with classified product lines. Strategic importance to national security infrastructure.",
    revenue: "$89.4M",
    ebitda: "$22.1M",
    valuation: "$380M",
    employees: 567,
    founded: 2001,
    location: "Arlington, VA",
    city: "Arlington",
    state: "VA",
    country: "USA",
    lat: 38.8816,
    lng: -77.0910,
    logo: "PD",
    tags: ["Defense", "Electronic Warfare", "DoD", "Classified", "National Security"],
    status: "Active",
    askingPrice: "$380M",
    grossMargin: "41.3%",
    yoyGrowth: "+11.8%",
    ownerName: "Col. Robert Farris (Ret.)",
    ownerTitle: "Executive Chairman",
    ownerAvatar: "RF",
    listedAt: "2025-01-30",
    website: "pinnacledefense.com",
    dealType: "Partial Stake"
  },
  {
    id: "7",
    name: "NovaBio Research Labs",
    industry: "Biotechnology",
    sector: "Healthcare",
    description: "Clinical-stage biotech with 3 compounds in Phase II trials targeting rare oncological diseases. $180M in NIH and private grants. Strategic partnerships with Pfizer and AstraZeneca for co-development.",
    revenue: "$12.3M",
    ebitda: "-$4.8M",
    valuation: "$290M",
    employees: 178,
    founded: 2016,
    location: "San Diego, CA",
    city: "San Diego",
    state: "CA",
    country: "USA",
    lat: 32.7157,
    lng: -117.1611,
    logo: "NB",
    tags: ["Biotech", "Oncology", "Phase II", "NIH", "Drug Development"],
    status: "Seeking Capital",
    askingPrice: "$290M",
    grossMargin: "N/A",
    yoyGrowth: "+67.4%",
    ownerName: "Dr. Aisha Kamara",
    ownerTitle: "CEO & Chief Scientist",
    ownerAvatar: "AK",
    listedAt: "2025-02-18",
    website: "novabiolabs.com",
    dealType: "Venture / Growth"
  },
  {
    id: "8",
    name: "Granite Capital Real Estate",
    industry: "Commercial Real Estate",
    sector: "Real Estate",
    description: "Owner-operator of 2.3M sq ft of Class A commercial real estate across 8 major markets. 93% occupancy rate with weighted average lease term of 7.2 years. Institutional-quality asset management.",
    revenue: "$38.9M",
    ebitda: "$24.6M",
    valuation: "$520M",
    employees: 62,
    founded: 2005,
    location: "New York, NY",
    city: "New York",
    state: "NY",
    country: "USA",
    lat: 40.7128,
    lng: -74.0060,
    logo: "GC",
    tags: ["CRE", "Class A", "Institutional", "Multi-Market", "NNN Leases"],
    status: "Active",
    askingPrice: "$520M",
    grossMargin: "63.2%",
    yoyGrowth: "+8.4%",
    ownerName: "Thomas Whitfield",
    ownerTitle: "Managing Partner",
    ownerAvatar: "TW",
    listedAt: "2025-01-05",
    website: "granitecapitalre.com",
    dealType: "Portfolio Sale"
  }
];

export const professionals: Professional[] = [
  {
    id: "p1",
    name: "Sarah Chen",
    title: "Managing Director",
    company: "BlackRock Private Equity",
    industry: "Private Equity",
    location: "New York, NY",
    avatar: "SC",
    connections: 847,
    bio: "15+ years in PE with focus on tech-enabled services and healthcare. Led 23 platform acquisitions with combined enterprise value of $4.2B.",
    tags: ["LBO", "Healthcare", "Tech-Enabled Services", "M&A"],
    isConnected: false,
    isPending: false
  },
  {
    id: "p2",
    name: "David Okafor",
    title: "Partner",
    company: "KKR",
    industry: "Private Equity",
    location: "San Francisco, CA",
    avatar: "DO",
    connections: 1243,
    bio: "Focused on infrastructure and energy transition investments. $8B+ in deal experience across North America and Europe.",
    tags: ["Infrastructure", "Energy Transition", "ESG", "Cross-Border"],
    isConnected: true,
    isPending: false
  },
  {
    id: "p3",
    name: "Jennifer Walsh",
    title: "VP of Corporate Development",
    company: "Carlyle Group",
    industry: "Private Equity",
    location: "Washington, DC",
    avatar: "JW",
    connections: 562,
    bio: "Sourcing and executing middle-market acquisitions in industrials and defense sectors. Former Goldman Sachs M&A.",
    tags: ["Middle Market", "Industrials", "Defense", "Deal Sourcing"],
    isConnected: false,
    isPending: true
  },
  {
    id: "p4",
    name: "Michael Torres",
    title: "Chief Investment Officer",
    company: "Apollo Global Management",
    industry: "Alternative Investments",
    location: "New York, NY",
    avatar: "MT",
    connections: 2104,
    bio: "Overseeing $95B in AUM across credit, equity and real assets. Pioneering AI-driven due diligence frameworks.",
    tags: ["Credit", "Real Assets", "AI Due Diligence", "AUM Growth"],
    isConnected: false,
    isPending: false
  },
  {
    id: "p5",
    name: "Rachel Goldstein",
    title: "Principal",
    company: "TPG Capital",
    industry: "Growth Equity",
    location: "Fort Worth, TX",
    avatar: "RG",
    connections: 734,
    bio: "Growth equity investing in software, fintech, and digital health. Board observer at 7 portfolio companies.",
    tags: ["Growth Equity", "SaaS", "Fintech", "Digital Health"],
    isConnected: false,
    isPending: false
  },
  {
    id: "p6",
    name: "Alexander Petrov",
    title: "Senior Director, M&A",
    company: "Warburg Pincus",
    industry: "Private Equity",
    location: "Chicago, IL",
    avatar: "AP",
    connections: 918,
    bio: "Specializing in founder-led business acquisitions and management buyouts in fragmented industries.",
    tags: ["MBO", "Founder-Led", "Fragmented Markets", "Buy & Build"],
    isConnected: true,
    isPending: false
  },
  {
    id: "p7",
    name: "Naomi Blackwell",
    title: "CEO",
    company: "Summit Bridge Capital",
    industry: "Family Office",
    location: "Boston, MA",
    avatar: "NB",
    connections: 1567,
    bio: "Family office principal deploying $2B in direct investments. Focus on generational businesses and succession planning.",
    tags: ["Family Office", "Direct Investment", "Succession", "UHNW"],
    isConnected: false,
    isPending: false
  },
  {
    id: "p8",
    name: "Connor Harrington",
    title: "Managing Partner",
    company: "Meridian PE Partners",
    industry: "Private Equity",
    location: "Austin, TX",
    avatar: "CH",
    connections: 445,
    bio: "Lower middle market specialist. 40+ completed transactions in B2B services and light manufacturing.",
    tags: ["Lower Middle Market", "B2B Services", "Manufacturing", "Value Creation"],
    isConnected: false,
    isPending: false
  }
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    participants: ["user", "p1"],
    participantNames: ["You", "Sarah Chen"],
    participantAvatars: ["U", "SC"],
    lastMessage: "I'd be very interested in reviewing the CIM for Vertex Industrial. Can you send it over?",
    lastMessageTime: "2025-02-20T14:32:00Z",
    unread: 2,
    businessName: "Vertex Industrial Solutions"
  },
  {
    id: "c2",
    participants: ["user", "p2"],
    participantNames: ["You", "David Okafor"],
    participantAvatars: ["U", "DO"],
    lastMessage: "The SolarEdge deal looks compelling from a ESG mandate perspective. Let's set up a call.",
    lastMessageTime: "2025-02-19T09:15:00Z",
    unread: 0,
    businessName: "SolarEdge Commercial Systems"
  },
  {
    id: "c3",
    participants: ["user", "p4"],
    participantNames: ["You", "Michael Torres"],
    participantAvatars: ["U", "MT"],
    lastMessage: "Our team has completed initial screening. The EBITDA margins on Apex Fintech are outstanding.",
    lastMessageTime: "2025-02-18T16:44:00Z",
    unread: 1,
    businessName: "Apex Financial Technologies"
  },
  {
    id: "c4",
    participants: ["user", "p7"],
    participantNames: ["You", "Naomi Blackwell"],
    participantAvatars: ["U", "NB"],
    lastMessage: "Granite Capital aligns perfectly with our real asset allocation. What's the timeline?",
    lastMessageTime: "2025-02-17T11:20:00Z",
    unread: 0,
    businessName: "Granite Capital Real Estate"
  }
];

export const messageHistory: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      conversationId: "c1",
      senderId: "user",
      senderName: "You",
      senderAvatar: "U",
      text: "Hello Sarah, I wanted to reach out regarding Vertex Industrial Solutions listed on Archaleon. We believe it aligns well with your portfolio thesis.",
      timestamp: "2025-02-20T13:45:00Z",
      read: true
    },
    {
      id: "m2",
      conversationId: "c1",
      senderId: "p1",
      senderName: "Sarah Chen",
      senderAvatar: "SC",
      text: "Thank you for reaching out. The aerospace & defense angle is very interesting to us. What's the customer concentration look like?",
      timestamp: "2025-02-20T14:10:00Z",
      read: true
    },
    {
      id: "m3",
      conversationId: "c1",
      senderId: "user",
      senderName: "You",
      senderAvatar: "U",
      text: "Top 5 customers represent 43% of revenue, with 3 of those being direct DoD contractors. The remaining book is highly diversified.",
      timestamp: "2025-02-20T14:22:00Z",
      read: true
    },
    {
      id: "m4",
      conversationId: "c1",
      senderId: "p1",
      senderName: "Sarah Chen",
      senderAvatar: "SC",
      text: "I'd be very interested in reviewing the CIM for Vertex Industrial. Can you send it over?",
      timestamp: "2025-02-20T14:32:00Z",
      read: false
    }
  ],
  c2: [
    {
      id: "m5",
      conversationId: "c2",
      senderId: "p2",
      senderName: "David Okafor",
      senderAvatar: "DO",
      text: "I saw SolarEdge Commercial Systems on Archaleon. Very impressive installed base.",
      timestamp: "2025-02-19T08:55:00Z",
      read: true
    },
    {
      id: "m6",
      conversationId: "c2",
      senderId: "user",
      senderName: "You",
      senderAvatar: "U",
      text: "Yes, they've been on a strong growth trajectory. The O&M recurring contracts provide excellent visibility.",
      timestamp: "2025-02-19T09:02:00Z",
      read: true
    },
    {
      id: "m7",
      conversationId: "c2",
      senderId: "p2",
      senderName: "David Okafor",
      senderAvatar: "DO",
      text: "The SolarEdge deal looks compelling from a ESG mandate perspective. Let's set up a call.",
      timestamp: "2025-02-19T09:15:00Z",
      read: true
    }
  ],
  c3: [
    {
      id: "m8",
      conversationId: "c3",
      senderId: "user",
      senderName: "You",
      senderAvatar: "U",
      text: "Michael, would Apollo be interested in exploring Apex Financial Technologies? 81.7% gross margins with $2.4B in processing volume.",
      timestamp: "2025-02-18T15:30:00Z",
      read: true
    },
    {
      id: "m9",
      conversationId: "c3",
      senderId: "p4",
      senderName: "Michael Torres",
      senderAvatar: "MT",
      text: "Passing this to our fintech team now. The community bank vertical is one we've been actively monitoring.",
      timestamp: "2025-02-18T16:12:00Z",
      read: true
    },
    {
      id: "m10",
      conversationId: "c3",
      senderId: "p4",
      senderName: "Michael Torres",
      senderAvatar: "MT",
      text: "Our team has completed initial screening. The EBITDA margins on Apex Fintech are outstanding.",
      timestamp: "2025-02-18T16:44:00Z",
      read: false
    }
  ],
  c4: [
    {
      id: "m11",
      conversationId: "c4",
      senderId: "user",
      senderName: "You",
      senderAvatar: "U",
      text: "Naomi, I thought Granite Capital might be of interest given your family office's real asset allocation.",
      timestamp: "2025-02-17T10:50:00Z",
      read: true
    },
    {
      id: "m12",
      conversationId: "c4",
      senderId: "p7",
      senderName: "Naomi Blackwell",
      senderAvatar: "NB",
      text: "Granite Capital aligns perfectly with our real asset allocation. What's the timeline?",
      timestamp: "2025-02-17T11:20:00Z",
      read: true
    }
  ]
};
