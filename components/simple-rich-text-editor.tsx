"use client"

import { Bold, Italic, Link, List, Strikethrough } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import styles from "./rich-text-editor.module.css"

interface SimpleRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  characterLimit?: number
  showCharacterCount?: boolean
  showFormatting?: boolean
}

// Simple HTML sanitizer
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

// Function to ensure proper list structure
function ensureProperListStructure(html: string): string {
  // Create a temporary div to manipulate the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Find all ul elements
  const ulElements = tempDiv.querySelectorAll('ul');
  
  ulElements.forEach(ul => {
    // Check if the ul is empty
    if (ul.innerHTML.trim() === '') {
      // Create a list item with a non-breaking space
      const li = document.createElement('li');
      li.innerHTML = '&nbsp;';
      ul.appendChild(li);
    } else {
      // Ensure all direct text nodes are wrapped in li elements
      Array.from(ul.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          const li = document.createElement('li');
          li.textContent = node.textContent;
          ul.insertBefore(li, node);
          ul.removeChild(node);
        }
      });
      
      // Ensure all direct elements that are not li are wrapped in li
      Array.from(ul.children).forEach(child => {
        if (child.tagName.toLowerCase() !== 'li') {
          const li = document.createElement('li');
          ul.insertBefore(li, child);
          li.appendChild(child);
        }
      });
    }
  });
  
  return tempDiv.innerHTML;
}

export function SimpleRichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  characterLimit = 600,
  showCharacterCount = false,
  showFormatting = true,
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(isEmptyContent(value));
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    strikethrough: false,
    list: false,
    link: false
  });

  // Initialize content when value changes from outside
  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = value || '';
      setShowPlaceholder(isEmptyContent(value));
    }
  }, [value, isEditing]);

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

  // Update format state based on current selection
  const updateFormatState = () => {
    if (!editorRef.current || !document.queryCommandSupported('bold')) return;
    
    setFormatState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      strikethrough: document.queryCommandState('strikethrough'),
      list: document.queryCommandState('insertUnorderedList'),
      link: document.queryCommandState('createLink')
    });
  };

  // Handle selection changes to update format state
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateFormatState();
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Apply formatting
  const handleFormat = (command: string) => {
    if (!editorRef.current) return;
    
    // Focus the editor
    editorRef.current.focus();
    
    if (command === "createLink") {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      const url = prompt("Enter URL:", "https://");
      if (!url) return;
      
      if (!selectedText) {
        // No selection, ask for link text
        const linkText = prompt("Enter link text:", "Link") || "Link";
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        // Apply link to selection
        document.execCommand("createLink", false, url);
        
        // Add target="_blank" to the newly created link
        const links = editorRef.current.querySelectorAll('a');
        links.forEach(link => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });
      }
    } else if (command === "insertUnorderedList") {
      document.execCommand("insertUnorderedList", false);
      
      // Fix empty lists
      if (editorRef.current.innerHTML.includes('<ul><br></ul>')) {
        editorRef.current.innerHTML = editorRef.current.innerHTML.replace('<ul><br></ul>', '<ul><li><br></li></ul>');
      }
    } else {
      // Apply standard formatting (bold, italic, etc.)
      document.execCommand(command, false);
    }
    
    // Update content
    const content = editorRef.current.innerHTML;
    const sanitized = sanitizeHtml(content);
    onChange(sanitized);
    
    // Update format state
    updateFormatState();
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
      // Fix empty lists
      let fixedContent = content;
      if (fixedContent.includes('<ul><br></ul>')) {
        fixedContent = fixedContent.replace('<ul><br></ul>', '<ul><li><br></li></ul>');
        editorRef.current.innerHTML = fixedContent;
      }
      
      onChange(sanitizeHtml(fixedContent));
    }
    
    // Update format state
    updateFormatState();
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'b': // Bold
          e.preventDefault();
          handleFormat('bold');
          return;
        case 'i': // Italic
          e.preventDefault();
          handleFormat('italic');
          return;
        case 'u': // Underline
          e.preventDefault();
          handleFormat('underline');
          return;
        case 'k': // Link
          e.preventDefault();
          handleFormat('createLink');
          return;
      }
    }
    
    // Handle Enter in empty list items to exit the list
    if (e.key === 'Enter' && !e.shiftKey) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      // Check if we're in a list item
      const range = selection.getRangeAt(0);
      let node = range.startContainer;
      let listItem = null;
      
      // Find the list item parent
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'LI') {
          listItem = node;
          break;
        }
        node = node.parentNode as Node;
      }
      
      // If we're in an empty list item, exit the list
      if (listItem && (!listItem.textContent || listItem.textContent.trim() === '')) {
        e.preventDefault();
        document.execCommand('insertParagraph', false);
        document.execCommand('outdent', false);
        updateFormatState();
        handleInput();
      }
    }
  };

  const characterCount = value.length;

  return (
    <div className={cn("relative group", className)}>
      <div className="space-y-2">
        {showFormatting && (
          <div className="flex items-center space-x-1 mb-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 p-0 ${formatState.bold ? "bg-primary/20 text-primary" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                handleFormat("bold");
              }}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 p-0 ${formatState.italic ? "bg-primary/20 text-primary" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                handleFormat("italic");
              }}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 p-0 ${formatState.strikethrough ? "bg-primary/20 text-primary" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                handleFormat("strikethrough");
              }}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 p-0 ${formatState.list ? "bg-primary/20 text-primary" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                handleFormat("insertUnorderedList");
              }}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 p-0 ${formatState.link ? "bg-primary/20 text-primary" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                handleFormat("createLink");
              }}
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>
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
            style={{
              userSelect: 'text',
              WebkitUserSelect: 'text',
              MozUserSelect: 'text',
              msUserSelect: 'text',
              cursor: 'text',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
            onFocus={() => {
              setIsEditing(true);
              if (showPlaceholder && editorRef.current) {
                editorRef.current.innerHTML = '';
              }
              updateFormatState();
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
                  onChange(sanitizeHtml(content));
                }
              }
            }}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
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