"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Eye, ImagePlus, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  defaultQaleenCatalog,
  formatQaleenMoney,
  qaleenAdminSessionKey,
  normalizeQaleenCatalog,
  qaleenOrderStorageKey,
  qaleenCatalogStorageKey,
  type QaleenCatalog,
  type QaleenOrder,
  type QaleenProduct,
  type QaleenSettings
} from "@/lib/qaleen-catalog";

type AdminTab = "settings" | "products" | "editor" | "orders";

const emptyProduct = (): QaleenProduct => ({
  id: `rug-${Date.now()}`,
  name: "New Qaleen",
  collection: "Persian Irani Rugs",
  type: "Persian Rug",
  origin: "Imported",
  dimensions: "4 x 6 ft",
  material: "Wool",
  color: "Ruby",
  price: 0,
  compareAtPrice: undefined,
  stock: 1,
  image: "/qaleen/owner-products/qaleen-01.png",
  images: ["/qaleen/owner-products/qaleen-01.png"],
  badge: "",
  status: "Available",
  isFeatured: false,
  description: "Short product description for customer display.",
  isActive: true
});

export function QaleenAdmin() {
  const [catalog, setCatalog] = useState<QaleenCatalog>(defaultQaleenCatalog);
  const [selectedId, setSelectedId] = useState(defaultQaleenCatalog.products[0]?.id || "");
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [savedAt, setSavedAt] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState<QaleenOrder[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(qaleenCatalogStorageKey);
      if (stored) {
        const loaded = normalizeQaleenCatalog(JSON.parse(stored));
        setCatalog(loaded);
        setSelectedId(loaded.products[0]?.id || "");
      }
      setIsAuthed(window.localStorage.getItem(qaleenAdminSessionKey) === "yes");
      const storedOrders = window.localStorage.getItem(qaleenOrderStorageKey);
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);
    } catch {
      setCatalog(defaultQaleenCatalog);
    }
  }, []);

  const selectedProduct = useMemo(
    () => catalog.products.find((product) => product.id === selectedId) || catalog.products[0],
    [catalog.products, selectedId]
  );

  const activeCount = catalog.products.filter((product) => product.isActive).length;
  const inventoryValue = catalog.products.reduce((sum, product) => sum + product.price * product.stock, 0);

  function saveCatalog(nextCatalog = catalog) {
    const normalized = normalizeQaleenCatalog(nextCatalog);
    setCatalog(normalized);
    window.localStorage.setItem(qaleenCatalogStorageKey, JSON.stringify(normalized));
    setSavedAt(new Date().toLocaleTimeString());
  }

  function updateSettings<K extends keyof QaleenSettings>(key: K, value: QaleenSettings[K]) {
    setCatalog((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }

  function updateProduct<K extends keyof QaleenProduct>(id: string, key: K, value: QaleenProduct[K]) {
    setCatalog((current) => ({
      ...current,
      products: current.products.map((product) => product.id === id ? { ...product, [key]: value } : product)
    }));
  }

  function addProduct() {
    const product = emptyProduct();
    setCatalog((current) => ({ ...current, products: [product, ...current.products] }));
    setSelectedId(product.id);
    setActiveTab("editor");
  }

  function deleteProduct(id: string) {
    const nextProducts = catalog.products.filter((product) => product.id !== id);
    const nextCatalog = { ...catalog, products: nextProducts.length ? nextProducts : [emptyProduct()] };
    setSelectedId(nextCatalog.products[0].id);
    saveCatalog(nextCatalog);
    setActiveTab("products");
  }

  function resetCatalog() {
    setSelectedId(defaultQaleenCatalog.products[0]?.id || "");
    saveCatalog(defaultQaleenCatalog);
  }

  function uploadImage(callback: (dataUrl: string) => void, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") callback(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function uploadGallery(product: QaleenProduct, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.readAsDataURL(file);
    }))).then((images) => {
      const cleanImages = images.filter(Boolean);
      updateProduct(product.id, "images", Array.from(new Set([...(product.images || []), ...cleanImages])) as QaleenProduct["images"]);
      if (!product.image && cleanImages[0]) updateProduct(product.id, "image", cleanImages[0]);
    });
  }

  function login() {
    if (password === catalog.settings.adminPassword) {
      window.localStorage.setItem(qaleenAdminSessionKey, "yes");
      setIsAuthed(true);
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("Wrong password. Default demo password is admin123 unless changed in settings.");
    }
  }

  function logout() {
    window.localStorage.removeItem(qaleenAdminSessionKey);
    setIsAuthed(false);
  }

  function updateOrderStatus(id: string, status: QaleenOrder["status"]) {
    const nextOrders = orders.map((order) => order.id === id ? { ...order, status } : order);
    setOrders(nextOrders);
    window.localStorage.setItem(qaleenOrderStorageKey, JSON.stringify(nextOrders));
  }

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8EDE3] px-4 text-[#111111]">
        <section className="w-full max-w-sm border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-[#6f5648]">Qaleen Admin</p>
          <h1 className="mt-1 text-xl font-black">Owner login</h1>
          <p className="mt-2 text-sm leading-6 text-[#666666]">Enter the admin password to manage products, orders, pricing, images, delivery cities, and store settings.</p>
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-black uppercase">Password</span>
            <input className="h-10 w-full border px-3 text-sm" type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") login(); }} />
          </label>
          {loginError ? <p className="mt-2 text-xs font-bold text-red-700">{loginError}</p> : null}
          <button onClick={login} className="mt-4 h-10 w-full bg-[#111111] px-4 text-xs font-black uppercase text-white">Login</button>
          <Link href="/" className="mt-3 inline-flex h-10 w-full items-center justify-center border text-xs font-black uppercase">Public website</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8EDE3] text-[#111111]">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase text-[#6f5648]">Qaleen Admin</p>
            <h1 className="truncate text-lg font-black">Catalog management</h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/" className="inline-flex h-9 items-center gap-2 border bg-white px-3 text-xs font-black uppercase">
              <Eye className="h-4 w-4" />
              Public
            </Link>
            <button onClick={() => saveCatalog()} className="inline-flex h-9 items-center gap-2 bg-[#111111] px-3 text-xs font-black uppercase text-white">
              <Save className="h-4 w-4" />
              Save
            </button>
            <button onClick={logout} className="inline-flex h-9 items-center gap-2 border bg-white px-3 text-xs font-black uppercase">
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Active products" value={String(activeCount)} />
          <Stat label="Total products" value={String(catalog.products.length)} />
          <Stat label="Inventory value" value={formatQaleenMoney(inventoryValue)} />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto border-b bg-white px-2 pt-2">
          <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")}>Products</TabButton>
          <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>Orders</TabButton>
          <TabButton active={activeTab === "editor"} onClick={() => setActiveTab("editor")}>Edit Product</TabButton>
          <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Store Settings</TabButton>
        </div>

        <div className="border-x border-b bg-white p-4">
          {activeTab === "products" ? (
            <ProductsTab
              products={catalog.products}
              selectedId={selectedId}
              onAdd={addProduct}
              onEdit={(id) => {
                setSelectedId(id);
                setActiveTab("editor");
              }}
              onToggle={(id, checked) => updateProduct(id, "isActive", checked)}
            />
          ) : null}

          {activeTab === "settings" ? (
            <SettingsTab
              settings={catalog.settings}
              savedAt={savedAt}
              onChange={updateSettings}
              onUploadHero={(event) => uploadImage((dataUrl) => updateSettings("heroImage", dataUrl), event)}
            />
          ) : null}

          {activeTab === "orders" ? (
            <OrdersTab orders={orders} onStatus={updateOrderStatus} />
          ) : null}

          {activeTab === "editor" && selectedProduct ? (
            <EditorTab
              product={selectedProduct}
              onChange={updateProduct}
              onDelete={() => deleteProduct(selectedProduct.id)}
              onUpload={(event) => uploadImage((dataUrl) => updateProduct(selectedProduct.id, "image", dataUrl), event)}
              onGalleryUpload={(event) => uploadGallery(selectedProduct, event)}
            />
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => saveCatalog()} className="inline-flex h-10 items-center gap-2 bg-[#111111] px-4 text-xs font-black uppercase text-white">
            <Save className="h-4 w-4" />
            Save all changes
          </button>
          <button onClick={resetCatalog} className="inline-flex h-10 items-center gap-2 border bg-white px-4 text-xs font-black uppercase">
            <RotateCcw className="h-4 w-4" />
            Reset demo
          </button>
          {savedAt ? <p className="self-center text-xs text-[#666666]">Last saved at {savedAt}</p> : null}
        </div>
      </section>
    </main>
  );
}

