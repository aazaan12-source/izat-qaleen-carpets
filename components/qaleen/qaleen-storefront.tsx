"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ClipboardList, Heart, Menu, MessageCircle, Minus, Phone, Plus, Search, ShoppingBag, SlidersHorizontal, Truck, X, ZoomIn, type LucideIcon } from "lucide-react";
import { fetchQaleenCatalog, saveQaleenOrder } from "@/lib/qaleen-api-client";
import {
  defaultQaleenCatalog,
  formatQaleenMoney,
  normalizeQaleenCatalog,
  qaleenOrderStorageKey,
  qaleenCatalogStorageKey,
  qaleenWhatsappUrl,
  type QaleenCatalog,
  type QaleenOrder,
  type QaleenProduct
} from "@/lib/qaleen-catalog";

type QaleenStorefrontProps = {
  initialCollection?: string;
  initialType?: string;
};

export function QaleenStorefront({ initialCollection = "All", initialType = "All types" }: QaleenStorefrontProps = {}) {
  const [catalog, setCatalog] = useState<QaleenCatalog>(defaultQaleenCatalog);
  const [activeCollection, setActiveCollection] = useState(initialCollection);
  const [activeType, setActiveType] = useState(initialType);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<QaleenProduct | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [imageZoomed, setImageZoomed] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState("All prices");
  const [sizeFilter, setSizeFilter] = useState("All sizes");
  const [colorFilter, setColorFilter] = useState("All colors");
  const [availabilityFilter, setAvailabilityFilter] = useState("Available only");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    delivery: "Home delivery",
    payment: "Confirm on WhatsApp",
    note: ""
  });

  useEffect(() => {
    let isMounted = true;

    try {
      const stored = window.localStorage.getItem(qaleenCatalogStorageKey);
      if (stored) setCatalog(normalizeQaleenCatalog(JSON.parse(stored)));
    } catch {
      setCatalog(defaultQaleenCatalog);
    }

    fetchQaleenCatalog().then((remoteCatalog) => {
      if (!isMounted || !remoteCatalog) return;
      const normalized = normalizeQaleenCatalog(remoteCatalog);
      setCatalog(normalized);
      window.localStorage.setItem(qaleenCatalogStorageKey, JSON.stringify(normalized));
    }).catch(() => {
      // Local storage remains the offline fallback.
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (selected) {
      setActiveImage((selected.images?.[0] || selected.image));
      setImageZoomed(false);
    }
  }, [selected]);

  const products = catalog.products.filter((product) => product.isActive);
  const collections = ["All", ...Array.from(new Set(products.map((product) => product.collection).filter(Boolean)))];
  const types = ["All types", ...Array.from(new Set(products.map((product) => product.type).filter(Boolean)))];
  const colors = ["All colors", ...Array.from(new Set(products.map((product) => product.color.split(" and ")[0]).filter(Boolean)))];
  const sizeGroups = ["All sizes", "Small", "Medium", "Large", "Runner", "Round"];
  const featuredProducts = products.filter((product) => product.isFeatured && product.status !== "Sold").slice(0, 8);
  const newArrivals = products.filter((product) => product.badge === "New" && product.status !== "Sold").slice(0, 4);
  const saleProducts = products.filter((product) => product.badge === "Sale" && product.status !== "Sold").slice(0, 4);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const collectionMatch = activeCollection === "All" || product.collection === activeCollection;
      const typeMatch = activeType === "All types" || product.type === activeType;
      const colorMatch = colorFilter === "All colors" || product.color.toLowerCase().includes(colorFilter.toLowerCase());
      const sizeMatch = sizeFilter === "All sizes" || productSizeGroup(product.dimensions) === sizeFilter;
      const availabilityMatch = availabilityFilter === "All stock" || product.status !== "Sold";
      const priceMatch =
        priceFilter === "All prices" ||
        (priceFilter === "Under Rs. 100k" && product.price < 100000) ||
        (priceFilter === "Rs. 100k - 150k" && product.price >= 100000 && product.price <= 150000) ||
        (priceFilter === "Above Rs. 150k" && product.price > 150000);
      const queryMatch = normalized
        ? `${product.name} ${product.collection} ${product.type} ${product.origin} ${product.dimensions} ${product.color} ${product.material}`.toLowerCase().includes(normalized)
        : true;
      return collectionMatch && typeMatch && colorMatch && sizeMatch && availabilityMatch && priceMatch && queryMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "stock") return b.stock - a.stock;
      return products.findIndex((product) => product.id === a.id) - products.findIndex((product) => product.id === b.id);
    });
  }, [activeCollection, activeType, availabilityFilter, colorFilter, priceFilter, products, query, sizeFilter, sort]);

  const cartCount = Object.values(cart).reduce((sum, value) => sum + value, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + (product ? product.price * quantity : 0);
  }, 0);

  const cartProducts = Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity }))
    .filter((item): item is { product: QaleenProduct; quantity: number } => Boolean(item.product));

  const inquiryMessage = cartProducts.length
    ? [
        `Assalam o Alaikum, I want to inquire about ${catalog.settings.storeName}:`,
        ...cartProducts.map(({ product, quantity }) => `- ${quantity} x ${product.name} (${product.dimensions}) ${formatQaleenMoney(product.price)}`),
        `Estimated total: ${formatQaleenMoney(cartTotal)}`
      ].join("\n")
    : `Assalam o Alaikum, I want to ask about ${catalog.settings.storeName} qaleen collection.`;

  const cleanSupplierNumber = catalog.settings.whatsappNumber.replace(/[^\d]/g, "") || "923001234567";
  const supplierCallUrl = `tel:+${cleanSupplierNumber}`;
  const orderMessage = [
    `Assalam o Alaikum, I want to place a qaleen order from ${catalog.settings.storeName}.`,
    "",
    "Customer details:",
    `Name: ${customer.name.trim() || "Not provided"}`,
    `Phone: ${customer.phone.trim() || "Not provided"}`,
    `City: ${customer.city.trim() || "Not provided"}`,
    `Address: ${customer.address.trim() || "Not provided"}`,
    `Delivery: ${customer.delivery}`,
    `Payment: ${customer.payment}`,
    "",
    "Selected items:",
    ...(cartProducts.length
      ? cartProducts.map(({ product, quantity }) => {
          const lineTotal = product.price * quantity;
          return `- ${quantity} x ${product.name} | ${product.dimensions} | ${product.material} | ${formatQaleenMoney(product.price)} each | Total ${formatQaleenMoney(lineTotal)}`;
        })
      : ["No product selected yet."]),
    "",
    `Estimated total: ${formatQaleenMoney(cartTotal)}`,
    customer.note.trim() ? `Note: ${customer.note.trim()}` : "",
    "",
    "Please confirm availability, final delivery charges if any, and payment method."
  ].filter(Boolean).join("\n");
  const orderWhatsappUrl = qaleenWhatsappUrl(catalog.settings.whatsappNumber, orderMessage);
  const selectedImages = selected ? Array.from(new Set([...(selected.images || []), selected.image].filter(Boolean))) : [];

  function updateCustomer(key: keyof typeof customer, value: string) {
    setCustomer((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setActiveCollection("All");
    setActiveType("All types");
    setPriceFilter("All prices");
    setSizeFilter("All sizes");
    setColorFilter("All colors");
    setAvailabilityFilter("Available only");
    setQuery("");
  }

  function scrollToSection(id: string) {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function showCollection(collection: string) {
    setActiveCollection(collection);
    setActiveType("All types");
    setFiltersOpen(false);
    scrollToSection("collections");
  }

  async function saveOrderRecord() {
    if (!cartProducts.length || typeof window === "undefined") return;
    const order: QaleenOrder = {
      id: `QA-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer,
      items: cartProducts.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        dimensions: product.dimensions,
        material: product.material,
        image: product.image,
        quantity,
        price: product.price
      })),
      total: cartTotal,
      status: "WhatsApp sent"
    };

    const stored = window.localStorage.getItem(qaleenOrderStorageKey);
    const orders = stored ? JSON.parse(stored) as QaleenOrder[] : [];
    window.localStorage.setItem(qaleenOrderStorageKey, JSON.stringify([order, ...orders]));
    try {
      await saveQaleenOrder(order);
    } catch {
      // The browser copy already saved the order if Supabase is unavailable.
    }
  }

  function changeCart(id: string, delta: number) {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[id] || 0) + delta);
      const next = { ...current };
      if (nextQuantity === 0) delete next[id];
      else next[id] = nextQuantity;
      return next;
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-20 text-[#111111]">
      <div className="truncate bg-[#111111] px-3 py-2 text-center text-[10px] font-semibold uppercase text-white sm:text-xs">
        {catalog.settings.announcement}
      </div>

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <button className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)} aria-label={`${catalog.settings.storeName} home`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#111111] text-xs font-black">
              {catalog.settings.storeName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-[13px] font-black uppercase tracking-wide">{catalog.settings.storeName}</span>
              <span className="block truncate text-[10px] uppercase text-[#777777]">{catalog.settings.tagline}</span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-wide lg:flex">
            <button onClick={() => showCollection("All")} className="hover:text-[#6f5648]">Collections</button>
            <button onClick={() => showCollection("Persian Irani Rugs")} className="hover:text-[#6f5648]">Persian</button>
            <button onClick={() => showCollection("Runners")} className="hover:text-[#6f5648]">Runners</button>
            <button onClick={() => showCollection("Round Rugs")} className="hover:text-[#6f5648]">Round Rugs</button>
            <button onClick={() => scrollToSection("featured")} className="hover:text-[#6f5648]">Featured</button>
            <button onClick={() => scrollToSection("contact")} className="hover:text-[#6f5648]">Contact</button>
            <a href="/admin" className="hover:text-[#6f5648]">Admin</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button className="relative hidden h-9 border px-3 sm:block" onClick={() => setOrderPanelOpen(true)} aria-label="Open cart and order form">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 ? <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D0B8A8] px-1 text-[10px] font-black text-[#111111]">{cartCount}</span> : null}
            </button>
            <button className="h-9 border px-3 lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Open menu">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="grid gap-3 border-t px-4 py-4 text-sm font-bold uppercase lg:hidden">
            <button className="text-left" onClick={() => { setMenuOpen(false); showCollection("All"); }}>Collections</button>
            <button className="text-left" onClick={() => { setMenuOpen(false); showCollection("Persian Irani Rugs"); }}>Persian</button>
            <button className="text-left" onClick={() => { setMenuOpen(false); showCollection("Runners"); }}>Runners</button>
            <button className="text-left" onClick={() => { setMenuOpen(false); showCollection("Round Rugs"); }}>Round Rugs</button>
            <button className="text-left" onClick={() => { setMenuOpen(false); scrollToSection("featured"); }}>Featured</button>
            <button className="text-left" onClick={() => { setMenuOpen(false); scrollToSection("contact"); }}>Contact</button>
            <a href="/admin" onClick={() => setMenuOpen(false)}>Admin</a>
          </div>
        ) : null}
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="relative min-h-[170px] overflow-hidden bg-[#F8EDE3] sm:min-h-[260px]">
          <img src={catalog.settings.heroImage} alt="" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-wide">Collection</p>
            <h1 className="mt-1 max-w-lg text-xl font-black leading-tight sm:text-3xl">{catalog.settings.heroTitle}</h1>
            <p className="mt-2 max-w-md text-xs leading-5 text-white/90 sm:text-sm">{catalog.settings.heroText}</p>
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <Feature title={catalog.settings.deliveryText} body="Doorstep delivery and handling guidance." icon={Truck} />
        <Feature title="WhatsApp order" body="Send selected items and delivery details straight to the supplier." icon={MessageCircle} />
        <Feature title="Supplier response" body="Customer phone, address, and notes travel with the order for quick follow-up." icon={ClipboardList} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <FeaturedBand title="New arrivals" products={newArrivals} onSelect={setSelected} />
          <FeaturedBand title="Sale highlights" products={saleProducts} onSelect={setSelected} />
        </div>
        <div className="mt-4">
          <FeaturedBand title="Featured qaleen selection" products={featuredProducts} onSelect={setSelected} compact />
        </div>
      </section>

      <section id="collections" className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-[#777777]">Shop by collection</p>
            <h2 className="text-lg font-black sm:text-xl">Buy rugs and qaleen online</h2>
          </div>
          <button className="flex h-9 shrink-0 items-center gap-2 border px-2 text-xs font-bold uppercase lg:hidden" onClick={() => setFiltersOpen((value) => !value)}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden min-[360px]:inline">Filter</span>
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className={`${filtersOpen ? "block" : "hidden"} border bg-[#DFD3C3] p-4 lg:block`}>
            <div className="space-y-5">
              <FilterBlock title="Collections">
                {collections.map((collection) => (
                  <button key={collection} onClick={() => setActiveCollection(collection)} className={`block w-full border-b py-2 text-left text-sm ${activeCollection === collection ? "font-black text-[#6f5648]" : "text-[#333333]"}`}>
                    {collection}
                  </button>
                ))}
              </FilterBlock>

              <FilterBlock title="Qaleen type">
                {types.map((type) => (
                  <button key={type} onClick={() => setActiveType(type)} className={`block w-full border-b py-2 text-left text-sm ${activeType === type ? "font-black text-[#6f5648]" : "text-[#333333]"}`}>
                    {type}
                  </button>
                ))}
              </FilterBlock>

              <FilterBlock title="Size">
                <select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)} className="h-10 w-full border bg-white px-3 text-sm">
                  {sizeGroups.map((size) => <option key={size}>{size}</option>)}
                </select>
              </FilterBlock>

              <FilterBlock title="Price">
                <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} className="h-10 w-full border bg-white px-3 text-sm">
                  {["All prices", "Under Rs. 100k", "Rs. 100k - 150k", "Above Rs. 150k"].map((price) => <option key={price}>{price}</option>)}
                </select>
              </FilterBlock>

              <FilterBlock title="Color">
                <select value={colorFilter} onChange={(event) => setColorFilter(event.target.value)} className="h-10 w-full border bg-white px-3 text-sm">
                  {colors.map((color) => <option key={color}>{color}</option>)}
                </select>
              </FilterBlock>

              <FilterBlock title="Availability">
                <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)} className="h-10 w-full border bg-white px-3 text-sm">
                  <option>Available only</option>
                  <option>All stock</option>
                </select>
              </FilterBlock>

              <button onClick={resetFilters} className="h-10 w-full border bg-white px-3 text-xs font-black uppercase">Reset filters</button>
            </div>
          </aside>

          <div>
            <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
              <label className="flex h-10 items-center gap-2 border px-3">
                <Search className="h-4 w-4 text-[#777777]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search qaleen, size, tone" className="h-full min-w-0 flex-1 text-sm outline-none" />
              </label>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 border bg-white px-3 text-sm">
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock available</option>
              </select>
            </div>

            <div className="mb-4 flex items-center justify-between border-b pb-3 text-xs uppercase text-[#777777]">
              <span>{visibleProducts.length} products</span>
              <span>{cartCount} in cart</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <article key={product.id} className="group">
                  <div className="relative border bg-[#f7f7f7]">
                    <button className="block aspect-[1/0.92] w-full p-2" onClick={() => setSelected(product)} aria-label={`View ${product.name}`}>
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]" />
                    </button>
                    {product.badge ? <span className="absolute left-2 top-2 bg-[#111111] px-2 py-1 text-[10px] font-black uppercase text-white">{product.badge}</span> : null}
                    {product.status && product.status !== "Available" ? <span className={`absolute bottom-2 left-2 px-2 py-1 text-[10px] font-black uppercase ${product.status === "Sold" ? "bg-[#777777] text-white" : "bg-[#D0B8A8] text-[#111111]"}`}>{product.status}</span> : null}
                    <button className="absolute right-2 top-2 bg-white p-2 shadow-sm" aria-label={`Save ${product.name}`}>
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="pt-3">
                    <button onClick={() => setSelected(product)} className="line-clamp-2 min-h-9 text-left text-[13px] font-semibold leading-5 hover:underline">
                      {product.name}
                    </button>
                      <p className="mt-1 truncate text-xs text-[#777777]">{product.dimensions} | {product.material}</p>
                    <p className="mt-1 text-xs text-[#777777]">{product.status || "Available"} | Stock: {product.stock}</p>
                    <div className="mt-2 min-h-10">
                      {product.compareAtPrice ? <p className="text-xs text-[#999999] line-through">{formatQaleenMoney(product.compareAtPrice)}</p> : null}
                      <p className="text-[13px] font-black">{formatQaleenMoney(product.price)}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button onClick={() => setSelected(product)} className="text-xs font-bold uppercase underline underline-offset-4">Quick view</button>
                      <div className="flex items-center border">
                        <button className="p-1.5" onClick={() => changeCart(product.id, -1)} aria-label={`Remove ${product.name}`}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-black">{cart[product.id] || 0}</span>
                        <button className="p-1.5 disabled:opacity-40" disabled={product.status === "Sold"} onClick={() => changeCart(product.id, 1)} aria-label={`Add ${product.name}`}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 border p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="text-lg font-black">Need exact size, room preview, or bulk qaleen selection?</h2>
            <p className="mt-1 text-sm text-[#666666]">Send selected products to staff and confirm availability before payment.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setOrderPanelOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 bg-[#111111] px-4 text-xs font-black uppercase text-white">
              Order on WhatsApp <MessageCircle className="h-4 w-4" />
            </button>
            <a href={supplierCallUrl} className="inline-flex h-10 items-center justify-center gap-2 border px-4 text-xs font-black uppercase">
              Call supplier <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6" role="dialog" aria-modal="true" aria-label={`${selected.name} detail view`}>
          <div className="mx-auto grid h-[calc(100dvh-2rem)] max-w-6xl grid-rows-[minmax(0,45%)_minmax(0,55%)] overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1fr)_420px] lg:grid-rows-1">
            <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2 bg-[#F8EDE3] p-3 sm:p-5">
              <button className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden border bg-white p-2" onClick={() => setImageZoomed((value) => !value)} aria-label="Zoom product image">
                <img src={activeImage || selected.image} alt={selected.name} className={`max-h-full max-w-full object-contain transition duration-300 ${imageZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`} />
              </button>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 gap-2 overflow-x-auto">
                  {selectedImages.map((image) => (
                    <button key={image} onClick={() => { setActiveImage(image); setImageZoomed(false); }} className={`h-14 w-14 shrink-0 border bg-white p-1 ${activeImage === image ? "border-[#D0B8A8]" : ""}`} aria-label="View product gallery image">
                      <img src={image} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setImageZoomed((value) => !value)} className="inline-flex h-10 shrink-0 items-center gap-2 border bg-white px-3 text-xs font-black uppercase">
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </button>
              </div>
            </div>

            <aside className="min-h-0 overflow-y-scroll border-t bg-white pb-24 [scrollbar-gutter:stable] sm:pb-24 lg:border-l lg:border-t-0 lg:pb-5">
              <div className="sticky top-0 z-10 border-b bg-white/95 p-4 backdrop-blur sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {selected.badge ? <p className="mb-2 inline-flex bg-[#111111] px-2 py-1 text-[10px] font-black uppercase text-white">{selected.badge}</p> : null}
                    {selected.status && selected.status !== "Available" ? <p className="mb-2 ml-2 inline-flex bg-[#D0B8A8] px-2 py-1 text-[10px] font-black uppercase text-[#111111]">{selected.status}</p> : null}
                    <h3 className="text-lg font-black leading-6 sm:text-xl">{selected.name}</h3>
                    <p className="mt-2 text-xs font-bold uppercase text-[#6f5648]">{selected.collection}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="shrink-0 border p-2" aria-label="Close product detail">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3">
                  {selected.compareAtPrice ? <p className="text-sm text-[#999999] line-through">{formatQaleenMoney(selected.compareAtPrice)}</p> : null}
                  <p className="text-2xl font-black">{formatQaleenMoney(selected.price)}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 px-4 text-sm sm:px-5">
                <DetailItem label="Type" value={selected.type} />
                <DetailItem label="Size" value={selected.dimensions} />
                <DetailItem label="Material" value={selected.material} />
                <DetailItem label="Color" value={selected.color} />
                <DetailItem label="Origin" value={selected.origin} />
                <DetailItem label="Stock" value={`${selected.status || "Available"} | ${selected.stock} available`} />
              </div>

              <div className="mx-4 mt-5 border bg-[#DFD3C3] p-3 sm:mx-5">
                <p className="text-xs font-black uppercase">Quality notes</p>
                <p className="mt-2 text-sm leading-6 text-[#555555]">{selected.description}</p>
                <ul className="mt-3 grid gap-2 text-xs leading-5 text-[#555555]">
                  <li><span className="font-black text-[#111111]">Detail view:</span> Clicked image opens large so customers can inspect border, medallion, pile texture, and finishing.</li>
                  <li><span className="font-black text-[#111111]">Use:</span> Suitable for premium living rooms, bedrooms, offices, corridors, and display areas based on size.</li>
                  <li><span className="font-black text-[#111111]">Care:</span> Vacuum gently and rotate periodically for even wear.</li>
                </ul>
              </div>

              <div className="sticky bottom-0 mt-5 grid gap-2 border-t bg-white px-4 py-3 sm:grid-cols-2 sm:px-5 lg:static lg:mx-5 lg:grid-cols-1 lg:border-t-0 lg:px-0">
                <button disabled={selected.status === "Sold"} onClick={() => changeCart(selected.id, 1)} className="inline-flex h-11 items-center justify-center gap-2 bg-[#111111] px-4 text-xs font-black uppercase text-white disabled:bg-[#999999]">
                  Add to cart <ShoppingBag className="h-4 w-4" />
                </button>
                <button
                  disabled={selected.status === "Sold"}
                  onClick={() => {
                    changeCart(selected.id, 1);
                    setSelected(null);
                    setOrderPanelOpen(true);
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#D0B8A8] px-4 text-xs font-black uppercase text-[#111111] disabled:bg-[#999999]"
                >
                  Order this qaleen <MessageCircle className="h-4 w-4" />
                </button>
                <a
                  href={qaleenWhatsappUrl(catalog.settings.whatsappNumber, `Assalam o Alaikum, I want details for ${selected.name} (${selected.dimensions}) ${formatQaleenMoney(selected.price)}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 border px-4 text-xs font-black uppercase sm:col-span-2 lg:col-span-1"
                >
                  WhatsApp details <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {orderPanelOpen ? (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6" role="dialog" aria-modal="true" aria-label="Cart and WhatsApp order form">
          <div className="mx-auto flex h-[calc(100dvh-2rem)] max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b bg-white p-4 sm:p-5">
              <div>
                <p className="text-xs font-black uppercase text-[#6f5648]">Order</p>
                <h2 className="text-xl font-black">Cart and supplier details</h2>
              </div>
              <button onClick={() => setOrderPanelOpen(false)} className="border p-2" aria-label="Close order form">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-y-scroll [scrollbar-gutter:stable] lg:grid-cols-[minmax(0,1fr)_420px] lg:overflow-hidden">
              <section className="p-4 sm:p-5 lg:min-h-0 lg:overflow-y-scroll lg:[scrollbar-gutter:stable]">
                <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-[#6f5648]">Cart</p>
                  <h2 className="text-xl font-black">Selected qaleen for order</h2>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {cartProducts.length ? cartProducts.map(({ product, quantity }) => (
                  <article key={product.id} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border p-2">
                    <div className="h-24 border bg-[#f7f7f7] p-1">
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-black">{product.name}</h3>
                      <p className="mt-1 text-xs text-[#666666]">{product.dimensions} | {product.material}</p>
                      <p className="mt-1 text-xs font-bold">{formatQaleenMoney(product.price)} each</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center border">
                          <button className="p-2" onClick={() => changeCart(product.id, -1)} aria-label={`Remove ${product.name}`}>
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-black">{quantity}</span>
                          <button className="p-2" onClick={() => changeCart(product.id, 1)} aria-label={`Add ${product.name}`}>
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-black">{formatQaleenMoney(product.price * quantity)}</p>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="border bg-[#DFD3C3] p-5 text-sm text-[#666666]">
                    Add one or more qaleen from the product grid, then place the order on WhatsApp.
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm font-bold">Estimated total</span>
                <span className="text-xl font-black">{formatQaleenMoney(cartTotal)}</span>
              </div>
              </section>

              <aside className="border-t bg-[#DFD3C3] p-4 pb-24 sm:p-5 sm:pb-24 lg:min-h-0 lg:overflow-y-scroll lg:border-l lg:border-t-0 lg:pb-5 lg:[scrollbar-gutter:stable]">
              <p className="text-xs font-black uppercase text-[#6f5648]">Customer details</p>
              <h2 className="mt-1 text-xl font-black">Send order to supplier</h2>
              <p className="mt-2 text-sm leading-6 text-[#666666]">This information is added to the WhatsApp message so the supplier can confirm stock, delivery, and payment quickly.</p>

              <div className="mt-4 grid gap-3">
                <OrderField label="Full name" value={customer.name} onChange={(value) => updateCustomer("name", value)} />
                <OrderField label="Phone number" value={customer.phone} onChange={(value) => updateCustomer("phone", value)} />
                <label>
                  <span className="mb-1 block text-xs font-black uppercase">City</span>
                  <input className="h-10 w-full border bg-white px-3 text-sm outline-none" list="qaleen-delivery-cities" value={customer.city} onChange={(event) => updateCustomer("city", event.target.value)} />
                  <datalist id="qaleen-delivery-cities">
                    {catalog.settings.deliveryCities.map((city) => <option key={city} value={city} />)}
                  </datalist>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-black uppercase">Delivery address</span>
                  <textarea className="min-h-20 w-full border bg-white px-3 py-2 text-sm outline-none" value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-black uppercase">Delivery option</span>
                  <select className="h-10 w-full border bg-white px-3 text-sm outline-none" value={customer.delivery} onChange={(event) => updateCustomer("delivery", event.target.value)}>
                    <option>Home delivery</option>
                    <option>Pickup from showroom</option>
                    <option>Confirm delivery before dispatch</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-black uppercase">Payment option</span>
                  <select className="h-10 w-full border bg-white px-3 text-sm outline-none" value={customer.payment} onChange={(event) => updateCustomer("payment", event.target.value)}>
                    <option>Confirm on WhatsApp</option>
                    <option>Cash on delivery</option>
                    <option>Bank transfer after confirmation</option>
                    <option>Advance booking payment</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-black uppercase">Order note</span>
                  <textarea className="min-h-20 w-full border bg-white px-3 py-2 text-sm outline-none" value={customer.note} onChange={(event) => updateCustomer("note", event.target.value)} placeholder="Room size, preferred delivery time, or special request" />
                </label>
              </div>

              <div className="sticky bottom-0 -mx-4 mt-5 grid gap-2 border-t bg-[#DFD3C3] px-4 py-3 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-t-0 lg:bg-transparent lg:p-0">
                <a
                  href={orderWhatsappUrl}
                  onClick={() => { void saveOrderRecord(); }}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex h-11 items-center justify-center gap-2 px-4 text-xs font-black uppercase text-white ${cartProducts.length ? "bg-[#111111]" : "pointer-events-none bg-[#999999]"}`}
                >
                  {cartProducts.length ? "Place order on WhatsApp" : "Add qaleen to cart first"} <MessageCircle className="h-4 w-4" />
                </a>
                <a href={supplierCallUrl} className="inline-flex h-11 items-center justify-center gap-2 border bg-white px-4 text-xs font-black uppercase">
                  Call supplier now <Phone className="h-4 w-4" />
                </a>
              </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t bg-white/96 px-4 py-2 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase text-[#777777]">{cartCount} selected</p>
            <p className="text-sm font-black">{formatQaleenMoney(cartTotal)}</p>
          </div>
          <button onClick={() => setOrderPanelOpen(true)} className="inline-flex h-10 items-center gap-1.5 bg-[#111111] px-3 text-xs font-black uppercase text-white">
            Order <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </main>
  );
}

function Feature({ title, body, icon: Icon }: { title: string; body: string; icon: LucideIcon }) {
  return (
    <div className="border bg-[#DFD3C3] p-3">
      <Icon className="h-4 w-4" />
      <p className="mt-2 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#666666]">{body}</p>
    </div>
  );
}

function FeaturedBand({ title, products, onSelect, compact = false }: { title: string; products: QaleenProduct[]; onSelect: (product: QaleenProduct) => void; compact?: boolean }) {
  if (!products.length) return null;

  return (
    <div className="border bg-[#DFD3C3] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase">{title}</h2>
        <span className="text-xs text-[#777777]">{products.length} items</span>
      </div>
      <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" : "grid-cols-2 sm:grid-cols-4"}`}>
        {products.map((product) => (
          <button key={product.id} onClick={() => onSelect(product)} className="group text-left" aria-label={`View ${product.name}`}>
            <span className="block aspect-square border bg-white p-1">
              <img src={product.image} alt="" className="h-full w-full object-contain transition group-hover:scale-[1.03]" />
            </span>
            <span className="mt-2 line-clamp-2 block min-h-8 text-xs font-bold leading-4">{product.name}</span>
            <span className="mt-1 block text-xs font-black">{formatQaleenMoney(product.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function productSizeGroup(dimensions: string) {
  const normalized = dimensions.toLowerCase();
  if (normalized.includes("runner") || normalized.includes("2.5 x") || normalized.includes("3 x 10") || normalized.includes("3 x 12")) return "Runner";
  if (normalized.includes("round")) return "Round";
  const firstNumber = Number(normalized.match(/\d+(\.\d+)?/)?.[0] || 0);
  if (firstNumber <= 4) return "Small";
  if (firstNumber <= 6) return "Medium";
  return "Large";
}

function FilterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase">{title}</p>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border bg-white p-3">
      <p className="text-[10px] font-black uppercase text-[#777777]">{label}</p>
      <p className="mt-1 text-sm font-bold leading-5">{value}</p>
    </div>
  );
}

function OrderField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black uppercase">{label}</span>
      <input className="h-10 w-full border bg-white px-3 text-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

