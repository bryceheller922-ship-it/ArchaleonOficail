import type { BusinessListing } from "@/types";

export const mockListings: BusinessListing[] = [
  {
    id: "1",
    name: "CloudSync SaaS Platform",
    description:
      "Enterprise cloud synchronization platform with 2,400 active subscribers. Fully automated infrastructure on AWS with 99.9% uptime. Strong B2B customer base with average contract value of $2,400/yr. Includes proprietary sync algorithm and 3 patents pending.",
    location: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    price: 2400000,
    revenue: 840000,
    profit: 320000,
    category: "SaaS",
    ownerId: "owner1",
    ownerName: "Tech Ventures LLC",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "GreenLeaf E-Commerce",
    description:
      "Sustainable products e-commerce store with established brand presence and 45K monthly visitors. Dropship model with 62% gross margins. Strong SEO rankings and active social media following of 120K+. Includes all inventory relationships and brand assets.",
    location: "Austin, TX",
    lat: 30.2672,
    lng: -97.7431,
    price: 850000,
    revenue: 1200000,
    profit: 180000,
    category: "E-Commerce",
    ownerId: "owner2",
    ownerName: "Green Holdings",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "DataPulse Analytics",
    description:
      "B2B analytics dashboard serving 340 enterprise clients. Recurring revenue model with 94% retention rate. Built on modern stack (React, Python, PostgreSQL). Team of 8 engineers included in acquisition. Annual contracts with Fortune 500 companies.",
    location: "New York, NY",
    lat: 40.7128,
    lng: -74.006,
    price: 5200000,
    revenue: 2100000,
    profit: 890000,
    category: "Analytics",
    ownerId: "owner3",
    ownerName: "Pulse Enterprises",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "FitCore Gym Chain",
    description:
      "Three-location fitness chain in Denver metro area. Combined 4,200 active memberships with strong retention. Each location fully equipped with modern equipment. Lease terms favorable with 5+ years remaining. Includes branded app with 8K downloads.",
    location: "Denver, CO",
    lat: 39.7392,
    lng: -104.9903,
    price: 1800000,
    revenue: 2400000,
    profit: 420000,
    category: "Fitness",
    ownerId: "owner4",
    ownerName: "Core Fitness Group",
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "PixelForge Design Agency",
    description:
      "Award-winning design agency specializing in fintech and crypto branding. 15 active retainer clients generating predictable monthly revenue. Team of 6 designers and 2 project managers. Portfolio includes work for 3 unicorn startups.",
    location: "Miami, FL",
    lat: 25.7617,
    lng: -80.1918,
    price: 1200000,
    revenue: 960000,
    profit: 340000,
    category: "Agency",
    ownerId: "owner5",
    ownerName: "Forge Creative Inc",
    createdAt: new Date(),
  },
  {
    id: "6",
    name: "AutoFlow Logistics",
    description:
      "Last-mile delivery optimization platform serving 85 logistics companies. AI-powered route optimization reduces delivery costs by 23% on average. SaaS model with API integrations to major shipping platforms. MRR of $95K growing 12% MoM.",
    location: "Chicago, IL",
    lat: 41.8781,
    lng: -87.6298,
    price: 3800000,
    revenue: 1140000,
    profit: 560000,
    category: "Logistics",
    ownerId: "owner6",
    ownerName: "AutoFlow Inc",
    createdAt: new Date(),
  },
  {
    id: "7",
    name: "BeanCraft Coffee Roasters",
    description:
      "Specialty coffee roasting operation with DTC subscription model and wholesale distribution to 120 cafes. Processing 4,000 lbs/week with room to scale. Brand has strong following with 85K Instagram followers. Includes roasting facility and equipment.",
    location: "Portland, OR",
    lat: 45.5152,
    lng: -122.6784,
    price: 680000,
    revenue: 920000,
    profit: 145000,
    category: "Food & Beverage",
    ownerId: "owner7",
    ownerName: "BeanCraft LLC",
    createdAt: new Date(),
  },
  {
    id: "8",
    name: "SecureVault Cybersecurity",
    description:
      "Managed security service provider (MSSP) with SOC 2 Type II certification. Serving 65 SMB clients with 24/7 monitoring. Annual contracts with 97% renewal rate. Proprietary threat detection system with ML-based anomaly detection.",
    location: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    price: 4100000,
    revenue: 1800000,
    profit: 720000,
    category: "Cybersecurity",
    ownerId: "owner8",
    ownerName: "Vault Security Group",
    createdAt: new Date(),
  },
];

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}
