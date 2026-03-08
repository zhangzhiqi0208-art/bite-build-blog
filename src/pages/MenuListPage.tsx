import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Search, Plus, Settings2, MoreHorizontal, Clock, List, Pencil, Trash2, Clock4, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TruncatedText } from "@/components/TruncatedText";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CategorySortDialog } from "@/components/CategorySortDialog";
interface MenuItem {
  id: string;
  title: string;
  image: string;
  tags: string[];
  availability?: string;
  deliveryPrice: string;
  pickupPrice: string;
  stock: string;
  status: boolean;
  addOns?: AddOnGroup[];
}

interface AddOnGroup {
  name: string;
  required: boolean;
  items: {
    name: string;
    deliveryPrice: string;
    pickupPrice: string;
    stock: string;
    status: boolean;
    warning?: string;
  }[];
}

const initialCategories = [
  { name: "Os Burgers Mais Pedidos da 99", count: 5 },
  { name: "Combos Irresistíveis", count: 4 },
  { name: "Edição Limitada - Prove Antes Que Acabe", count: 1 },
  { name: "Escolhas Impossíveis de Errar", count: 6 },
  { name: "Originais N! Burger - So A Gente Tem", count: 2 },
  { name: "Clássicos - Não Tem Como Errar!", count: 4 },
  { name: "Acompanhamentos", count: 4 },
  { name: "Vai Um Docinho Aí", count: 1 },
];

