import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { ArrowLeft, ImagePlus, Plus, X, GripVertical, Copy, Trash2, ChevronUp, ChevronDown, Link2, Save } from "lucide-react";
import ImageUploadDialog from "@/components/ImageUploadDialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMenu } from "@/contexts/MenuContext";
import { toast } from "@/hooks/use-toast";

const allergens = ["Diary", "Eggs", "Fish", "Diary", "Eggs", "Fish", "Diary", "Eggs", "Fish", "Diary", "Eggs", "Fish"];

const NewItemPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { itemId } = useParams<{ itemId?: string }>();
  const { categories, addItem, updateItem, getItemById } = useMenu();

  const isEdit = !!itemId;
  const existingData = isEdit ? getItemById(itemId) : null;

  const [itemType, setItemType] = useState<"items" | "combo">("items");
  const [itemName, setItemName] = useState("");
  const [pdvCode, setPdvCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<string>("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [pickupPrice, setPickupPrice] = useState("");
  const [didiEnabled, setDidiEnabled] = useState(false);
  const [stockType, setStockType] = useState("unlimited");
  const [stockCount, setStockCount] = useState("");
  const [canSoldSeparately, setCanSoldSeparately] = useState("yes");
  const [containsAlcohol, setContainsAlcohol] = useState("no");
  const [saleTimeType, setSaleTimeType] = useState("weekly");
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  interface ModifierGroupItem {
    name: string;
    price: string;
    maxQty: string;
  }

  interface ModifierGroup {
    id: string;
    name: string;
    customId: string;
    min: string;
    max: string;
    allowMultiple: boolean;
    required: boolean;
    collapsed: boolean;
    items: ModifierGroupItem[];
    status: 'unsaved' | 'error' | 'saved';
  }

  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);

  const addNewModifierGroup = () => {
    setModifierGroups(prev => [...prev, {
      id: `mg-${Date.now()}`, name: "", customId: "", min: "1", max: "1",
      allowMultiple: false, required: false, collapsed: false, items: [],
      status: 'unsaved' as const,
    }]);
  };

  const removeModifierGroup = (id: string) => {
    setModifierGroups(prev => prev.filter(g => g.id !== id));
  };

  const toggleModifierCollapse = (id: string) => {
    setModifierGroups(prev => prev.map(g => g.id === id ? { ...g, collapsed: !g.collapsed } : g));
  };

  const updateModifierGroup = (id: string, updates: Partial<ModifierGroup>) => {
    setModifierGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates, ...(updates.status ? {} : { status: 'unsaved' as const }) } : g));
  };

  const saveModifierGroup = (id: string) => {
    setModifierGroups(prev => prev.map(g => {
      if (g.id !== id) return g;
      if (!g.name.trim()) return { ...g, status: 'error' as const };
      return { ...g, status: 'saved' as const };
    }));
  };

  const getMinValue = (min: string) => parseInt(min) || 0;
  const getMaxValue = (max: string) => parseInt(max) || 0;
  const isRequiredDisabled = (min: string, max: string) => {
    const minVal = getMinValue(min);
    const maxVal = getMaxValue(max);
    return minVal !== maxVal; // disabled when min !== max
  };
  const isRequiredForced = (min: string) => getMinValue(min) > 0;

  // New modifier dialog state
  const [newModifierDialogOpen, setNewModifierDialogOpen] = useState(false);
  const [newModifierTargetGroupId, setNewModifierTargetGroupId] = useState<string>("");
  const [newModifierName, setNewModifierName] = useState("");
  const [newModifierCategory, setNewModifierCategory] = useState("");
  const [newModifierDeliveryEnabled, setNewModifierDeliveryEnabled] = useState(true);
  const [newModifierDeliveryPrice, setNewModifierDeliveryPrice] = useState("");
  const [newModifierStockType, setNewModifierStockType] = useState("unlimited");
  const [newModifierStockCount, setNewModifierStockCount] = useState("");
  const [newModifierMaxLimit, setNewModifierMaxLimit] = useState("");
  const [newModifierCanSoldSeparately, setNewModifierCanSoldSeparately] = useState("yes");

  const openNewModifierDialog = (groupId: string) => {
    setNewModifierTargetGroupId(groupId);
    setNewModifierName("");
    setNewModifierCategory("");
    setNewModifierDeliveryEnabled(true);
    setNewModifierDeliveryPrice("");
    setNewModifierStockType("unlimited");
    setNewModifierStockCount("");
    setNewModifierMaxLimit("");
    setNewModifierCanSoldSeparately("yes");
    setNewModifierDialogOpen(true);
  };

  const handleNewModifierSubmit = () => {
    if (!newModifierName.trim()) return;
    const newItem: ModifierGroupItem = {
      name: newModifierName.trim(),
      price: newModifierDeliveryPrice ? `R$${newModifierDeliveryPrice}` : "R$0.00",
      maxQty: newModifierMaxLimit || "-",
    };
    setModifierGroups(prev => prev.map(g =>
      g.id === newModifierTargetGroupId ? { ...g, items: [...g.items, newItem] } : g
    ));
    setNewModifierDialogOpen(false);
  };

  useEffect(() => {
    if (existingData) {
      const { item, categoryIndex } = existingData;
      setItemType(item.itemType || "items");
      setItemName(item.title);
      setPdvCode(item.pdvCode || "");
      setDescription(item.description || "");
      setSelectedCategoryIdx(String(categoryIndex));
      setDeliveryEnabled(true);
      setDeliveryPrice(item.deliveryPrice.replace("R$", ""));
      setPickupPrice(item.pickupPrice.replace("R$", ""));
      setPickupEnabled(item.pickupPrice !== "");
      setStockType(item.stock === "Unlimited" ? "unlimited" : "custom");
      setStockCount(item.stock === "Unlimited" ? "" : item.stock);
      setCanSoldSeparately(item.notSoldIndependently ? "no" : "yes");
    }
  }, [itemId]);

  const toggleAllergen = (idx: number) => {
    setSelectedAllergens((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!itemName.trim() || !selectedCategoryIdx || !deliveryPrice.trim()) return;

    const catIdx = Number(selectedCategoryIdx);
    const formattedDeliveryPrice = `R$${deliveryPrice}`;
    const formattedPickupPrice = pickupEnabled && pickupPrice ? `R$${pickupPrice}` : formattedDeliveryPrice;
    const stockValue = stockType === "unlimited" ? "Unlimited" : (stockCount || "0");

    if (isEdit && existingData) {
      updateItem(itemId, {
        title: itemName.trim(), itemType, pdvCode, description,
        deliveryPrice: formattedDeliveryPrice, pickupPrice: formattedPickupPrice,
        stock: stockValue, notSoldIndependently: canSoldSeparately === "no",
      });
      toast({ title: t("newItem.itemUpdated") });
    } else {
      const newId = `${catIdx}-${Date.now()}`;
      addItem(catIdx, {
        id: newId, title: itemName.trim(), image: itemType === "combo" ? "🍱" : "🍽️",
        tags: [], deliveryPrice: formattedDeliveryPrice, pickupPrice: formattedPickupPrice,
        stock: stockValue, status: true, addOns: [], itemType, pdvCode, description,
        notSoldIndependently: canSoldSeparately === "no",
      });
      toast({ title: t("newItem.itemCreated") });
    }
    navigate("/");
  };

  const [activeTab, setActiveTab] = useState<"basic" | "modifications" | "sales">("basic");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const modificationsRef = useRef<HTMLDivElement>(null);
  const salesInfoRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const scrollToSection = (section: "basic" | "modifications" | "sales") => {
    setActiveTab(section);
    isScrollingRef.current = true;
    const refMap = { basic: basicInfoRef, modifications: modificationsRef, sales: salesInfoRef };
    const target = refMap[section].current;
    const container = scrollContainerRef.current?.closest("main");
    if (target && container) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset = targetRect.top - containerRect.top + container.scrollTop - 110;
      container.scrollTo({ top: offset, behavior: "smooth" });
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    } else {
      isScrollingRef.current = false;
    }
  };

  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    const container = scrollContainerRef.current?.closest("main");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const threshold = containerRect.top + 120;
    const salesTop = salesInfoRef.current?.getBoundingClientRect().top ?? Infinity;
    const modsTop = modificationsRef.current?.getBoundingClientRect().top ?? Infinity;
    if (salesTop <= threshold) setActiveTab("sales");
    else if (modsTop <= threshold) setActiveTab("modifications");
    else setActiveTab("basic");
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current?.closest("main");
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <AdminLayout>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-6 pt-4 pb-0">
          <div className="mb-3 flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />{t("newItem.back")}
            </button>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm font-medium">{isEdit ? t("newItem.editItem") : t("newItem.newItem")}</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => scrollToSection("basic")} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === "basic" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("newItem.basicInfo")}</button>
            <button onClick={() => scrollToSection("modifications")} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === "modifications" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("newItem.modifications")}</button>
            <button onClick={() => scrollToSection("sales")} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === "sales" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("newItem.salesInfo")}</button>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div ref={scrollContainerRef} className="p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* === BASIC INFO === */}
          <div ref={basicInfoRef} className="space-y-6">
          {/* Item Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t("newItem.itemType")} <span className="text-destructive">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setItemType("items")} className={`rounded-lg border-2 p-4 text-left transition-colors ${itemType === "items" ? "border-foreground" : "border-border hover:border-muted-foreground"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("newItem.itemsType")}</span>
                  <div className={`h-5 w-5 rounded-full border-2 ${itemType === "items" ? "border-foreground bg-foreground" : "border-border"}`}>
                    {itemType === "items" && <div className="m-0.5 h-3 w-3 rounded-full bg-card" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t("newItem.itemsDesc")}</p>
              </button>
              <button onClick={() => setItemType("combo")} className={`rounded-lg border-2 p-4 text-left transition-colors ${itemType === "combo" ? "border-foreground" : "border-border hover:border-muted-foreground"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("newItem.comboType")}</span>
                  <div className={`h-5 w-5 rounded-full border-2 ${itemType === "combo" ? "border-foreground bg-foreground" : "border-border"}`}>
                    {itemType === "combo" && <div className="m-0.5 h-3 w-3 rounded-full bg-card" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t("newItem.comboDesc")}</p>
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.itemName")} <span className="text-destructive">*</span></label>
            <div className="relative">
              <Input placeholder={t("newItem.pleaseEnter")} maxLength={50} value={itemName} onChange={(e) => setItemName(e.target.value)} className={submitted && !itemName.trim() ? "border-destructive focus-visible:ring-destructive" : ""} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{itemName.length}/50</span>
            </div>
            {submitted && !itemName.trim() && <p className="mt-1 text-xs text-destructive">{t("newItem.itemNameRequired")}</p>}
          </div>

          {/* PDV Code */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.pdvCode")}</label>
            <div className="relative">
              <Input placeholder={t("newItem.pleaseEnter")} maxLength={50} value={pdvCode} onChange={(e) => setPdvCode(e.target.value)} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{pdvCode.length}/50</span>
            </div>
          </div>

          {/* Item Picture */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.itemPicture")}</label>
            <p className="mb-2 text-xs text-muted-foreground">
              {t("newItem.imageHelp")}{" "}
              <span className="cursor-pointer underline">{t("newItem.viewPhotoGuide")}</span>
            </p>
            <p className="mb-3 text-xs text-muted-foreground">{t("newItem.fileRequirements")}</p>
            <div className="flex items-start gap-4">
              {uploadedImage ? (
                <div className="relative h-28 w-28 rounded-lg overflow-hidden border border-border">
                  <img src={uploadedImage} alt="Item" className="h-full w-full object-cover" />
                  <button onClick={() => setUploadedImage(null)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/70 flex items-center justify-center hover:bg-foreground/90">
                    <X className="h-3 w-3 text-background" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setImageDialogOpen(true)} className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary hover:border-muted-foreground transition-colors">
                  <ImagePlus className="mb-1 h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("newItem.addImage")}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setImageDialogOpen(true)}>{t("newItem.upload")}</Button>
                <Button variant="outline" size="sm" className="text-muted-foreground" onClick={() => setUploadedImage(null)}>{t("newItem.deleteImage")}</Button>
              </div>
            </div>
            <ImageUploadDialog open={imageDialogOpen} onOpenChange={setImageDialogOpen} onImageSelected={(_file, previewUrl) => setUploadedImage(previewUrl)} />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.description")}</label>
            <Textarea placeholder={t("newItem.descriptionPlaceholder")} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Store-defined Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.storeDefinedCategory")} <span className="text-destructive">*</span> ℹ</label>
            <Select value={selectedCategoryIdx} onValueChange={setSelectedCategoryIdx}>
              <SelectTrigger className={submitted && !selectedCategoryIdx ? "border-destructive focus:ring-destructive" : ""}>
                <SelectValue placeholder={t("newItem.pleaseSelect")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat, idx) => (<SelectItem key={idx} value={String(idx)}>{cat.name}</SelectItem>))}
              </SelectContent>
            </Select>
            {submitted && !selectedCategoryIdx && <p className="mt-1 text-xs text-destructive">{t("newItem.categoryRequired")}</p>}
          </div>

          {/* Item Classification */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.itemClassification")} ℹ</label>
            <Select>
              <SelectTrigger><SelectValue placeholder={t("newItem.pleaseSelect")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="food">{t("newItem.food")}</SelectItem>
                <SelectItem value="drink">{t("newItem.drink")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Healthy food type */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.healthyFoodType")}</label>
            <Select>
              <SelectTrigger><SelectValue placeholder={t("newItem.pleaseSelect")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("newItem.none")}</SelectItem>
                <SelectItem value="low-cal">{t("newItem.lowCalorie")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vegan */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.vegan")}</label>
            <Select>
              <SelectTrigger><SelectValue placeholder={t("newItem.pleaseSelect")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{t("newItem.yes")}</SelectItem>
                <SelectItem value="no">{t("newItem.no")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allergens */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t("newItem.allergens")}</label>
            <div className="flex flex-wrap gap-2">
              {allergens.map((a, idx) => (
                <Badge key={idx} variant={selectedAllergens.includes(idx) ? "default" : "outline"} className={`cursor-pointer px-3 py-1 text-xs ${selectedAllergens.includes(idx) ? "bg-foreground text-card hover:bg-foreground/80" : "hover:bg-secondary"}`} onClick={() => toggleAllergen(idx)}>
                  {a}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contains Alcohol */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.containsAlcohol")}</label>
            <p className="mb-2 text-xs text-muted-foreground">{t("newItem.alcoholWarning")}</p>
            <RadioGroup value={containsAlcohol} onValueChange={setContainsAlcohol} className="flex gap-6">
              <div className="flex items-center gap-2"><RadioGroupItem value="no" id="alc-no" /><Label htmlFor="alc-no">{t("newItem.no")}</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="alc-yes" /><Label htmlFor="alc-yes">{t("newItem.yes")}</Label></div>
            </RadioGroup>
          </div>

          </div>{/* end basic info section */}

          {/* === MODIFICATIONS SECTION === */}
          <div ref={modificationsRef} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">{t("newItem.modificationGroup")}</label>

            {/* Modifier group cards */}
            {modifierGroups.map((group, groupIdx) => {
              const borderClass = group.status === 'error' ? 'border-[hsl(340,82%,52%)]' : group.status === 'saved' ? 'border-border' : 'border-[hsl(40,100%,50%)]';
              const badgeBg = group.status === 'saved' ? 'bg-[hsl(142,71%,45%)]' : 'bg-[hsl(48,96%,53%)]';
              const badgeText = group.status === 'saved' ? t("newItem.saved") : t("newItem.unsaved");
              const isDragDisabled = modifierGroups.length <= 1;
              const minVal = getMinValue(group.min);
              const reqDisabled = isRequiredDisabled(group.min, group.max);
              const reqForced = isRequiredForced(group.min);

              return (
              <div key={group.id} className={`mb-4 rounded-lg border-2 ${borderClass} bg-card`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <GripVertical className={`h-5 w-5 ${isDragDisabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground cursor-grab hover:text-foreground'}`} />
                    <span className="font-semibold italic">{group.name || t("newItem.newModifier")}</span>
                    <Badge className={`${badgeBg} text-foreground hover:opacity-90 text-xs`}>{badgeText}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {group.items.length} {t("newItem.modifierCount")} · {group.min}-{group.max} {t("newItem.options")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-secondary"><Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                    <button onClick={() => removeModifierGroup(group.id)} className="p-1.5 rounded hover:bg-secondary"><Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button onClick={() => toggleModifierCollapse(group.id)} className="p-1.5 rounded hover:bg-secondary">
                      {group.collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible body */}
                {!group.collapsed && (
                  <div className="p-4 space-y-4">
                    {/* Form fields */}
                    <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">{t("newItem.modifierName")}</label>
                        <Input
                          placeholder={t("newItem.namePlaceholder")}
                          value={group.name}
                          onChange={(e) => updateModifierGroup(group.id, { name: e.target.value })}
                          className={group.status === 'error' && !group.name.trim() ? 'border-destructive' : ''}
                        />
                        {group.status === 'error' && !group.name.trim() && (
                          <p className="mt-1 text-xs text-destructive">{t("newItem.modifierNameRequired")}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">{t("newItem.customModifierGroupId")}</label>
                        <Input placeholder="ID" value={group.customId} onChange={(e) => updateModifierGroup(group.id, { customId: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">MIN</label>
                        <Input className="w-16" value={group.min} onChange={(e) => {
                          const newMin = e.target.value;
                          const newMinVal = parseInt(newMin) || 0;
                          const updates: Partial<ModifierGroup> = { min: newMin };
                          if (newMinVal === 0) updates.required = false;
                          else if (newMinVal > 0 && newMinVal !== getMaxValue(group.max)) updates.required = true;
                          updateModifierGroup(group.id, updates);
                        }} />
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="pb-2 text-muted-foreground">-</span>
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">MAX</label>
                          <Input className="w-16" value={group.max} onChange={(e) => {
                            const newMax = e.target.value;
                            const newMaxVal = parseInt(newMax) || 0;
                            const updates: Partial<ModifierGroup> = { max: newMax };
                            if (minVal === 0) updates.required = false;
                            else if (minVal > 0 && minVal !== newMaxVal) updates.required = true;
                            updateModifierGroup(group.id, updates);
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-border" checked={group.allowMultiple} onChange={(e) => updateModifierGroup(group.id, { allowMultiple: e.target.checked })} />
                        {t("newItem.customerCanAddMultiple")}
                      </label>
                      <label className={`flex items-center gap-2 text-sm ${reqDisabled ? 'opacity-50' : ''}`}>
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={reqDisabled ? reqForced : group.required}
                          disabled={reqDisabled}
                          onChange={(e) => updateModifierGroup(group.id, { required: e.target.checked })}
                        />
                        {t("newItem.requiredToSelect")}
                      </label>
                    </div>

                    {/* Items table */}
                    <div className="rounded-lg bg-secondary/50 overflow-hidden">
                      <div className="grid grid-cols-3 px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary">
                        <span>{t("newItem.itemNameCol")}</span>
                        <span className="text-center">{t("newItem.priceCol")}</span>
                        <span className="text-center">Max QTY</span>
                      </div>
                      {group.items.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">{t("newItem.pleaseLinkSubItems")}</div>
                      ) : (
                        group.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-3 px-4 py-2 border-t border-border text-sm">
                            <span>{item.name}</span>
                            <span className="text-center">{item.price}</span>
                            <span className="text-center">{item.maxQty}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom actions */}
                    <div className="grid grid-cols-2 rounded-lg border border-border overflow-hidden">
                      <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-[hsl(30,100%,50%)] hover:bg-secondary transition-colors border-r border-border">
                        <Link2 className="h-4 w-4" />
                        {t("newItem.linkExistingModifier")}
                      </button>
                      <button onClick={() => openNewModifierDialog(group.id)} className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-[hsl(30,100%,50%)] hover:bg-secondary transition-colors">
                        <Plus className="h-4 w-4" />
                        {t("newItem.createNewModifier")}
                      </button>
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end">
                      <Button onClick={() => saveModifierGroup(group.id)} className="bg-[hsl(48,96%,53%)] text-foreground hover:bg-[hsl(48,96%,45%)] gap-1">
                        <Save className="h-4 w-4" />
                        {t("newItem.saveChanges")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              );
            })}

            {/* Add group button with hover dropdown */}
            <div className="relative group">
              <Button variant="outline" className="w-full gap-1">
                <Plus className="h-4 w-4" />{t("newItem.addGroup")}
              </Button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-border bg-card shadow-lg p-2 space-y-1">
                <button onClick={addNewModifierGroup} className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-[hsl(30,100%,50%)] hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" />
                  {t("newItem.createNewGroup")}
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-[hsl(30,100%,50%)] hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" />
                  {t("newItem.selectExistingGroup")}
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-[hsl(30,100%,50%)] hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" />
                  {t("newItem.copyOtherItemGroup")}
                </button>
              </div>
            </div>
          </div>
          </div>{/* end modifications section */}

          {/* === SALES INFO SECTION === */}
          <div ref={salesInfoRef} className="space-y-6">
          {/* Price */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t("newItem.price")} <span className="text-destructive">*</span></label>
            <p className="mb-3 text-xs text-muted-foreground">{t("newItem.priceNote")}</p>

            <div className="mb-3 rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold">{t("newItem.deliveryTitle")}</span>
                  <p className="text-xs text-muted-foreground">{t("newItem.originalPrice")}</p>
                </div>
                <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
              </div>
              <div className="relative">
                <Input placeholder={t("newItem.pleaseEnter")} value={deliveryPrice} onChange={(e) => setDeliveryPrice(e.target.value)} className={submitted && !deliveryPrice.trim() ? "border-destructive focus-visible:ring-destructive" : ""} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R$</span>
              </div>
              {submitted && !deliveryPrice.trim() && <p className="mt-1 text-xs text-destructive">{t("newItem.deliveryPriceRequired")}</p>}
            </div>

          </div>

          {/* Stocking */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t("newItem.stocking")}</label>
            <RadioGroup value={stockType} onValueChange={setStockType} className="flex gap-6">
              <div className="flex items-center gap-2"><RadioGroupItem value="unlimited" id="stock-unlimited" /><Label htmlFor="stock-unlimited">{t("newItem.unlimited")}</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="custom" id="stock-custom" /><Label htmlFor="stock-custom">{t("newItem.custom")}</Label></div>
            </RadioGroup>
            {stockType === "custom" && <Input className="mt-2 w-32" placeholder={t("newItem.number")} type="number" value={stockCount} onChange={(e) => setStockCount(e.target.value)} />}
          </div>

          {/* Can Be Sold Separately */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t("newItem.canBeSoldSeparately")}</label>
            <RadioGroup value={canSoldSeparately} onValueChange={setCanSoldSeparately} className="flex gap-6">
              <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="sep-yes" /><Label htmlFor="sep-yes">{t("newItem.yes")}</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="no" id="sep-no" /><Label htmlFor="sep-no">{t("newItem.no")}</Label></div>
            </RadioGroup>
          </div>

          {/* Sale Time */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t("newItem.saleTime")}</label>
            <RadioGroup value={saleTimeType} onValueChange={setSaleTimeType} className="flex gap-6">
              <div className="flex items-center gap-2"><RadioGroupItem value="weekly" id="time-weekly" /><Label htmlFor="time-weekly">{t("newItem.weeklyCycle")}</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="specific" id="time-specific" /><Label htmlFor="time-specific">{t("newItem.specificTime")}</Label></div>
            </RadioGroup>
          </div>

          </div>{/* end sales info section */}

        </div>{/* end max-w-2xl */}
      </div>{/* end form content */}

      {/* Sticky bottom action buttons */}
      <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isEdit ? t("newItem.save") : t("newItem.submit")}
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>{t("newItem.discard")}</Button>
        </div>
      </div>

      {/* New Modifier Dialog */}
      <Dialog open={newModifierDialogOpen} onOpenChange={setNewModifierDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("newItem.createSubItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium">Name <span className="text-[hsl(340,82%,52%)]">*</span></label>
              <Input placeholder={t("newItem.pleaseEnter")} value={newModifierName} onChange={(e) => setNewModifierName(e.target.value)} />
            </div>

            {/* Store-defined Category */}
            <div>
              <label className="mb-1 block text-sm font-medium">{t("newItem.storeDefinedCategory")} <span className="text-[hsl(340,82%,52%)]">*</span> ℹ</label>
              <Select value={newModifierCategory} onValueChange={setNewModifierCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("newItem.pleaseSelect")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat, idx) => (<SelectItem key={idx} value={String(idx)}>{cat.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-1 block text-sm font-semibold">{t("newItem.priceCol")}</label>
              <div className="mb-3 rounded-lg bg-[hsl(210,40%,96%)] px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(210,100%,56%)] text-[10px] text-white font-bold">i</span>
                <span className="flex-1">{t("newItem.priceNote")}</span>
                <button className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{t("newItem.delivery")}</span>
                    <p className="text-xs text-muted-foreground">{t("newItem.originalPrice")}</p>
                  </div>
                  <Switch checked={newModifierDeliveryEnabled} onCheckedChange={setNewModifierDeliveryEnabled} />
                </div>
                {newModifierDeliveryEnabled && (
                  <div className="relative">
                    <Input placeholder={t("newItem.pleaseEnter")} value={newModifierDeliveryPrice} onChange={(e) => setNewModifierDeliveryPrice(e.target.value)} className="pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stocking */}
            <div>
              <label className="mb-1 block text-sm font-semibold">{t("newItem.stocking")}</label>
              <RadioGroup value={newModifierStockType} onValueChange={setNewModifierStockType} className="flex gap-6">
                <div className="flex items-center gap-2"><RadioGroupItem value="unlimited" id="mod-stock-unlimited" /><Label htmlFor="mod-stock-unlimited">{t("newItem.unlimited")}</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="custom" id="mod-stock-custom" /><Label htmlFor="mod-stock-custom">{t("newItem.custom")}</Label></div>
              </RadioGroup>
              {newModifierStockType === "custom" && (
                <Input type="number" className="mt-2 w-32" value={newModifierStockCount} onChange={(e) => setNewModifierStockCount(e.target.value)} />
              )}
            </div>

            {/* Max Limit */}
            <div>
              <label className="mb-1 block text-sm font-semibold">{t("newItem.maxLimit")} <span className="text-[hsl(340,82%,52%)]">*</span></label>
              <Input type="number" className="w-32" value={newModifierMaxLimit} onChange={(e) => setNewModifierMaxLimit(e.target.value)} />
            </div>

            {/* Can be sold separately */}
            <div>
              <label className="mb-1 block text-sm font-semibold">{t("newItem.canSoldSeparately")}</label>
              <RadioGroup value={newModifierCanSoldSeparately} onValueChange={setNewModifierCanSoldSeparately} className="flex gap-6">
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="mod-sold-yes" /><Label htmlFor="mod-sold-yes">{t("newItem.canSoldYes")}</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" id="mod-sold-no" /><Label htmlFor="mod-sold-no">{t("newItem.canSoldNo")}</Label></div>
              </RadioGroup>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setNewModifierDialogOpen(false)}>{t("newItem.cancel")}</Button>
              <Button onClick={handleNewModifierSubmit} className="bg-[hsl(48,96%,53%)] text-foreground hover:bg-[hsl(48,96%,45%)]">OK</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default NewItemPage;
