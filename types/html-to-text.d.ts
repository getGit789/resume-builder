declare module 'html-to-text' {
  export interface Options {
    wordwrap?: number | false;
    preserveNewlines?: boolean;
    selectors?: Array<{
      selector: string;
      format?: string;
      options?: any;
    }>;
    [key: string]: any;
  }

  export function convert(html: string, options?: Options): string;
} 