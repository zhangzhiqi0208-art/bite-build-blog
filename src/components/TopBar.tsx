import { Bell, Headphones, ChevronDown } from "lucide-react";

export const TopBar = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          99
        </div>
        <span className="text-lg font-semibold text-foreground">99Food Manager</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 hover:bg-secondary">
          <Headphones className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="rounded-full p-2 hover:bg-secondary">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">David Copperfield</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};
