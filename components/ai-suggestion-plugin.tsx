"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  $getRoot, 
  $createParagraphNode, 
  $createTextNode, 
  $insertNodes, 
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  createCommand
} from "lexical";
import { AISuggestionButton } from "./ai-suggestion-button";
import { useCallback, useEffect } from "react";

// Create a custom command to handle suggestions
export const INSERT_AI_SUGGESTION_COMMAND = createCommand('INSERT_AI_SUGGESTION_COMMAND');

interface AISuggestionPluginProps {
  fieldType: 'summary' | 'description' | 'skills';
  jobTitle?: string;
}

export function AISuggestionPlugin({ fieldType, jobTitle }: AISuggestionPluginProps) {
  const [editor] = useLexicalComposerContext();

  // Create a stable callback for handling suggestions
  const handleSuggestion = useCallback((suggestion: string) => {
    editor.focus();
    editor.dispatchCommand(INSERT_AI_SUGGESTION_COMMAND, suggestion);
  }, [editor]);

  // Register the command handler once on mount
  useEffect(() => {
    // This handler will run when the command is dispatched
    return editor.registerCommand(
      INSERT_AI_SUGGESTION_COMMAND,
      (suggestion: string) => {
        // Wrap in update to batch all changes
        editor.update(() => {
          const selection = editor.getEditorState()._selection;
          const root = $getRoot();
          
          // Check if we're at the start of the document
          const isAtStart = !selection || (
            $isRangeSelection(selection) && 
            selection.anchor && 
            selection.anchor.offset === 0
          );
          
          if (isAtStart) {
            // If at beginning or no selection, replace content
            root.clear();
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(suggestion);
            paragraph.append(textNode);
            root.append(paragraph);
          } else {
            // Otherwise, insert at current position
            const textNode = $createTextNode(suggestion);
            $insertNodes([textNode]);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);

  return (
    <div className="flex items-center justify-end">
      <AISuggestionButton 
        type={fieldType}
        jobTitle={jobTitle}
        onSelectSuggestion={handleSuggestion}
        variant="ghost"
        size="sm"
      />
    </div>
  );
} 