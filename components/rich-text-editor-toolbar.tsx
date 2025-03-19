import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  FORMAT_TEXT_COMMAND, 
  REDO_COMMAND, 
  UNDO_COMMAND, 
  TextFormatType, 
  $getSelection,
  $isRangeSelection,
  RangeSelection 
} from "lexical";
import { $isListNode, INSERT_UNORDERED_LIST_COMMAND, ListNode } from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Link2,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface RichTextEditorToolbarProps {
  className?: string;
}

export function RichTextEditorToolbar({ className }: RichTextEditorToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    list: false,
  });
  const [isTextSelected, setIsTextSelected] = useState(false);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  // Update the active formats whenever the selection changes
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    
    if (!selection) {
      setIsTextSelected(false);
      return;
    }
    
    setIsTextSelected($isRangeSelection(selection) && !selection.isCollapsed());
    
    // Only check formats for range selections
    if (!$isRangeSelection(selection)) {
      return;
    }
    
    // Get formatting from selection
    setActiveFormats({
      bold: selection.hasFormat('bold'),
      italic: selection.hasFormat('italic'),
      underline: selection.hasFormat('underline'),
      strikethrough: selection.hasFormat('strikethrough'),
      list: Boolean($findMatchingParent(selection.anchor.getNode(), (node) => $isListNode(node)))
    });
  }, []);

  // Register a listener for selection changes
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  return (
    <div className={cn("flex items-center gap-1 p-1", className)}>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          title="Undo"
          onClick={undo}
          className="h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Redo"
          onClick={redo}
          className="h-8 w-8"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex gap-1">
        <Button
          variant={activeFormats.bold ? "secondary" : "ghost"}
          size="icon"
          title="Bold"
          onClick={() => formatText("bold")}
          className="h-8 w-8"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={activeFormats.italic ? "secondary" : "ghost"}
          size="icon"
          title="Italic"
          onClick={() => formatText("italic")}
          className="h-8 w-8"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={activeFormats.underline ? "secondary" : "ghost"}
          size="icon"
          title="Underline"
          onClick={() => formatText("underline")}
          className="h-8 w-8"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant={activeFormats.strikethrough ? "secondary" : "ghost"}
          size="icon"
          title="Strikethrough"
          onClick={() => formatText("strikethrough")}
          className="h-8 w-8"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex gap-1">
        <Button
          variant={activeFormats.list ? "secondary" : "ghost"}
          size="icon"
          title="Bullet List"
          onClick={() => {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          }}
          className="h-8 w-8"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title={isTextSelected ? "Add Link" : "Select text first"}
          onClick={() => {
            if (isTextSelected) {
              const url = window.prompt("Enter the URL:");
              if (url) {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
              }
            }
          }}
          className="h-8 w-8"
          disabled={!isTextSelected}
        >
          <Link2 className={cn("h-4 w-4", !isTextSelected && "text-muted-foreground")} />
        </Button>
      </div>
    </div>
  );
} 