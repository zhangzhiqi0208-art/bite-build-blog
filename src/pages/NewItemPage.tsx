import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { ArrowLeft, ImagePlus, Plus, X } from "lucide-react";
import ImageUploadDialog from "@/components/ImageUploadDialog";
import { Input } from "@/components/ui/input";
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

  // Load existing data for edit mode
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
    if (!itemName.trim() || !selectedCategoryIdx || !deliveryPrice.trim()) {
      return;
    }

    const catIdx = Number(selectedCategoryIdx);
    const formattedDeliveryPrice = `R$${deliveryPrice}`;
    const formattedPickupPrice = pickupEnabled && pickupPrice ? `R$${pickupPrice}` : formattedDeliveryPrice;
    const stockValue = stockType === "unlimited" ? "Unlimited" : (stockCount || "0");

    if (isEdit && existingData) {
      updateItem(itemId, {
        title: itemName.trim(),
        itemType,
        pdvCode,
        description,
        deliveryPrice: formattedDeliveryPrice,
        pickupPrice: formattedPickupPrice,
        stock: stockValue,
        notSoldIndependently: canSoldSeparately === "no",
      });
      toast({ title: "Item updated successfully" });
    } else {
      const newId = `${catIdx}-${Date.now()}`;
      const newItem = {
        id: newId,
        title: itemName.trim(),
        image: itemType === "combo" ? "🍱" : "🍽️",
        tags: [],
        deliveryPrice: formattedDeliveryPrice,
        pickupPrice: formattedPickupPrice,
        stock: stockValue,
        status: true,
        addOns: [],
        itemType,
        pdvCode,
        description,
        notSoldIndependently: canSoldSeparately === "no",
      };
      addItem(catIdx, newItem);
      toast({ title: "Item created successfully" });
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
      container.scrollTo({
        top: offset,
        behavior: "smooth",
      });
      // Release scroll lock after animation
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
    if (salesTop <= threshold) {
      setActiveTab("sales");
    } else if (modsTop <= threshold) {
      setActiveTab("modifications");
    } else {
      setActiveTab("basic");
    }
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
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm font-medium">{isEdit ? "Edit Item" : "New Item"}</span>
          </div>
          <div className="flex gap-6">
            <button
              onClick={() => scrollToSection("basic")}
              className={`pb-2 text-sm font-semibold transition-colors ${activeTab === "basic" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >Basic Info</button>
            <button
              onClick={() => scrollToSection("modifications")}
              className={`pb-2 text-sm font-semibold transition-colors ${activeTab === "modifications" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >Modifications</button>
            <button
              onClick={() => scrollToSection("sales")}
              className={`pb-2 text-sm font-semibold transition-colors ${activeTab === "sales" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >Sales Info</button>
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
            <label className="mb-2 block text-sm font-medium">
              Item Type <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setItemType("items")}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  itemType === "items" ? "border-foreground" : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Items</span>
                  <div className={`h-5 w-5 rounded-full border-2 ${itemType === "items" ? "border-foreground bg-foreground" : "border-border"}`}>
                    {itemType === "items" && <div className="m-0.5 h-3 w-3 rounded-full bg-card" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Items sold individually in your store, such as burgers, pizzas, steaks, and more
                </p>
              </button>
              <button
                onClick={() => setItemType("combo")}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  itemType === "combo" ? "border-foreground" : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Combo</span>
                  <div className={`h-5 w-5 rounded-full border-2 ${itemType === "combo" ? "border-foreground bg-foreground" : "border-border"}`}>
                    {itemType === "combo" && <div className="m-0.5 h-3 w-3 rounded-full bg-card" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Items sold as combos in your store, such as burger and fries combos, fried chicken and cola combos, and more
                </p>
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Item Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                placeholder="Please enter"
                maxLength={50}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className={submitted && !itemName.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{itemName.length}/50</span>
            </div>
            {submitted && !itemName.trim() && (
              <p className="mt-1 text-xs text-destructive">Item name is required</p>
            )}
          </div>

          {/* PDV Code */}
          <div>
            <label className="mb-1 block text-sm font-medium">PDV Code</label>
            <div className="relative">
              <Input
                placeholder="Please enter"
                maxLength={50}
                value={pdvCode}
                onChange={(e) => setPdvCode(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{pdvCode.length}/50</span>
            </div>
          </div>

          {/* Item Picture */}
          <div>
            <label className="mb-1 block text-sm font-medium">Item picture</label>
            <p className="mb-2 text-xs text-muted-foreground">
              Images help customers learn more about the item, and can improve sales.{" "}
              <span className="cursor-pointer underline">View photo guide ›</span>
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              File requirements: JPG, PNG, GIF, or WEBP, with a size not exceeding 10MB. Minimum pixel requirement: 490 pixels in width and height.
            </p>
            <div className="flex items-start gap-4">
              {uploadedImage ? (
                <div className="relative h-28 w-28 rounded-lg overflow-hidden border border-border">
                  <img src={uploadedImage} alt="Item" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/70 flex items-center justify-center hover:bg-foreground/90"
                  >
                    <X className="h-3 w-3 text-background" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setImageDialogOpen(true)}
                  className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary hover:border-muted-foreground transition-colors"
                >
                  <ImagePlus className="mb-1 h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Image</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setImageDialogOpen(true)}>Upload</Button>
                <Button variant="outline" size="sm" className="text-muted-foreground" onClick={() => setUploadedImage(null)}>Delete</Button>
              </div>
            </div>
            <ImageUploadDialog
              open={imageDialogOpen}
              onOpenChange={setImageDialogOpen}
              onImageSelected={(_file, previewUrl) => setUploadedImage(previewUrl)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea
              placeholder="Please enter details like ingredients, weight, portion size etc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Store-defined Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Store-defined Category <span className="text-destructive">*</span> ℹ
            </label>
            <Select value={selectedCategoryIdx} onValueChange={setSelectedCategoryIdx}>
              <SelectTrigger className={submitted && !selectedCategoryIdx ? "border-destructive focus:ring-destructive" : ""}>
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat, idx) => (
                  <SelectItem key={idx} value={String(idx)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && !selectedCategoryIdx && (
              <p className="mt-1 text-xs text-destructive">Category is required</p>
            )}
          </div>

          {/* Item Classification */}
          <div>
            <label className="mb-1 block text-sm font-medium">Item Classification ℹ</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="drink">Drink</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Healthy food type */}
          <div>
            <label className="mb-1 block text-sm font-medium">Healthy food type</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low-cal">Low Calorie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vegan */}
          <div>
            <label className="mb-1 block text-sm font-medium">Vegan</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allergens */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Does this product contain any of the following allergens?
            </label>
            <div className="flex flex-wrap gap-2">
              {allergens.map((a, idx) => (
                <Badge
                  key={idx}
                  variant={selectedAllergens.includes(idx) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 text-xs ${
                    selectedAllergens.includes(idx)
                      ? "bg-foreground text-card hover:bg-foreground/80"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => toggleAllergen(idx)}
                >
                  {a}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contains Alcohol */}
          <div>
            <label className="mb-1 block text-sm font-medium">Does This Product Contain Alcohol</label>
            <p className="mb-2 text-xs text-muted-foreground">
              By law, items containing alcohol need to be marked clearly. An icon will show customers if the item has alcohol in it.
            </p>
            <RadioGroup value={containsAlcohol} onValueChange={setContainsAlcohol} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="alc-no" />
                <Label htmlFor="alc-no">No</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="alc-yes" />
                <Label htmlFor="alc-yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>

          </div>{/* end basic info section */}

          {/* === MODIFICATIONS SECTION === */}
          <div ref={modificationsRef} className="space-y-6">
          {/* Modification Group */}
          <div>
            <label className="mb-2 block text-sm font-medium">Modification group</label>
            <Button variant="outline" className="w-full gap-1">
              <Plus className="h-4 w-4" />
              Add group
            </Button>
          </div>

          </div>{/* end modifications section */}

          {/* === SALES INFO SECTION === */}
          <div ref={salesInfoRef} className="space-y-6">
          {/* Price */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Price <span className="text-destructive">*</span>
            </label>
            <p className="mb-3 text-xs text-muted-foreground">
              ● Pick-up and DiDi Your Business channel pricing must be lower than delivery price
            </p>

            {/* Delivery Price */}
            <div className="mb-3 rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold">Delivery</span>
                  <p className="text-xs text-muted-foreground">Original Price</p>
                </div>
                <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
              </div>
              <div className="relative">
                <Input
                  placeholder="Please enter"
                  value={deliveryPrice}
                  onChange={(e) => setDeliveryPrice(e.target.value)}
                  className={submitted && !deliveryPrice.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R$</span>
              </div>
              {submitted && !deliveryPrice.trim() && (
                <p className="mt-1 text-xs text-destructive">Delivery price is required</p>
              )}
            </div>

            {/* Pick-up & Didi */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">Pick-up</span>
                    <p className="text-xs text-muted-foreground">Price</p>
                  </div>
                  <Switch checked={pickupEnabled} onCheckedChange={setPickupEnabled} />
                </div>
                <div className="relative">
                  <Input
                    placeholder="Please enter"
                    disabled={!pickupEnabled}
                    value={pickupPrice}
                    onChange={(e) => setPickupPrice(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R$</span>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">Didi - your business</span>
                    <p className="text-xs text-muted-foreground">Price</p>
                  </div>
                  <Switch checked={didiEnabled} onCheckedChange={setDidiEnabled} />
                </div>
                <div className="relative">
                  <Input placeholder="Please enter" disabled={!didiEnabled} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R$</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stocking */}
          <div>
            <label className="mb-2 block text-sm font-medium">Stocking</label>
            <RadioGroup value={stockType} onValueChange={setStockType} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="unlimited" id="stock-unlimited" />
                <Label htmlFor="stock-unlimited">Unlimited</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="custom" id="stock-custom" />
                <Label htmlFor="stock-custom">Custom</Label>
              </div>
            </RadioGroup>
            {stockType === "custom" && (
              <Input
                className="mt-2 w-32"
                placeholder="Number"
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
              />
            )}
          </div>

          {/* Can Be Sold Separately */}
          <div>
            <label className="mb-2 block text-sm font-medium">Can Be Sold Separately</label>
            <RadioGroup value={canSoldSeparately} onValueChange={setCanSoldSeparately} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="sep-yes" />
                <Label htmlFor="sep-yes">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="sep-no" />
                <Label htmlFor="sep-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sale Time */}
          <div>
            <label className="mb-2 block text-sm font-medium">Sale Time</label>
            <RadioGroup value={saleTimeType} onValueChange={setSaleTimeType} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="weekly" id="time-weekly" />
                <Label htmlFor="time-weekly">Weekly-cycle</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="specific" id="time-specific" />
                <Label htmlFor="time-specific">Specific time</Label>
              </div>
            </RadioGroup>
          </div>

          </div>{/* end sales info section */}

        </div>{/* end max-w-2xl */}
      </div>{/* end form content */}

      {/* Sticky bottom action buttons */}
      <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isEdit ? "Save" : "Submit"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Discard
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewItemPage;
