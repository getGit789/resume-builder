/**
 * Resume templates configuration
 * This file defines the available templates in the application
 */

interface TemplateDefinition {
  name: string;
  description?: string;
  previewImage?: string;
  premium?: boolean;
}

export const templates: Record<string, TemplateDefinition> = {
  professional: {
    name: "Professional",
    description: "A clean and professional template suitable for most industries"
  },
  modern: {
    name: "Modern",
    description: "A modern template with a standout header section"
  },
  minimalist: {
    name: "Minimal",
    description: "A minimalist template that focuses on content"
  },
  creative: {
    name: "Creative",
    description: "A creative template for design and creative fields"
  },
  executive: {
    name: "Executive",
    description: "A sophisticated template for senior positions"
  }
} 