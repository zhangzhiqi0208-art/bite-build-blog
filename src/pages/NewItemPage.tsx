import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { ArrowLeft, ImagePlus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const allergens = ["Diary", "Eggs", "Fish", "Diary", "Eggs", "Fish", "Diary", "Eggs", "Fish", "Diary", "Eggs", "Fish"];

const NewItemPage = () => {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState<"items" | "combo">("items");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [didiEnabled, setDidiEnabled] = useState(false);
  const [stockType, setStockType] = useState("unlimited");
  const [canSoldSeparately, setCanSoldSeparately] = useState("yes");
  const [containsAlcohol, setContainsAlcohol] = useState("no");
  const [saleTimeType, setSaleTimeType] = useState("weekly");
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  const toggleAllergen = (idx: number) => {
    setSelectedAllergens((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm font-medium">New Item</span>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-6 border-b border-border">
          <button className="border-b-2 border-foreground pb-2 text-sm font-semibold">Basic Info</button>
          <button className="pb-2 text-sm text-muted-foreground hover:text-foreground">Modifications</button>
          <button className="pb-2 text-sm text-muted-foreground hover:text-foreground">Sales Info</button>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Item Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              菜品类型 <span className="text-destructive">*</span>
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
              <Input placeholder="Please enter" maxLength={50} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">0/50</span>
            </div>
          </div>

          {/* PDV Code */}
          <div>
            <label className="mb-1 block text-sm font-medium">PDV Code</label>
            <div className="relative">
              <Input placeholder="Please enter" maxLength={50} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">0/50</span>
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
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary">
                <ImagePlus className="mb-1 h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add Image</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Upload</Button>
                <Button variant="outline" size="sm" className="text-muted-foreground">Delete</Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea
              placeholder="Please enter details like ingredients, weight, portion size etc"
              rows={4}
            />
          </div>

          {/* Store-defined Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Store-defined Category <span className="text-destructive">*</span> ℹ
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="burgers">Burgers</SelectItem>
                <SelectItem value="combos">Combos</SelectItem>
                <SelectItem value="sides">Sides</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Modification Group */}
          <div>
            <label className="mb-2 block text-sm font-medium">Modification group</label>
            <Button variant="outline" className="w-full gap-1">
              <Plus className="h-4 w-4" />
              Add group
            </Button>
          </div>

          {/* Price */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Price <span className="text-destructive">*</span>
            </label>
            <p className="mb-3 text-xs text-ring">
              ● 自提与DiDi Your Business渠道的定价需低于外卖价格(PM提供文案)
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
                <Input placeholder="Please enter" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R$</span>
              </div>
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
                  <Input placeholder="Please enter" disabled={!pickupEnabled} />
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
                <Label htmlFor="stock-custom">自定义</Label>
              </div>
            </RadioGroup>
            {stockType === "custom" && (
              <Input className="mt-2 w-32" placeholder="Number" type="number" />
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
            <label className="mb-2 block text-sm font-medium">售卖时段</label>
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

          {/* Action buttons */}
          <div className="flex gap-3 border-t border-border pt-6 pb-10">
            <Button variant="outline" onClick={() => navigate("/")}>
              Discard
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewItemPage;
