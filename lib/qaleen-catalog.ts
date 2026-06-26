export type QaleenProduct = {
  id: string;
  name: string;
  collection: string;
  type: string;
  origin: string;
  dimensions: string;
  material: string;
  color: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image: string;
  images?: string[];
  badge?: string;
  status?: "Available" | "Reserved" | "Sold";
  isFeatured?: boolean;
  description: string;
  isActive: boolean;
};

export type QaleenSettings = {
  storeName: string;
  tagline: string;
  announcement: string;
  heroTitle: string;
  heroText: string;
  heroImage: string;
  whatsappNumber: string;
  deliveryText: string;
  adminPassword: string;
  deliveryCities: string[];
};

export type QaleenCatalog = {
  settings: QaleenSettings;
  products: QaleenProduct[];
};

export type QaleenOrder = {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
    delivery: string;
    payment: string;
    note: string;
  };
  items: {
    id: string;
    name: string;
    dimensions: string;
    material: string;
    image: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "WhatsApp sent" | "Pending" | "Confirmed" | "Delivered" | "Cancelled";
};

export const qaleenCatalogStorageKey = "qaleen:catalog:v5";
export const qaleenOrderStorageKey = "qaleen:orders:v1";
export const qaleenAdminSessionKey = "qaleen:admin-session:v1";

export const defaultQaleenSettings: QaleenSettings = {
  storeName: "IZAT QALEEN & CARPETS",
  tagline: "Rugs & Carpets",
  announcement: "Free delivery in Pakistan | Premium imported qaleen",
  heroTitle: "Persian & Irani Rugs",
  heroText: "Imported-style qaleen, handmade textures, and room-ready sizes.",
  heroImage: "/qaleen/hero.png",
  whatsappNumber: "923001234567",
  deliveryText: "Free delivery all over Pakistan",
  adminPassword: "admin123",
  deliveryCities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"]
};

type QaleenProductTemplate = Omit<QaleenProduct, "id" | "image" | "stock" | "isActive"> & {
  stock?: number;
};

