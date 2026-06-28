import type { QaleenCatalog, QaleenOrder } from "@/lib/qaleen-catalog";

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function fetchQaleenCatalog() {
  const response = await fetch(`/api/qaleen/catalog?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return null;

  const body = await readJson<{ catalog: QaleenCatalog }>(response);
  return body?.catalog || null;
}

export async function saveQaleenCatalog(catalog: QaleenCatalog) {
  const response = await fetch("/api/qaleen/catalog", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ catalog })
  });

  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body?.error || "Catalog could not be saved online.");
  }

  return true;
}

export async function fetchQaleenOrders() {
  const response = await fetch("/api/qaleen/orders", { cache: "no-store" });
  if (!response.ok) return null;

  const body = await readJson<{ orders: QaleenOrder[] }>(response);
  return body?.orders || null;
}

export async function saveQaleenOrder(order: QaleenOrder) {
  const response = await fetch("/api/qaleen/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ order })
  });

  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body?.error || "Order could not be saved online.");
  }

  return true;
}

export async function updateQaleenOrderStatus(id: string, status: QaleenOrder["status"]) {
  const response = await fetch("/api/qaleen/orders", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, status })
  });

  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body?.error || "Order status could not be updated online.");
  }

  return true;
}

export async function uploadQaleenImage(file: File, folder: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/qaleen/upload", {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body?.error || "Image could not be uploaded online.");
  }

  const body = await readJson<{ url: string }>(response);
  return body?.url || null;
}