function ProductsTab({
  products,
  selectedId,
  onAdd,
  onEdit,
  onToggle
}: {
  products: QaleenProduct[];
  selectedId: string;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black">Products</h2>
          <p className="text-xs text-[#666666]">Manage qaleen names, prices, dimensions, stock, and visibility.</p>
        </div>
        <button onClick={onAdd} className="inline-flex h-9 items-center gap-1 bg-[#111111] px-3 text-xs font-black uppercase text-white">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-[#f7f7f7] text-left text-xs uppercase text-[#666666]">
            <tr>
              <th className="border p-2">Product</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Dimensions</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Visible</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={product.id === selectedId ? "bg-[#DFD3C3]" : "bg-white"}>
                <td className="border p-2">
                  <div className="flex items-center gap-2">
                    <img src={product.image} alt="" className="h-12 w-12 object-contain" />
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-bold">{product.name}</p>
                      <p className="text-xs text-[#777777]">{product.collection}</p>
                    </div>
                  </div>
                </td>
                <td className="border p-2">{product.type}</td>
                <td className="border p-2">{product.dimensions}</td>
                <td className="border p-2 font-bold">{formatQaleenMoney(product.price)}</td>
                <td className="border p-2">{product.stock}</td>
                <td className="border p-2">{product.status || "Available"}</td>
                <td className="border p-2">
                  <input type="checkbox" checked={product.isActive} onChange={(event) => onToggle(product.id, event.target.checked)} />
                </td>
                <td className="border p-2">
                  <button onClick={() => onEdit(product.id)} className="border px-3 py-1 text-xs font-black uppercase">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab({
  settings,
  savedAt,
  onChange,
  onUploadHero
}: {
  settings: QaleenSettings;
  savedAt: string;
  onChange: <K extends keyof QaleenSettings>(key: K, value: QaleenSettings[K]) => void;
  onUploadHero: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-black">Store settings</h2>
        <p className="text-xs text-[#666666]">These values control the public display and WhatsApp inquiry flow.</p>
        {savedAt ? <p className="mt-1 text-xs text-[#6f5648]">Saved {savedAt}</p> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Store name" value={settings.storeName} onChange={(value) => onChange("storeName", value)} />
        <Field label="Tagline" value={settings.tagline} onChange={(value) => onChange("tagline", value)} />
        <Field label="Announcement bar" value={settings.announcement} onChange={(value) => onChange("announcement", value)} />
        <Field label="WhatsApp number" value={settings.whatsappNumber} onChange={(value) => onChange("whatsappNumber", value)} />
        <Field label="Admin password" value={settings.adminPassword} onChange={(value) => onChange("adminPassword", value)} />
        <Field label="Hero title" value={settings.heroTitle} onChange={(value) => onChange("heroTitle", value)} />
        <Field label="Delivery text" value={settings.deliveryText} onChange={(value) => onChange("deliveryText", value)} />
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-black uppercase">Delivery cities</span>
          <input className="h-10 w-full border px-3 text-sm" value={settings.deliveryCities.join(", ")} onChange={(event) => onChange("deliveryCities", event.target.value.split(",").map((city) => city.trim()).filter(Boolean))} />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-black uppercase">Hero text</span>
          <textarea className="min-h-20 w-full border px-3 py-2 text-sm" value={settings.heroText} onChange={(event) => onChange("heroText", event.target.value)} />
        </label>
        <label className="flex cursor-pointer items-center gap-3 border bg-[#DFD3C3] p-3 md:col-span-2">
          <img src={settings.heroImage} alt="" className="h-16 w-24 object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black">Hero image</span>
            <span className="block text-xs text-[#666666]">Upload a banner image for the public page.</span>
          </span>
          <ImagePlus className="h-5 w-5" />
          <input type="file" accept="image/*" className="hidden" onChange={onUploadHero} />
        </label>
      </div>
    </div>
  );
}

function OrdersTab({ orders, onStatus }: { orders: QaleenOrder[]; onStatus: (id: string, status: QaleenOrder["status"]) => void }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-black">Orders</h2>
        <p className="text-xs text-[#666666]">Orders are saved when the customer clicks Place order on WhatsApp.</p>
      </div>

      {orders.length ? (
        <div className="grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="border bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                <div>
                  <p className="text-xs font-black uppercase text-[#6f5648]">{order.id}</p>
                  <h3 className="text-base font-black">{order.customer.name || "Customer"} | {order.customer.phone || "No phone"}</h3>
                  <p className="text-xs text-[#666666]">{new Date(order.createdAt).toLocaleString()} | {order.customer.city || "City not provided"}</p>
                </div>
                <select className="h-9 border px-3 text-sm" value={order.status} onChange={(event) => onStatus(order.id, event.target.value as QaleenOrder["status"])}>
                  <option>WhatsApp sent</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div className="mt-3 grid gap-2">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.id}`} className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-2 text-sm">
                    <img src={item.image} alt="" className="h-14 w-14 border object-contain" />
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-bold">{item.quantity} x {item.name}</p>
                      <p className="text-xs text-[#666666]">{item.dimensions} | {item.material}</p>
                    </div>
                    <p className="font-black">{formatQaleenMoney(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-1 border-t pt-3 text-xs text-[#666666]">
                <p><span className="font-black text-[#111111]">Address:</span> {order.customer.address || "Not provided"}</p>
                <p><span className="font-black text-[#111111]">Delivery:</span> {order.customer.delivery} | <span className="font-black text-[#111111]">Payment:</span> {order.customer.payment}</p>
                {order.customer.note ? <p><span className="font-black text-[#111111]">Note:</span> {order.customer.note}</p> : null}
                <p className="mt-2 text-base font-black text-[#111111]">Total: {formatQaleenMoney(order.total)}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border bg-[#DFD3C3] p-5 text-sm text-[#666666]">No saved orders yet. Place a test order from the public website to see it here.</div>
      )}
    </div>
  );
}

function EditorTab({
  product,
  onChange,
  onDelete,
  onUpload,
  onGalleryUpload
}: {
  product: QaleenProduct;
  onChange: <K extends keyof QaleenProduct>(id: string, key: K, value: QaleenProduct[K]) => void;
  onDelete: () => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onGalleryUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black">Edit product</h2>
          <p className="truncate text-xs text-[#666666]">{product.name}</p>
        </div>
        <button onClick={onDelete} className="inline-flex h-9 items-center gap-2 border border-red-300 px-3 text-xs font-black uppercase text-red-700">
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="border bg-[#DFD3C3] p-3">
            <img src={product.image} alt="" className="aspect-square w-full object-contain" />
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 bg-[#111111] px-3 py-3 text-xs font-black uppercase text-white">
            <ImagePlus className="h-4 w-4" />
            Upload image
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 border bg-white px-3 py-3 text-xs font-black uppercase">
            <ImagePlus className="h-4 w-4" />
            Add gallery photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={onGalleryUpload} />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={product.isActive} onChange={(event) => onChange(product.id, "isActive", event.target.checked)} />
            Show on public page
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={Boolean(product.isFeatured)} onChange={(event) => onChange(product.id, "isFeatured", event.target.checked)} />
            Feature on home page
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name" value={product.name} onChange={(value) => onChange(product.id, "name", value)} />
          <Field label="Collection" value={product.collection} onChange={(value) => onChange(product.id, "collection", value)} />
          <Field label="Type of qaleen" value={product.type} onChange={(value) => onChange(product.id, "type", value)} />
          <Field label="Origin" value={product.origin} onChange={(value) => onChange(product.id, "origin", value)} />
          <Field label="Dimensions" value={product.dimensions} onChange={(value) => onChange(product.id, "dimensions", value)} />
          <Field label="Material / weave" value={product.material} onChange={(value) => onChange(product.id, "material", value)} />
          <Field label="Color tone" value={product.color} onChange={(value) => onChange(product.id, "color", value)} />
          <Field label="Badge" value={product.badge || ""} onChange={(value) => onChange(product.id, "badge", value)} />
          <label>
            <span className="mb-1 block text-xs font-black uppercase">Availability status</span>
            <select className="h-10 w-full border px-3 text-sm" value={product.status || "Available"} onChange={(event) => onChange(product.id, "status", event.target.value as QaleenProduct["status"])}>
              <option>Available</option>
              <option>Reserved</option>
              <option>Sold</option>
            </select>
          </label>
          <NumberField label="Price" value={product.price} onChange={(value) => onChange(product.id, "price", value)} />
          <NumberField label="Compare at price" value={product.compareAtPrice || 0} onChange={(value) => onChange(product.id, "compareAtPrice", value || undefined)} />
          <NumberField label="Stock quantity" value={product.stock} onChange={(value) => onChange(product.id, "stock", value)} />
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-black uppercase">Gallery image URLs</span>
            <textarea className="min-h-20 w-full border px-3 py-2 text-sm" value={(product.images || [product.image]).join("\n")} onChange={(event) => onChange(product.id, "images", event.target.value.split("\n").map((image) => image.trim()).filter(Boolean))} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-black uppercase">Description</span>
            <textarea className="min-h-20 w-full border px-3 py-2 text-sm" value={product.description} onChange={(event) => onChange(product.id, "description", event.target.value)} />
          </label>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`h-10 min-w-max border-x border-t px-4 text-xs font-black uppercase ${active ? "bg-white text-[#111111]" : "bg-[#f7f7f7] text-[#666666]"}`}>
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border bg-white p-3">
      <p className="truncate text-sm font-black sm:text-base">{value}</p>
      <p className="text-[10px] uppercase text-[#777777]">{label}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black uppercase">{label}</span>
      <input className="h-10 w-full border px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black uppercase">{label}</span>
      <input className="h-10 w-full border px-3 text-sm" type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