const ownerImageProducts: QaleenProductTemplate[] = [
  { name: "Navy Isfahan Medallion Rug 4 x 6 ft", collection: "Persian Irani Rugs", type: "Isfahan Rug", origin: "Iranian inspired", dimensions: "4 x 6 ft", material: "Fine hand knot", color: "Navy and ivory", price: 98000, compareAtPrice: 124000, badge: "New", description: "Dark navy central medallion with ivory field detailing, matched to a 4 x 6 ft room rug proportion." },
  { name: "Ruby Persian Medallion Rug 3 x 5 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "3 x 5 ft", material: "Hand-knotted wool", color: "Ruby and walnut", price: 76000, compareAtPrice: 96000, description: "Deep ruby medallion qaleen with dense traditional border work for compact seating areas." },
  { name: "Ivory Blue Kashan Floral Rug 4 x 6 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "4 x 6 ft", material: "Wool on cotton", color: "Ivory and pale blue", price: 92000, compareAtPrice: 118000, description: "Light Kashan-style floral medallion rug with a soft blue border and ivory center." },
  { name: "Red Kashan Medallion Rug 5 x 8 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "5 x 8 ft", material: "Dense wool pile", color: "Red and ivory", price: 132000, compareAtPrice: 158000, badge: "Sale", description: "Formal red Kashan medallion design in a longer 5 x 8 ft proportion for bedrooms and lounges." },
  { name: "Turquoise Kashan Floral Rug 4 x 6 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "4 x 6 ft", material: "Wool on cotton", color: "Turquoise and ivory", price: 94000, compareAtPrice: 121000, description: "Pale turquoise floral medallion qaleen with an ivory field and classic border." },
  { name: "Slate Navy Persian Carpet 8 x 10 ft", collection: "Classic Carpets", type: "Medallion Carpet", origin: "Traditional inspired", dimensions: "8 x 10 ft", material: "Premium machine weave", color: "Slate navy and rust", price: 178000, compareAtPrice: 214000, description: "Large slate-navy medallion carpet with warm border tones, suited to drawing rooms." },
  { name: "Rust Heriz Geometric Rug 6 x 8 ft", collection: "Premium Rugs", type: "Heriz Rug", origin: "Heriz inspired", dimensions: "6 x 8 ft", material: "Dense wool pile", color: "Rust and charcoal", price: 154000, compareAtPrice: 184000, description: "Rust Heriz-style geometric medallion with strong contrast and angular village motifs." },
  { name: "Ruby Bokhara Runner 2.5 x 8 ft", collection: "Runners", type: "Bokhara Runner", origin: "Bokhara inspired", dimensions: "2.5 x 8 ft", material: "Hand-finished wool", color: "Ruby and black", price: 58000, compareAtPrice: 72000, badge: "Limited", description: "Narrow ruby runner with repeated diamond motifs for corridors, side passages, and entryways." },
  { name: "Ivory Bokhara Runner 2.5 x 8 ft", collection: "Runners", type: "Bokhara Runner", origin: "Bokhara inspired", dimensions: "2.5 x 8 ft", material: "Hand-finished wool", color: "Ivory and beige", price: 56000, compareAtPrice: 69000, description: "Light Bokhara runner with repeated medallions, ideal for bright hallways." },
  { name: "Round Persian Medallion Rug 6 ft", collection: "Round Rugs", type: "Round Persian Rug", origin: "Persian inspired", dimensions: "6 ft round", material: "Dense wool pile", color: "Ivory and ruby", price: 118000, compareAtPrice: 145000, badge: "New", description: "Round Persian-style medallion rug with a ruby outer border and ornate ivory field." },
  { name: "Red Persian Medallion Rug 3 x 5 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "3 x 5 ft", material: "Hand-knotted wool", color: "Red and ivory", price: 78000, compareAtPrice: 98000, description: "Compact red medallion rug with a traditional all-over floral field." },
  { name: "Ivory Navy Classic Medallion Rug 4 x 6 ft", collection: "Classic Carpets", type: "Medallion Carpet", origin: "Traditional inspired", dimensions: "4 x 6 ft", material: "Dense wool pile", color: "Ivory and navy", price: 88000, compareAtPrice: 112000, description: "Classic ivory center medallion with navy border and balanced formal detailing." },
  { name: "Pale Blue Kashan Carpet 8 x 10 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "8 x 10 ft", material: "Wool on cotton", color: "Pale blue and ivory", price: 168000, compareAtPrice: 198000, description: "Large pale blue Kashan floral carpet with a quiet luxury palette." },
  { name: "Rust Heriz Square Carpet 6 x 6 ft", collection: "Premium Rugs", type: "Heriz Rug", origin: "Heriz inspired", dimensions: "6 x 6 ft", material: "Dense wool pile", color: "Rust and navy", price: 126000, compareAtPrice: 154000, badge: "Sale", description: "Square Heriz-style geometric qaleen with a strong central star medallion." },
  { name: "Navy Persian Small Rug 4 x 6 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "4 x 6 ft", material: "Fine hand knot", color: "Navy and cream", price: 94000, compareAtPrice: 118000, description: "Navy small-format medallion rug for offices, bedrooms, and reading corners." },
  { name: "Black Tribal Runner 2.5 x 10 ft", collection: "Runners", type: "Tribal Runner", origin: "Central Asian inspired", dimensions: "2.5 x 10 ft", material: "Hand-finished wool", color: "Black, rust, and ivory", price: 69000, compareAtPrice: 85000, description: "Extra-long tribal runner with bold stacked diamond medallions." },
  { name: "Bakhtiari Garden Panel Rug 4 x 6 ft", collection: "Tribal & Garden Rugs", type: "Bakhtiari Rug", origin: "Bakhtiari inspired", dimensions: "4 x 6 ft", material: "Hand-knotted wool", color: "Multi color", price: 98000, compareAtPrice: 126000, description: "Panel garden qaleen with framed floral and tree-of-life sections." },
  { name: "Round Tabriz Medallion Rug 6 ft", collection: "Round Rugs", type: "Round Tabriz Rug", origin: "Tabriz inspired", dimensions: "6 ft round", material: "Dense wool pile", color: "Ivory, navy, and ruby", price: 124000, compareAtPrice: 152000, description: "Round Tabriz-style rug with a crisp central medallion and red border." },
  { name: "Vintage Rose Persian Rug 5 x 7 ft", collection: "Vintage Rugs", type: "Distressed Persian Rug", origin: "Traditional inspired", dimensions: "5 x 7 ft", material: "Hand-finished wool", color: "Rose and faded blue", price: 110000, compareAtPrice: 138000, badge: "Limited", description: "Soft distressed rose Persian rug with a faded medallion and antique character." },
  { name: "Square Turquoise Medallion Carpet 6 x 6 ft", collection: "Classic Carpets", type: "Square Medallion Carpet", origin: "Traditional inspired", dimensions: "6 x 6 ft", material: "Premium machine weave", color: "Turquoise, ivory, and navy", price: 128000, compareAtPrice: 158000, description: "Square turquoise medallion carpet with a bold navy frame for centered seating layouts." },
  { name: "Navy Persian Medallion Carpet 8 x 10 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "8 x 10 ft", material: "Fine hand knot", color: "Navy and rust", price: 188000, compareAtPrice: 226000, description: "Large navy Persian medallion carpet with a rust border and formal floral work." },
  { name: "Ruby Persian Medallion Carpet 8 x 10 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "8 x 10 ft", material: "Hand-knotted wool", color: "Ruby and walnut", price: 184000, compareAtPrice: 222000, badge: "Sale", description: "Large ruby Persian medallion carpet with a deep field and layered border." },
  { name: "Pale Blue Kashan Floral Carpet 8 x 10 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "8 x 10 ft", material: "Wool on cotton", color: "Pale blue and ivory", price: 166000, compareAtPrice: 196000, description: "Soft pale-blue Kashan floral carpet with a refined central medallion." },
  { name: "Square Heriz Geometric Carpet 6 x 6 ft", collection: "Premium Rugs", type: "Heriz Rug", origin: "Heriz inspired", dimensions: "6 x 6 ft", material: "Dense wool pile", color: "Rust, navy, and ivory", price: 130000, compareAtPrice: 160000, description: "Square Heriz geometric carpet with strong angular motifs and a central diamond." },
  { name: "Navy Bokhara Runner 2.5 x 8 ft", collection: "Runners", type: "Bokhara Runner", origin: "Bokhara inspired", dimensions: "2.5 x 8 ft", material: "Hand-finished wool", color: "Navy and ruby", price: 59000, compareAtPrice: 74000, description: "Narrow navy Bokhara runner with repeated medallions and a red-black border." },
  { name: "Round Ivory Persian Rug 7 ft", collection: "Round Rugs", type: "Round Persian Rug", origin: "Persian inspired", dimensions: "7 ft round", material: "Dense wool pile", color: "Ivory and muted red", price: 132000, compareAtPrice: 162000, description: "Large round ivory Persian medallion rug with a soft traditional border." },
  { name: "Turquoise Persian Medallion Carpet 8 x 10 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "8 x 10 ft", material: "Fine hand knot", color: "Turquoise and navy", price: 176000, compareAtPrice: 212000, badge: "New", description: "Turquoise medallion carpet with dark border contrast and elegant floral detailing." },
  { name: "Bakhtiari Arch Panel Carpet 8 x 10 ft", collection: "Tribal & Garden Rugs", type: "Bakhtiari Rug", origin: "Bakhtiari inspired", dimensions: "8 x 10 ft", material: "Hand-knotted wool", color: "Olive, navy, ivory, and rust", price: 182000, compareAtPrice: 220000, description: "Large Bakhtiari panel carpet with arched garden compartments and rich border work." },
  { name: "Rust Gabbeh Tribal Rug 8 x 10 ft", collection: "Modern Qaleen", type: "Gabbeh Rug", origin: "Tribal inspired", dimensions: "8 x 10 ft", material: "Thick wool pile", color: "Rust orange", price: 138000, compareAtPrice: 168000, description: "Minimal rust Gabbeh rug with scattered tribal accents and a warm modern field." },
  { name: "Faded Pink Vintage Persian Rug 8 x 10 ft", collection: "Vintage Rugs", type: "Distressed Persian Rug", origin: "Traditional inspired", dimensions: "8 x 10 ft", material: "Hand-finished wool", color: "Faded pink and blue", price: 148000, compareAtPrice: 178000, description: "Distressed pink Persian-style rug with a faded medallion and antique finish." },
  { name: "Navy Classic Medallion Carpet 8 x 10 ft", collection: "Classic Carpets", type: "Medallion Carpet", origin: "Traditional inspired", dimensions: "8 x 10 ft", material: "Premium machine weave", color: "Navy and beige", price: 172000, compareAtPrice: 204000, description: "Classic navy medallion carpet with beige field contrast and formal border details." },
  { name: "Ruby Classic Medallion Carpet 8 x 10 ft", collection: "Classic Carpets", type: "Medallion Carpet", origin: "Traditional inspired", dimensions: "8 x 10 ft", material: "Premium machine weave", color: "Ruby and beige", price: 174000, compareAtPrice: 206000, badge: "Sale", description: "Ruby classic medallion carpet with dense floral detailing and a balanced border." },
  { name: "Pale Blue Kashan Carpet 8 x 10 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "8 x 10 ft", material: "Wool on cotton", color: "Pale blue and ivory", price: 169000, compareAtPrice: 199000, description: "Large pale-blue Kashan rug with ivory floral field and refined center motif." },
  { name: "Square Rust Heriz Carpet 6 x 6 ft", collection: "Premium Rugs", type: "Heriz Rug", origin: "Heriz inspired", dimensions: "6 x 6 ft", material: "Dense wool pile", color: "Rust, navy, and cream", price: 132000, compareAtPrice: 162000, description: "Square Heriz carpet with bold geometric medallion and high-contrast border." },
  { name: "Dark Tribal Runner 2.5 x 8 ft", collection: "Runners", type: "Tribal Runner", origin: "Central Asian inspired", dimensions: "2.5 x 8 ft", material: "Hand-finished wool", color: "Black, rust, and ivory", price: 62000, compareAtPrice: 78000, description: "Dark tribal runner with stacked diamond medallions for hallway styling." },
  { name: "Orange Gabbeh Rug 8 x 10 ft", collection: "Modern Qaleen", type: "Gabbeh Rug", origin: "Tribal inspired", dimensions: "8 x 10 ft", material: "Thick wool pile", color: "Orange and rust", price: 136000, compareAtPrice: 166000, description: "Warm orange Gabbeh rug with a plain field and small tribal marks." },
  { name: "Bakhtiari Garden Carpet 8 x 10 ft", collection: "Tribal & Garden Rugs", type: "Bakhtiari Rug", origin: "Bakhtiari inspired", dimensions: "8 x 10 ft", material: "Hand-knotted wool", color: "Multi color", price: 186000, compareAtPrice: 224000, description: "Large Bakhtiari garden panel carpet with compartment floral and tree motifs." },
  { name: "Round Red Tabriz Rug 7 ft", collection: "Round Rugs", type: "Round Tabriz Rug", origin: "Tabriz inspired", dimensions: "7 ft round", material: "Dense wool pile", color: "Ivory and red", price: 134000, compareAtPrice: 166000, description: "Round Tabriz medallion rug with a red ornamental border and ivory center." },
  { name: "Distressed Rose Persian Rug 8 x 10 ft", collection: "Vintage Rugs", type: "Distressed Persian Rug", origin: "Traditional inspired", dimensions: "8 x 10 ft", material: "Hand-finished wool", color: "Rose, taupe, and blue", price: 152000, compareAtPrice: 184000, description: "Large distressed rose Persian rug with muted antique tones." },
  { name: "Ruby Bokhara Geometric Rug 8 x 10 ft", collection: "Tribal & Garden Rugs", type: "Bokhara Rug", origin: "Bokhara inspired", dimensions: "8 x 10 ft", material: "Dense wool pile", color: "Ruby and black", price: 146000, compareAtPrice: 176000, badge: "Limited", description: "Ruby Bokhara-style rug with repeated geometric medallions and dark border work." },
  { name: "Navy Medallion Rug 6 x 8 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "6 x 8 ft", material: "Fine hand knot", color: "Navy and beige", price: 142000, compareAtPrice: 172000, description: "Navy medallion rug in a balanced 6 x 8 ft proportion for formal rooms." },
  { name: "Ruby Medallion Rug 6 x 8 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "6 x 8 ft", material: "Hand-knotted wool", color: "Ruby and beige", price: 144000, compareAtPrice: 174000, description: "Ruby medallion rug with floral field and classic Persian border." },
  { name: "Pale Blue Medallion Rug 6 x 8 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "6 x 8 ft", material: "Wool on cotton", color: "Pale blue and ivory", price: 138000, compareAtPrice: 168000, description: "Soft pale-blue medallion rug with Kashan-style floral structure." },
  { name: "Square Heriz Geometric Rug 6 x 6 ft", collection: "Premium Rugs", type: "Heriz Rug", origin: "Heriz inspired", dimensions: "6 x 6 ft", material: "Dense wool pile", color: "Rust and navy", price: 128000, compareAtPrice: 158000, badge: "Sale", description: "Square Heriz rug with bold center medallion and angular village motifs." },
  { name: "Navy Medallion Runner 2.5 x 8 ft", collection: "Runners", type: "Medallion Runner", origin: "Persian inspired", dimensions: "2.5 x 8 ft", material: "Hand-finished wool", color: "Navy and ivory", price: 64000, compareAtPrice: 80000, description: "Navy runner with repeated circular medallions and a light border." },
  { name: "Round Gold Persian Rug 7 ft", collection: "Round Rugs", type: "Round Persian Rug", origin: "Persian inspired", dimensions: "7 ft round", material: "Dense wool pile", color: "Gold and ivory", price: 136000, compareAtPrice: 168000, description: "Round gold-toned Persian rug with a soft ivory floral field." },
  { name: "Navy Bakhtiari Panel Rug 6 x 8 ft", collection: "Tribal & Garden Rugs", type: "Bakhtiari Rug", origin: "Bakhtiari inspired", dimensions: "6 x 8 ft", material: "Hand-knotted wool", color: "Navy, olive, and ivory", price: 148000, compareAtPrice: 178000, description: "Bakhtiari panel rug with framed floral scenes and a darker traditional palette." },
  { name: "Distressed Rose Medallion Rug 6 x 8 ft", collection: "Vintage Rugs", type: "Distressed Persian Rug", origin: "Traditional inspired", dimensions: "6 x 8 ft", material: "Hand-finished wool", color: "Rose and charcoal", price: 134000, compareAtPrice: 164000, description: "Distressed rose medallion rug with an antique washed finish." },
  { name: "Ruby Bokhara Octagon Rug 6 x 8 ft", collection: "Tribal & Garden Rugs", type: "Bokhara Rug", origin: "Bokhara inspired", dimensions: "6 x 8 ft", material: "Dense wool pile", color: "Ruby, black, and ivory", price: 136000, compareAtPrice: 166000, description: "Bokhara-style rug with repeated octagon motifs and a dark geometric border." },
  { name: "Orange Gabbeh Prayer Rug 6 x 8 ft", collection: "Modern Qaleen", type: "Gabbeh Rug", origin: "Tribal inspired", dimensions: "6 x 8 ft", material: "Thick wool pile", color: "Orange and rust", price: 118000, compareAtPrice: 146000, description: "Warm orange Gabbeh rug with minimal field details and a framed border." },
  { name: "Navy Persian Medallion Rug 4 x 6 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "4 x 6 ft", material: "Fine hand knot", color: "Navy and ivory", price: 96000, compareAtPrice: 120000, description: "Compact navy Persian medallion rug with a detailed light border." },
  { name: "Ruby Persian Medallion Carpet 8 x 10 ft", collection: "Persian Irani Rugs", type: "Persian Rug", origin: "Persian inspired", dimensions: "8 x 10 ft", material: "Hand-knotted wool", color: "Ruby and taupe", price: 180000, compareAtPrice: 216000, badge: "New", description: "Large ruby Persian medallion carpet with a rich central field and formal border." },
  { name: "Silver Blue Kashan Rug 5 x 8 ft", collection: "Persian Irani Rugs", type: "Kashan Rug", origin: "Kashan inspired", dimensions: "5 x 8 ft", material: "Wool on cotton", color: "Silver blue and ivory", price: 136000, compareAtPrice: 164000, description: "Silver-blue Kashan medallion rug with a narrow 5 x 8 ft room proportion." },
  { name: "Rust Heriz Persian Rug 8 x 10 ft", collection: "Premium Rugs", type: "Heriz Rug", origin: "Heriz inspired", dimensions: "8 x 10 ft", material: "Dense wool pile", color: "Rust, navy, and ivory", price: 176000, compareAtPrice: 212000, description: "Large rust Heriz-style rug with geometric medallion and traditional border." },
  { name: "Ruby Navy Tribal Runner 2.5 x 8 ft", collection: "Runners", type: "Tribal Runner", origin: "Central Asian inspired", dimensions: "2.5 x 8 ft", material: "Hand-finished wool", color: "Ruby and navy", price: 61000, compareAtPrice: 76000, description: "Slim tribal runner with repeated diamond motifs and a deep red-blue palette." },
  { name: "Round Ruby Persian Rug 7 ft", collection: "Round Rugs", type: "Round Persian Rug", origin: "Persian inspired", dimensions: "7 ft round", material: "Dense wool pile", color: "Ruby and ivory", price: 138000, compareAtPrice: 170000, description: "Round ruby Persian rug with ornate medallion and cream field work." },
  { name: "Multicolor Bakhtiari Garden Rug 4 x 6 ft", collection: "Tribal & Garden Rugs", type: "Bakhtiari Rug", origin: "Bakhtiari inspired", dimensions: "4 x 6 ft", material: "Hand-knotted wool", color: "Multi color", price: 102000, compareAtPrice: 128000, description: "Compact Bakhtiari garden panel rug with multi-color compartment motifs." },
  { name: "Kilim Flatweave Tribal Rug 4 x 6 ft", collection: "Modern Qaleen", type: "Kilim Rug", origin: "Tribal inspired", dimensions: "4 x 6 ft", material: "Flatweave wool", color: "Rust, teal, and beige", price: 74000, compareAtPrice: 92000, badge: "Limited", description: "Flatweave kilim with horizontal tribal geometry and a lighter casual texture." },
  { name: "Orange Gabbeh Border Rug 5 x 7 ft", collection: "Modern Qaleen", type: "Gabbeh Rug", origin: "Tribal inspired", dimensions: "5 x 7 ft", material: "Thick wool pile", color: "Orange and rust", price: 106000, compareAtPrice: 132000, description: "Orange Gabbeh rug with a clean central field and simple border accents." },
  { name: "Ruby Bokhara Tribal Rug 4 x 6 ft", collection: "Tribal & Garden Rugs", type: "Bokhara Rug", origin: "Bokhara inspired", dimensions: "4 x 6 ft", material: "Dense wool pile", color: "Ruby and black", price: 96000, compareAtPrice: 120000, description: "Compact ruby Bokhara rug with repeated dark geometric guls." }
];

function ownerProductImage(index: number) {
  return `/qaleen/owner-products/qaleen-${String(index + 1).padStart(2, "0")}.png`;
}

function ownerProductGallery(index: number) {
  const current = ownerProductImage(index);
  const next = ownerProductImage((index + 1) % ownerImageProducts.length);
  const alternate = ownerProductImage((index + 9) % ownerImageProducts.length);
  return Array.from(new Set([current, next, alternate]));
}

export const defaultQaleenProducts: QaleenProduct[] = ownerImageProducts.map((product, index) => {
  const { stock, ...details } = product;
  const productStock = stock ?? 1 + (index % 6);

  return {
    id: `qaleen-${String(index + 1).padStart(2, "0")}`,
    ...details,
    stock: productStock,
    image: ownerProductImage(index),
    images: ownerProductGallery(index),
    status: productStock === 0 ? "Sold" : index % 13 === 0 ? "Reserved" : "Available",
    isFeatured: index < 12 || index % 10 === 0,
    isActive: true
  };
});

export const defaultQaleenCatalog: QaleenCatalog = {
  settings: defaultQaleenSettings,
  products: defaultQaleenProducts
};

export function normalizeQaleenCatalog(value: Partial<QaleenCatalog> | null | undefined): QaleenCatalog {
  const storedProducts = Array.isArray(value?.products) ? value.products : [];
  const products = storedProducts.length >= 50 ? storedProducts : defaultQaleenProducts;

  return {
    settings: { ...defaultQaleenSettings, ...(value?.settings || {}) },
    products: products.length > 0
      ? products.map((product) => ({
          ...product,
          price: Number(product.price) || 0,
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
          stock: Number(product.stock) || 0,
          images: Array.isArray(product.images) && product.images.length ? product.images : [product.image].filter(Boolean),
          status: product.status || (Number(product.stock) > 0 ? "Available" : "Sold"),
          isFeatured: Boolean(product.isFeatured),
          isActive: product.isActive !== false
        }))
      : defaultQaleenProducts
  };
}

export function formatQaleenMoney(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

export function qaleenWhatsappUrl(number: string, message: string) {
  const cleanNumber = number.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanNumber || "923001234567"}?text=${encodeURIComponent(message)}`;
}
