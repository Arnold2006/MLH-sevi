export interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  serviceArea: string;
  hours: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  heroImagePosition: string;
  aboutHeadline: string;
  aboutText: string;
  aboutImage: string;
  aboutImagePosition: string;
  statYears: string;
  statJobs: string;
  ctaHeadline: string;
  ctaText: string;
}

export interface Service {
  id: string;
  order: number;
  title: string;
  description: string;
  rate: string;
}

export interface GalleryItem {
  id: string;
  images: string[];
  title: string;
  description: string;
  category: string;
  addedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  read: boolean;
}
