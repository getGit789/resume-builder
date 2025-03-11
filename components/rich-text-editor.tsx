"use client"

import { Bold, Italic, Link2, List, Strikethrough } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import styles from "./rich-text-editor.module.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  characterLimit?: number
  showCharacterCount?: boolean
  showFormatting?: boolean
}

const ALLOWED_TAGS = [
  'p', 'div', 'span', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li',
  'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'mark'
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'id', 'style'];

const sanitizeHtml = (html: string) => {
  if (!html) return '';
  
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove potentially dangerous elements
  const scripts = tempDiv.querySelectorAll('script, iframe, object, embed, style');
  scripts.forEach(el => el.remove());
  
  // Ensure links have proper attributes
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  
  return tempDiv.innerHTML;
};

const isEmptyContent = (content: string) => {
  if (!content) return true;
  
  // Clean up HTML tags and entities
  const cleaned = content
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<p><\/p>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
    
  return cleaned === '';
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  characterLimit = 600,
  showCharacterCount = false,
  showFormatting = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(isEmptyContent(value));
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false
  });

  // Update format state based on current selection
  const updateFormatState = () => {
    if (document.queryCommandSupported('bold')) {
      setFormatState({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        list: document.queryCommandState('insertUnorderedList')
      });
    }
  };

  // Handle selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (isEditing) {
        updateFormatState();
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isEditing]);

  // Handle paste events to clean formatting
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('paste', handlePaste);
    }
    
    return () => {
      if (editor) {
        editor.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  // Initialize content when value changes from outside
  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = value || '';
      setShowPlaceholder(isEmptyContent(value));
    }
  }, [value, isEditing]);

  // Apply formatting
  const handleFormat = (command: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      if (command === 'createLink') {
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().length > 0;
        
        const url = window.prompt('Enter the URL:');
        if (!url) return;
        
        if (!hasSelection) {
          const linkText = window.prompt('Enter link text:', 'Link text') || 'Link text';
          document.execCommand('insertHTML', false, 
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
        } else {
          document.execCommand(command, false, url);
          
          // Ensure links have target and rel attributes
          const links = editorRef.current.querySelectorAll('a');
          links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          });
        }
      } else {
        document.execCommand(command, false);
      }
      
      // Update format state after applying formatting
      updateFormatState();
      
      // Update the value
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        const sanitized = sanitizeHtml(content);
        onChange(sanitized);
      }
    } catch (error) {
      console.error('Formatting error:', error);
    }
  };

  // Handle content changes
  const handleInput = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const isEmpty = isEmptyContent(content);
    
    setShowPlaceholder(isEmpty);
    
    if (isEmpty) {
      onChange('');
    } else {
      onChange(content);
    }
  };

  const characterCount = value.length;

  return (
    <div className={cn("relative group", className)}>
      <div className="space-y-2">
        {showFormatting && (
          <div className="flex items-center gap-1 pb-2">
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                title="Bold"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat("bold");
                }}
                className={formatState.bold ? "bg-muted" : ""}
              >
                <Bold className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                title="Italic"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat("italic");
                }}
                className={formatState.italic ? "bg-muted" : ""}
              >
                <Italic className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                title="Strikethrough"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat("strikethrough");
                }}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                title="Bullet List"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat("insertUnorderedList");
                }}
                className={formatState.list ? "bg-muted" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                title="Add Link"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat("createLink");
                }}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            className={cn(
              "min-h-[100px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-ring",
              isEditing && "ring-2 ring-ring",
              styles.richTextEditor,
              className
            )}
            onFocus={() => {
              setIsEditing(true);
              if (showPlaceholder && editorRef.current) {
                editorRef.current.innerHTML = '';
              }
            }}
            onBlur={() => {
              setIsEditing(false);
              if (editorRef.current) {
                const content = editorRef.current.innerHTML;
                const isEmpty = isEmptyContent(content);
                
                if (isEmpty) {
                  editorRef.current.innerHTML = '';
                  setShowPlaceholder(true);
                  onChange('');
                } else {
                  const sanitized = sanitizeHtml(content);
                  onChange(sanitized);
                }
              }
            }}
            onInput={handleInput}
            onKeyDown={(e) => {
              // Keyboard shortcuts for formatting
              if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                switch (e.key.toLowerCase()) {
                  case 'b': // Bold
                    e.preventDefault();
                    handleFormat('bold');
                    break;
                  case 'i': // Italic
                    e.preventDefault();
                    handleFormat('italic');
                    break;
                  case 'u': // Underline
                    e.preventDefault();
                    handleFormat('underline');
                    break;
                  case 'k': // Link
                    e.preventDefault();
                    handleFormat('createLink');
                    break;
                }
              }
            }}
          />
          {showPlaceholder && placeholder && (
            <div 
              className="absolute top-3 left-3 pointer-events-none text-muted-foreground"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.focus();
                }
              }}
            >
              {placeholder}
            </div>
          )}
        </div>
        {showCharacterCount && (
          <div className="flex justify-end">
            <span className={cn("text-sm", characterCount > characterLimit ? "text-destructive" : "text-muted-foreground")}>
              {characterCount} / {characterLimit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
