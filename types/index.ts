// Define valid color theme values
export type ColorTheme = "blue" | "green" | "purple" | "red" | "gray" | "black" | "orange" | "teal";

// Define the Link interface
export interface Link {
  id: string;
  title: string;
  url: string;
}

// Define the PersonalInfo interface
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

// Define the ResumeItem interface
export interface ResumeItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

// Define the ResumeSection interface
export interface ResumeSection {
  id: string;
  type?: string;
  title: string;
  items: ResumeItem[];
}

// Define the ResumeData interface
export interface ResumeData {
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  settings?: {
    font?: string;
  };
}

// Color theme mapping
export const themeColors: Record<ColorTheme | "default", string> = {
  blue: "#2563eb",
  green: "#16a34a",
  purple: "#9333ea",
  red: "#dc2626",
  gray: "#4b5563",
  black: "#000000",
  orange: "#f97316",
  teal: "#0d9488",
  default: "#2563eb",
}; 