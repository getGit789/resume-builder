import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Section } from "@/types/resume";
import { RichTextEditor } from "./rich-text-editor";

interface SortableSectionProps {
  section: Section;
  isActive: boolean;
  onTitleChange: (value: string) => void;
  onAddItem: () => void;
  onRemoveSection: () => void;
  onItemChange: (itemId: string, field: string, value: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export function SortableSection({
  section,
  isActive,
  onTitleChange,
  onAddItem,
  onRemoveSection,
  onItemChange,
  onRemoveItem,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-2 border-primary/10 shadow-sm hover:border-primary/20 transition-all duration-200",
        isDragging && "shadow-lg scale-[1.02] cursor-grabbing",
        isActive && "border-primary"
      )}
    >
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1 rounded-md hover:bg-primary/10 cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder section"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <Input
            value={section.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none hover:bg-primary/5 focus:bg-primary/5 transition-colors duration-200 px-2 py-1 h-auto"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemoveSection}
            className="ml-auto hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Accordion type="multiple" className="space-y-4">
          {section.items.map((item, index) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-2 border-muted hover:border-primary/20 rounded-lg overflow-hidden transition-all duration-200"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-primary/5 [&[data-state=open]]:bg-primary/5 transition-colors duration-200">
                <div className="flex items-center gap-4 text-left">
                  <span className="font-medium">{item.title || `Item ${index + 1}`}</span>
                  {item.subtitle && (
                    <span className="text-sm text-muted-foreground">{item.subtitle}</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 space-y-4 bg-background/50">
                <div className="space-y-2">
                  <label htmlFor={`${item.id}-title`} className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id={`${item.id}-title`}
                    value={item.title}
                    onChange={(e) => onItemChange(item.id, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${item.id}-subtitle`} className="text-sm font-medium">
                    Subtitle
                  </label>
                  <Input
                    id={`${item.id}-subtitle`}
                    value={item.subtitle}
                    onChange={(e) => onItemChange(item.id, "subtitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${item.id}-date`} className="text-sm font-medium">
                    Date
                  </label>
                  <Input
                    id={`${item.id}-date`}
                    value={item.date}
                    onChange={(e) => onItemChange(item.id, "date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${item.id}-description`} className="text-base font-semibold">
                    Description
                  </label>
                  <RichTextEditor
                    initialContent={item.description}
                    onChange={(value) => onItemChange(item.id, "description", value)}
                    placeholder="Enter a detailed description..."
                    className="min-h-[150px]"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Item
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="w-full hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </CardContent>
    </Card>
  );
} 