const itemsByCategory: Record<number, MenuItem[]> = {
  0: [ // Os Burgers Mais Pedidos da 99 - 5 items
    { id: "0-1", title: "Smash Burger Duplo 200g", image: "🍔", tags: ["In marketing activities"], deliveryPrice: "R$32.90", pickupPrice: "R$28.90", stock: "Unlimited", status: true, addOns: [] },
    { id: "0-2", title: "Smash Burger Triplo 300g", image: "🍔", tags: [], deliveryPrice: "R$42.90", pickupPrice: "R$38.90", stock: "500", status: true, addOns: [] },
    { id: "0-3", title: "Smash Burger Bacon & Cheddar", image: "🍔", tags: ["Under review"], deliveryPrice: "R$36.90", pickupPrice: "R$32.90", stock: "300", status: true, addOns: [] },
    { id: "0-4", title: "Smash Burger Egg", image: "🍔", tags: [], deliveryPrice: "R$34.90", pickupPrice: "R$30.90", stock: "200", status: false, addOns: [] },
    { id: "0-5", title: "Smash Burger Catupiry", image: "🍔", tags: [], deliveryPrice: "R$35.90", pickupPrice: "R$31.90", stock: "Unlimited", status: true, addOns: [] },
  ],
  1: [ // Combos Irresistíveis - 4 items
    {
      id: "1-1", title: "Combo Smash Burger + Batata + CocaCola", image: "🍔",
      tags: ["Under review", "In marketing activities"], availability: "Available from December 25th, 11:00 AM",
      deliveryPrice: "R$9999.99", pickupPrice: "R$9999.99", stock: "Unlimited", status: true, addOns: [],
    },
    {
      id: "1-2", title: "Combo N! Crispy Chicken + Batata + CocaCola", image: "🍗",
      tags: ["In marketing activities", "Cannot be sold independently"],
      deliveryPrice: "R$100.00", pickupPrice: "R$80.00", stock: "900", status: true,
      addOns: [
        {
          name: "Snack (1of3)", required: true,
          items: [
            { name: "Chicken Pop - Sobrecoxas Empandas C", deliveryPrice: "R$40.00", pickupPrice: "R$36.00", stock: "Unlimited", status: true },
            { name: "Chicken Pop - Molho Barbec", deliveryPrice: "R$20.00", pickupPrice: "R$18.00", stock: "0", status: true, warning: "Low stock" },
            { name: "Chicken Pop - Crocantes", deliveryPrice: "R$20.00", pickupPrice: "R$18.00", stock: "999", status: true },
          ],
        },
        {
          name: "Salad (1of3)", required: false,
          items: [
            { name: "Vegatable Salada", deliveryPrice: "R$40.00", pickupPrice: "R$36.00", stock: "999", status: false, warning: "This dish contained prohibited words and has been removed from the platform." },
            { name: "Chesse Salada", deliveryPrice: "R$20.00", pickupPrice: "R$18.00", stock: "999", status: true },
            { name: "Classic Salad", deliveryPrice: "R$20.00", pickupPrice: "R$18.00", stock: "999", status: true },
          ],
        },
        {
          name: "Beverage (1of2)", required: false,
          items: [
            { name: "CocaCola", deliveryPrice: "R$6.00", pickupPrice: "R$4.00", stock: "999", status: true },
            { name: "Sprite", deliveryPrice: "R$6.00", pickupPrice: "R$4.00", stock: "999", status: true },
          ],
        },
      ],
    },
    { id: "1-3", title: "Combo Cheese Burger 120g + Batatas Rusticas + CocaCola", image: "🍔", tags: [], deliveryPrice: "R$100.00", pickupPrice: "R$80.00", stock: "900", status: false, addOns: [] },
    { id: "1-4", title: "Combo Cheese Burger 180g + Batatas Rusticas + CocaCola", image: "🍔", tags: ["Under review", "In marketing activities"], availability: "Available from December 25th, 11:00 AM", deliveryPrice: "R$100.00", pickupPrice: "R$80.00", stock: "0", status: true, addOns: [] },
  ],
  2: [ // Edição Limitada - 1 item
    { id: "2-1", title: "Burger Trufado Especial Edição Natalina", image: "🎄", tags: ["Under review"], availability: "Available from December 20th, 06:00 PM", deliveryPrice: "R$59.90", pickupPrice: "R$49.90", stock: "50", status: true, addOns: [] },
  ],
  3: [ // Escolhas Impossíveis de Errar - 6 items
    { id: "3-1", title: "Classic Burger 150g", image: "🍔", tags: [], deliveryPrice: "R$24.90", pickupPrice: "R$20.90", stock: "Unlimited", status: true, addOns: [] },
    { id: "3-2", title: "Bacon Burger 150g", image: "🥓", tags: ["In marketing activities"], deliveryPrice: "R$28.90", pickupPrice: "R$24.90", stock: "800", status: true, addOns: [] },
    { id: "3-3", title: "Chicken Burger Crispy", image: "🍗", tags: [], deliveryPrice: "R$26.90", pickupPrice: "R$22.90", stock: "600", status: true, addOns: [] },
    { id: "3-4", title: "Veggie Burger", image: "🥬", tags: [], deliveryPrice: "R$25.90", pickupPrice: "R$21.90", stock: "400", status: true, addOns: [] },
    { id: "3-5", title: "Fish Burger Empanado", image: "🐟", tags: [], deliveryPrice: "R$29.90", pickupPrice: "R$25.90", stock: "200", status: false, addOns: [] },
    { id: "3-6", title: "Double Cheese Burger 240g", image: "🧀", tags: ["Under review"], deliveryPrice: "R$38.90", pickupPrice: "R$34.90", stock: "0", status: true, addOns: [] },
  ],
  4: [ // Originais N! Burger - 2 items
    { id: "4-1", title: "N! Burger Original 200g", image: "🍔", tags: ["In marketing activities"], deliveryPrice: "R$34.90", pickupPrice: "R$30.90", stock: "Unlimited", status: true, addOns: [] },
    { id: "4-2", title: "N! Burger Especial com Molho Secreto", image: "🍔", tags: [], deliveryPrice: "R$39.90", pickupPrice: "R$35.90", stock: "350", status: true, addOns: [] },
  ],
  5: [ // Clássicos - 4 items
    { id: "5-1", title: "Hamburger Clássico 120g", image: "🍔", tags: [], deliveryPrice: "R$19.90", pickupPrice: "R$16.90", stock: "Unlimited", status: true, addOns: [] },
    { id: "5-2", title: "Cheeseburger Clássico 120g", image: "🧀", tags: [], deliveryPrice: "R$22.90", pickupPrice: "R$19.90", stock: "Unlimited", status: true, addOns: [] },
    { id: "5-3", title: "X-Bacon Clássico 120g", image: "🥓", tags: [], deliveryPrice: "R$26.90", pickupPrice: "R$22.90", stock: "500", status: true, addOns: [] },
    { id: "5-4", title: "X-Tudo Clássico 150g", image: "🍔", tags: ["Under review"], deliveryPrice: "R$32.90", pickupPrice: "R$28.90", stock: "300", status: false, addOns: [] },
  ],
  6: [ // Acompanhamentos - 4 items
    { id: "6-1", title: "Batata Frita Média", image: "🍟", tags: [], deliveryPrice: "R$14.90", pickupPrice: "R$12.90", stock: "Unlimited", status: true, addOns: [] },
    { id: "6-2", title: "Batata Rústica com Cheddar e Bacon", image: "🍟", tags: ["In marketing activities"], deliveryPrice: "R$22.90", pickupPrice: "R$18.90", stock: "400", status: true, addOns: [] },
    { id: "6-3", title: "Onion Rings 12un", image: "🧅", tags: [], deliveryPrice: "R$18.90", pickupPrice: "R$15.90", stock: "250", status: true, addOns: [] },
    { id: "6-4", title: "Nuggets de Frango 10un", image: "🍗", tags: [], deliveryPrice: "R$16.90", pickupPrice: "R$13.90", stock: "0", status: false, addOns: [] },
  ],
  7: [ // Vai Um Docinho Aí - 1 item
    { id: "7-1", title: "Brownie com Sorvete de Baunilha", image: "🍫", tags: [], deliveryPrice: "R$18.90", pickupPrice: "R$15.90", stock: "150", status: true, addOns: [] },
  ],
};

const MenuListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(initialCategories);
  const [categoryItems, setCategoryItems] = useState(itemsByCategory);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Edit category dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Delete category dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategoryIndex, setDeletingCategoryIndex] = useState<number | null>(null);

  // Add category dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  // Sort category dialog state
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleEditCategory = (idx: number) => {
    setEditingCategoryIndex(idx);
    setEditCategoryName(categories[idx].name);
    setEditDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (editCategoryName.trim() === "" || editingCategoryIndex === null) return;
    
    setCategories(prev => prev.map((cat, idx) => 
      idx === editingCategoryIndex 
        ? { ...cat, name: editCategoryName.trim() }
        : cat
    ));
    setEditDialogOpen(false);
    setEditingCategoryIndex(null);
    setEditCategoryName("");
  };

  const handleDeleteCategory = (idx: number) => {
    setDeletingCategoryIndex(idx);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCategoryIndex === null) return;
    setCategories(prev => prev.filter((_, idx) => idx !== deletingCategoryIndex));
    setCategoryItems(prev => {
      const newItems = { ...prev };
      delete newItems[deletingCategoryIndex];
      // Re-index remaining items
      const reindexed: Record<number, MenuItem[]> = {};
      const remaining = Object.entries(newItems)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, items]) => items);
      remaining.forEach((items, i) => { reindexed[i] = items; });
      return reindexed;
    });
    if (selectedCategory >= deletingCategoryIndex && selectedCategory > 0) {
      setSelectedCategory(prev => prev - 1);
    }
    setDeleteDialogOpen(false);
    setDeletingCategoryIndex(null);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newIdx = categories.length;
    setCategories(prev => [...prev, { name: newCategoryName.trim(), count: 0 }]);
    setCategoryItems(prev => ({ ...prev, [newIdx]: [] }));
    setSelectedCategory(newIdx);
    setAddDialogOpen(false);
    setNewCategoryName("");
  };

  const handleSortSave = (reordered: { name: string; count: number }[]) => {
    const oldIndexMap = reordered.map(r => categories.findIndex(c => c.name === r.name));
    const newCategoryItemsMap: Record<number, MenuItem[]> = {};
    oldIndexMap.forEach((oldIdx, newIdx) => {
      newCategoryItemsMap[newIdx] = categoryItems[oldIdx] || [];
    });
    setCategories(reordered);
    setCategoryItems(newCategoryItemsMap);
    setSelectedCategory(0);
  };

  useEffect(() => {
    if (addDialogOpen && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [addDialogOpen]);

  useEffect(() => {
    if (editDialogOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editDialogOpen]);

  return (
    <AdminLayout>
      <div className="p-6">

        {/* Tabs */}
        <div className="mb-4 flex gap-6 border-b border-border">
          <button className="border-b-2 border-foreground pb-2 text-sm font-semibold">Store Menu</button>
          <button className="pb-2 text-sm text-muted-foreground hover:text-foreground">Items</button>
          <button className="pb-2 text-sm text-muted-foreground hover:text-foreground">Modifications</button>
        </div>

        {/* Menu Title */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Night Bistro Menu (66)</h1>
            <span className="flex items-center gap-1 rounded-full border border-border px-3 py-0.5 text-xs text-muted-foreground">
              ℹ Affordable certification
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border p-2 hover:bg-secondary">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="rounded-lg border border-border p-2 hover:bg-secondary">
              <List className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="rounded-lg border border-border p-2 hover:bg-secondary">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search" className="h-9 w-48 pl-9" />
            </div>
            <Select>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Item Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Sale Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="on-sale">On Sale</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 gap-2">
              <Settings2 className="h-4 w-4" />
              Batch Operations
            </Button>
            <Button
              className="h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/menu/new")}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex gap-6">
          {/* Category sidebar */}
          <div className="w-56 shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Category</h2>
              <div className="flex gap-1">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="rounded border border-border p-1 hover:bg-secondary"
                        onClick={() => setSortDialogOpen(true)}
                      >
                        <List className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Sort categories</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="rounded border border-border p-1 hover:bg-secondary"
                        onClick={() => setAddDialogOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Add category</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="space-y-0.5">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCategory(idx)}
                  className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    selectedCategory === idx
                      ? "bg-foreground font-semibold text-card"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <TruncatedText text={cat.name} className="flex-1 min-w-0 mr-2" />
                  <span className={`text-xs shrink-0 text-right transition-all group-hover:mr-7 ${selectedCategory === idx ? "text-card/70" : "text-muted-foreground"}`}>
                    {cat.count}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-2 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          selectedCategory === idx ? "hover:bg-card/20" : "hover:bg-secondary"
                        }`}
                      >
                        <MoreHorizontal className={`h-4 w-4 ${selectedCategory === idx ? "text-card" : "text-muted-foreground"}`} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right" className="w-40">
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(idx);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Clock4 className="h-4 w-4" />
                        Set pinned time
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(idx);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>

          {/* Items table */}
          <div className="flex-1 overflow-auto">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {categories[selectedCategory].name}{" "}
                <span className="font-normal text-muted-foreground">
                  {categories[selectedCategory].count} items
                </span>
              </h2>
              <button className="rounded border border-border p-1 hover:bg-secondary">
                <List className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_100px_80px_70px_30px] gap-2 border-b border-border px-2 pb-2 text-xs text-muted-foreground">
              <span>Title</span>
              <span className="text-right">Delivery</span>
              <span className="text-right">Pick-up</span>
              <span className="text-right">Stock</span>
              <span className="text-center">Status</span>
              <span></span>
            </div>

            {/* Items */}
            <div className="divide-y divide-border">
              {(categoryItems[selectedCategory] || []).map((item) => (
                <div key={item.id}>
                  {/* Main item row */}
                  <div className="grid grid-cols-[1fr_120px_100px_80px_70px_30px] items-center gap-2 px-2 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl">
                        {item.image}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {item.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {item.availability && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            📅 {item.availability}
                          </p>
                        )}
                        {item.addOns && item.addOns.length > 0 && (
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="mt-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Add-on {expandedItems.includes(item.id) ? "▲" : "▼"}
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="text-right text-sm">{item.deliveryPrice} ⏱</span>
                    <span className="text-right text-sm">{item.pickupPrice}</span>
                    <span className={`text-right text-sm ${item.stock === "0" ? "text-destructive" : ""}`}>
                      {item.stock}
                      {item.stock === "0" && " ⚠"}
                    </span>
                    <div className="flex justify-center">
                      <Switch checked={item.status} />
                    </div>
                    <button className="rounded p-1 hover:bg-secondary">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Expanded Add-ons */}
                  {expandedItems.includes(item.id) &&
                    item.addOns?.map((group, gIdx) => (
                      <div key={gIdx} className="bg-secondary/50 px-6 py-2">
                        <p className="mb-1 text-xs font-semibold">
                          {group.name}{" "}
                          <span className={`font-normal ${group.required ? "text-foreground" : "text-muted-foreground"}`}>
                            {group.required ? "Required" : "Optional"}
                          </span>
                        </p>
                        {group.items.map((sub, sIdx) => (
                          <div key={sIdx}>
                            <div className="grid grid-cols-[1fr_120px_100px_80px_70px_30px] items-center gap-2 py-1.5">
                              <span className="pl-4 text-sm">{sub.name}</span>
                              <span className="text-right text-sm">{sub.deliveryPrice} ⏱</span>
                              <span className="text-right text-sm">{sub.pickupPrice}</span>
                              <span className={`text-right text-sm ${sub.stock === "0" ? "text-destructive" : ""}`}>
                                {sub.stock}
                                {sub.stock === "0" && " ⚠"}
                              </span>
                              <div className="flex justify-center">
                                <Switch checked={sub.status} />
                              </div>
                              <button className="rounded p-1 hover:bg-secondary">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                            {sub.warning && sub.warning.includes("prohibited") && (
                              <p className="mb-1 pl-4 text-xs text-destructive">
                                ⛔ {sub.warning}{" "}
                                <span className="cursor-pointer text-primary-foreground underline">Go and view details ›</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={inputRef}
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              placeholder="Category name"
              className="h-12"
              onKeyDown={(e) => {
                if (e.key === "Enter" && editCategoryName.trim()) {
                  handleSaveCategory();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={!editCategoryName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Are you sure you want to delete?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Deleting a category will also delete all dishes under that category, and these dishes cannot be recovered. Please be careful.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={addInputRef}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Please enter the category name"
              className="h-12"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCategoryName.trim()) {
                  handleAddCategory();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setAddDialogOpen(false); setNewCategoryName(""); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CategorySortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        categories={categories}
        onSave={handleSortSave}
      />
      </div>
    </AdminLayout>
  );
};

export default MenuListPage;
