import { Resume as PrismaResume, User } from '@prisma/client';
import { ColorTheme } from './index';

// Extended Resume type that includes guestToken
export interface ResumeWithGuestToken extends PrismaResume {
  guestToken: string | null;
  font: string;
}

// Type for the user returned by getCurrentUser
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  isGuest?: boolean;
  guestToken?: string;
}

// Custom types for Prisma queries with guestToken
export interface ResumeWhereInput {
  guestToken?: string;
  userId?: string;
  [key: string]: any;
}

export interface ResumeSelect {
  id: boolean;
  name: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  template: boolean;
  colorTheme: boolean;
  font: boolean;
  shareToken: boolean;
  guestToken?: boolean;
  [key: string]: boolean | undefined;
}

// Resume section types
export interface Section {
  id: string;
  title: string;
  items: SectionItem[];
}

export interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

// Resume data types
export interface Resume {
  id: string;
  name: string;
  data: ResumeData;
  template: string;
  colorTheme: ColorTheme;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  shareToken?: string;
  font?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  sections: Section[];
  settings?: {
    font?: string;
  };
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  links: Link[];
}

export interface Link {
  id: string;
  title: string;
  url: string;
} 