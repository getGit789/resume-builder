"use client"

import { useEffect, useMemo, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes, $createParagraphNode, $createTextNode } from "lexical";
import { cn } from "@/lib/utils";
import { RichTextEditorToolbar } from "./rich-text-editor-toolbar";
import { AISuggestionPlugin } from "./ai-suggestion-plugin";

// Import all necessary node types
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";

// Error boundary component
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[200px] rounded-md border border-destructive bg-destructive/10 p-4">
      <div className="text-sm text-destructive">
        Something went wrong. Please try refreshing the page.
      </div>
      {children}
    </div>
  );
}

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  className?: string;
  placeholder?: string;
  fieldType?: 'summary' | 'description' | 'skills';
  jobTitle?: string;
}

// Plugin to handle content changes - optimized with useCallback
function OnChangePlugin({ onChange }: { onChange?: (content: string) => void }) {
  const [editor] = useLexicalComposerContext();

  // Use a stable reference for the onChange callback
  const onChangeRef = useCallback((editorState: any) => {
    editorState.read(() => {
      const content = JSON.stringify(editorState.toJSON());
      onChange?.(content);
    });
  }, [onChange]);

  useEffect(() => {
    // Only register the listener once
    return editor.registerUpdateListener(({ editorState }) => {
      // Skip updates that don't affect content
      if (!editor.isComposing()) {
        onChangeRef(editorState);
      }
    });
  }, [editor, onChangeRef]);

  return null;
}

// Initial content plugin - optimized to only run once on mount
function InitialContentPlugin({ content }: { content?: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!content) return;

    try {
      // Attempt to parse the stored content
      const parsedContent = JSON.parse(content);
      const editorState = editor.parseEditorState(parsedContent);
      editor.setEditorState(editorState);
    } catch (e) {
      console.warn('Failed to parse editor state:', e);
      
      // Create a fallback editor state with the content as plain text
      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        
        // If we have content, add it as plain text
        if (content && typeof content === 'string') {
          try {
            // Try to extract text content from JSON if possible
            const parsedContent = JSON.parse(content);
            const textContent = typeof parsedContent === 'object' && parsedContent.root && 
                              parsedContent.root.children ? 
                              extractTextFromNodes(parsedContent.root.children) : 
                              content;
            paragraph.append($createTextNode(textContent));
          } catch {
            // If all else fails, just use the content string directly
            paragraph.append($createTextNode(content));
          }
        }
        
        root.append(paragraph);
      });
    }
    // Only run on initial mount or if content ref changes
  }, [editor]); // Remove content dependency

  return null;
}

// Helper function to extract text from node structure
function extractTextFromNodes(nodes: any[]): string {
  if (!Array.isArray(nodes)) return '';
  
  return nodes.map(node => {
    if (node.text) return node.text;
    if (node.children) return extractTextFromNodes(node.children);
    return '';
  }).join(' ');
}

// Create a stabilized ContentEditable component
const StableContentEditable = () => (
  <ContentEditable className="min-h-[200px] px-3 py-2 outline-none" />
);

// Create a stabilized placeholder component
const StablePlaceholder = ({ placeholder }: { placeholder: string }) => (
  <div className="absolute top-12 left-3 text-muted-foreground pointer-events-none select-none">
    {placeholder}
  </div>
);

export function RichTextEditor({
  initialContent = "",
  onChange,
  className,
  placeholder = "Enter some text...",
  fieldType,
  jobTitle,
}: RichTextEditorProps) {
  // Memoize the editor configuration to prevent unnecessary re-renders
  const initialConfig = useMemo(() => ({
    namespace: `ResumeBuilder-${fieldType || 'default'}`,
    editorState: initialContent ? undefined : undefined,
    theme: {
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
      },
      heading: {
        h1: "text-2xl font-bold",
        h2: "text-xl font-bold",
        h3: "text-lg font-bold",
      },
      list: {
        ul: "list-disc list-inside",
        ol: "list-decimal list-inside",
      },
      quote: "border-l-4 border-gray-200 pl-4 italic",
      code: "bg-gray-100 rounded px-1 font-mono text-sm",
    },
    nodes: [
      // Text formatting nodes
      HeadingNode,
      QuoteNode,
      
      // List nodes
      ListNode,
      ListItemNode,
      
      // Link nodes
      LinkNode,
      AutoLinkNode,
      
      // Code nodes
      CodeNode,
      CodeHighlightNode,
    ],
    onError: (error: Error) => {
      console.error("Editor error:", error);
    },
  }), [fieldType]); // Only depend on fieldType to prevent recreation

  const memoizedPlaceholder = useMemo(() => <StablePlaceholder placeholder={placeholder} />, [placeholder]);
  const memoizedContentEditable = useMemo(() => <StableContentEditable />, []);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={cn("relative min-h-[200px] rounded-md border", className)}>
        <div className="flex items-center justify-between border-b">
          <RichTextEditorToolbar className="border-b-0 flex-1" />
          {fieldType && jobTitle && (
            <div className="border-l h-8 flex items-center px-2">
              <AISuggestionPlugin fieldType={fieldType} jobTitle={jobTitle} />
            </div>
          )}
        </div>
        <RichTextPlugin
          contentEditable={memoizedContentEditable}
          placeholder={memoizedPlaceholder}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={onChange} />
        {initialContent && <InitialContentPlugin content={initialContent} />}
      </div>
    </LexicalComposer>
  );
}
