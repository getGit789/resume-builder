import { useAuthStore } from "@/store/use-auth-store";
import { AuthUser } from "@/types/resume";

/**
 * Defines which features are available to users based on authentication status
 */
export interface FeatureAccess {
  // Core features (available to all users)
  createResume: boolean;
  editResume: boolean;
  chooseTemplate: boolean;
  customizeColors: boolean;
  customizeFonts: boolean;
  exportPDF: boolean;
  exportDOCX: boolean;
  
  // Premium features (available only to authenticated users)
  autoSave: boolean;
  atsCheck: boolean;
  aiSuggestions: boolean;
  grammarCheck: boolean;
  multipleVersions: boolean;
  shareResumes: boolean;
  exportGoogleDocs: boolean;
}

/**
 * Returns feature access object based on user authentication status
 */
export function getUserFeatureAccess(user: AuthUser | null): FeatureAccess {
  // User must be authenticated AND not be a guest user to access premium features
  const isAuthenticatedUser = Boolean(user && !user.isGuest);
  
  return {
    // Core features
    createResume: true,
    editResume: true,
    chooseTemplate: true,
    customizeColors: true,
    customizeFonts: true,
    exportPDF: true,
    exportDOCX: true,
    
    // Premium features
    autoSave: isAuthenticatedUser,
    atsCheck: isAuthenticatedUser,
    aiSuggestions: isAuthenticatedUser,
    grammarCheck: isAuthenticatedUser,
    multipleVersions: isAuthenticatedUser,
    shareResumes: isAuthenticatedUser,
    exportGoogleDocs: isAuthenticatedUser,
  };
}

/**
 * Checks if a specific feature is available to the user
 */
export function isFeatureAvailable(feature: keyof FeatureAccess, user: AuthUser | null): boolean {
  const featureAccess = getUserFeatureAccess(user);
  return featureAccess[feature];
}

/**
 * Returns a message for premium features that encourages upgrading
 */
export function getUpgradeMessage(feature: keyof FeatureAccess): string {
  const messages: Record<keyof FeatureAccess, string> = {
    // Core features
    createResume: "",
    editResume: "",
    chooseTemplate: "",
    customizeColors: "",
    customizeFonts: "",
    exportPDF: "",
    exportDOCX: "",
    
    // Premium features
    autoSave: "Sign in to enable automatic saving of your resume",
    atsCheck: "Sign in to unlock ATS compatibility checking",
    aiSuggestions: "Sign in to get AI-powered content suggestions",
    grammarCheck: "Sign in to enable advanced grammar checking",
    multipleVersions: "Sign in to create and manage multiple resume versions",
    shareResumes: "Sign in to share your resume with others",
    exportGoogleDocs: "Sign in to export your resume directly to Google Docs",
  };
  
  return messages[feature];
}

/**
 * Utility to check if a feature is premium (requires authentication)
 */
export function isPremiumFeature(feature: keyof FeatureAccess): boolean {
  return [
    "autoSave",
    "atsCheck",
    "aiSuggestions",
    "grammarCheck",
    "multipleVersions",
    "shareResumes",
    "exportGoogleDocs",
  ].includes(feature);
} 