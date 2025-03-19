declare module 'languagetool-api' {
  interface LanguageToolMatch {
    message: string;
    shortMessage: string;
    offset: number;
    length: number;
    replacements: { value: string }[];
    context: {
      text: string;
      offset: number;
      length: number;
    };
    sentence: string;
    type: {
      typeName: string;
    };
    rule: {
      id: string;
      description: string;
      issueType: string;
      category: {
        id: string;
        name: string;
      };
    };
  }

  interface LanguageToolResponse {
    software: {
      name: string;
      version: string;
      buildDate: string;
      apiVersion: number;
      premium: boolean;
      premiumHint: string;
      status: string;
    };
    language: {
      name: string;
      code: string;
      detectedLanguage: {
        name: string;
        code: string;
        confidence: number;
      };
    };
    matches: LanguageToolMatch[];
  }

  interface CheckOptions {
    language?: string;
    text?: string;
    motherTongue?: string;
    preferredVariants?: string[];
    enabledRules?: string[];
    disabledRules?: string[];
    enabledCategories?: string[];
    disabledCategories?: string[];
  }

  export function check(text: string, options?: CheckOptions): Promise<LanguageToolResponse>;
} 