import {
  defaultQaleenCatalog,
  normalizeQaleenCatalog,
  type QaleenCatalog,
  type QaleenOrder
} from "@/lib/qaleen-catalog";

const catalogId = "main";
const imageBucket = "qaleen-images";

type SupabaseCatalogRow = {
  catalog: QaleenCatalog;
  updated_at?: string;
};

type SupabaseOrderRow = {
  order_data: QaleenOrder;
  created_at?: string;
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    url,
    secretKey,
    isConfigured: Boolean(url && secretKey)
  };
}

function supabaseHeaders(extra?: HeadersInit): HeadersInit {
  const { secretKey } = getSupabaseConfig();

  return {
    apikey: secretKey || "",
    authorization: `Bearer ${secretKey || ""}`,
    ...extra
  };
}

async function supabaseJson<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, isConfigured } = getSupabaseConfig();

  if (!url || !isConfigured) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }

  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: supabaseHeaders({
      "content-type": "application/json",
      ...(init?.headers || {})
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function qaleenSupabaseStatus() {
  return getSupabaseConfig().isConfigured;
}

export async function readSupabaseCatalog() {
  if (!qaleenSupabaseStatus()) {
    return { catalog: defaultQaleenCatalog, configured: false, source: "default" as const };
  }

  const rows = await supabaseJson<SupabaseCatalogRow[]>(
    `/rest/v1/qaleen_catalog?id=eq.${catalogId}&select=catalog,updated_at`
  );

  const catalog = rows[0]?.catalog ? normalizeQaleenCatalog(rows[0].catalog) : defaultQaleenCatalog;
  return {
    catalog,
    configured: true,
    source: rows[0]?.catalog ? "supabase" as const : "default" as const
  };
}

export async function saveSupabaseCatalog(catalog: QaleenCatalog) {
  const normalized = normalizeQaleenCatalog(catalog);

  await supabaseJson<SupabaseCatalogRow[]>("/rest/v1/qaleen_catalog", {
    method: "POST",
    headers: {
      prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      id: catalogId,
      catalog: normalized,
      updated_at: new Date().toISOString()
    })
  });

  return normalized;
}

export async function readSupabaseOrders() {
  if (!qaleenSupabaseStatus()) return { orders: [] as QaleenOrder[], configured: false };

  const rows = await supabaseJson<SupabaseOrderRow[]>(
    "/rest/v1/qaleen_orders?select=order_data,created_at&order=created_at.desc&limit=200"
  );

  return {
    orders: rows.map((row) => row.order_data).filter(Boolean),
    configured: true
  };
}

export async function saveSupabaseOrder(order: QaleenOrder) {
  await supabaseJson<SupabaseOrderRow[]>("/rest/v1/qaleen_orders", {
    method: "POST",
    headers: {
      prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      id: order.id,
      order_data: order,
      created_at: order.createdAt
    })
  });

  return order;
}

export async function updateSupabaseOrderStatus(id: string, status: QaleenOrder["status"]) {
  const filter = encodeURIComponent(id);
  const rows = await supabaseJson<SupabaseOrderRow[]>(
    `/rest/v1/qaleen_orders?id=eq.${filter}&select=order_data`
  );
  const current = rows[0]?.order_data;

  if (!current) throw new Error("Order was not found in Supabase.");

  const updatedOrder: QaleenOrder = { ...current, status };
  await supabaseJson<SupabaseOrderRow[]>(`/rest/v1/qaleen_orders?id=eq.${filter}`, {
    method: "PATCH",
    headers: {
      prefer: "return=representation"
    },
    body: JSON.stringify({ order_data: updatedOrder })
  });

  return updatedOrder;
}

export function makeSupabaseImageUrl(path: string) {
  const { url } = getSupabaseConfig();
  return `${url}/storage/v1/object/public/${imageBucket}/${path}`;
}

export async function uploadSupabaseImage(file: File, folder = "products") {
  const { url, isConfigured } = getSupabaseConfig();

  if (!url || !isConfigured) {
    throw new Error("Supabase image upload is not configured.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "products";
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const response = await fetch(`${url}/storage/v1/object/${imageBucket}/${path}`, {
    method: "PUT",
    headers: supabaseHeaders({
      "content-type": file.type || "application/octet-stream",
      "x-upsert": "true"
    }),
    body: await file.arrayBuffer(),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase upload failed with ${response.status}`);
  }

  return {
    path,
    url: makeSupabaseImageUrl(path)
  };
}
