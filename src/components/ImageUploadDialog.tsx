import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, FileText, SearchIcon } from "lucide-react";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelected: (file: File, previewUrl: string) => void;
}

const ImageUploadDialog = ({ open, onOpenChange, onImageSelected }: ImageUploadDialogProps) => {
  const [activeTab, setActiveTab] = useState<"store" | "gallery">("store");
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      return;
    }
    const url = URL.createObjectURL(file);
    onImageSelected(file, url);
    onOpenChange(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-base font-semibold">Select Image</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="px-6 mt-3 border-b border-border">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("store")}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === "store"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Store Photos
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === "gallery"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Platform Gallery
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {activeTab === "store" ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[hsl(48,96%,53%)] hover:bg-[hsl(48,96%,45%)] text-foreground font-medium px-6"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload from Device
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                drag and drop images here to upload
              </p>
              <p className="mt-4 text-xs text-muted-foreground text-center px-8">
                Image requirements: Support uploading images in JPG and PNG formats, with images larger than 450 × 450 and not exceeding 5M
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          ) : (
            <div>
              <div className="relative mb-4 max-w-[260px]">
                <Input
                  placeholder="Please enter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-3">
                  <div className="h-16 w-14 rounded bg-muted flex items-center justify-start pl-2 pt-3 flex-col gap-1">
                    <div className="h-1 w-8 rounded bg-muted-foreground/30" />
                    <div className="h-1 w-6 rounded bg-muted-foreground/30" />
                  </div>
                  <div className="absolute -bottom-1 -right-2 h-7 w-7 rounded-full bg-[hsl(48,96%,53%)] flex items-center justify-center">
                    <Search className="h-3.5 w-3.5 text-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">No results found</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
