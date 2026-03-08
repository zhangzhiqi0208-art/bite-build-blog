import { useState, useRef, useCallback } from "react";
import { ArrowUpToLine, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CategorySortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { name: string; count: number }[];
  onSave: (reordered: { name: string; count: number }[]) => void;
}

export const CategorySortDialog = ({
  open,
  onOpenChange,
  categories,
  onSave,
}: CategorySortDialogProps) => {
  const [items, setItems] = useState(categories);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  // Reset items when dialog opens
  const handleOpenChange = (val: boolean) => {
    if (val) setItems([...categories]);
    onOpenChange(val);
  };

  const handlePinToTop = (idx: number) => {
    if (idx === 0) return;
    const newItems = [...items];
    const [item] = newItems.splice(idx, 1);
    newItems.unshift(item);
    setItems(newItems);
  };

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
    setDraggingIdx(idx);
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDraggingIdx(null);
      return;
    }
    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, draggedItem);
    setItems(newItems);
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIdx(null);
  };

  const handleSave = () => {
    onSave(items);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg flex flex-col p-0"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        <DialogHeader className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>Category sorting</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {items.map((cat, idx) => (
            <div
              key={`${cat.name}-${idx}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`flex items-center justify-between py-3 border-b border-border last:border-b-0 select-none transition-colors ${
                draggingIdx === idx
                  ? "opacity-50 bg-secondary"
                  : "bg-background"
              }`}
            >
              <span className="text-sm">{cat.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePinToTop(idx)}
                  className="rounded p-1 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Pin to top"
                >
                  <ArrowUpToLine className="h-4 w-4" />
                </button>
                <button
                  className="rounded p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 bg-background px-6 py-4 border-t border-border gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
