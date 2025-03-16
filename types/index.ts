// Define valid color theme values
export type ColorTheme = "default" | "blue" | "green" | "purple" | "red" | "orange" | "teal";

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
  date?: string;
  description?: string;
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
}

// Color theme mapping
export const themeColors: Record<ColorTheme, string> = {
  default: "#000000",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  red: "#EF4444",
  orange: "#F97316",
  teal: "#14B8A6",
}; 