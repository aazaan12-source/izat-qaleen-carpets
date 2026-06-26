import { NextResponse, type NextRequest } from "next/server";
import { normalizeQaleenCatalog } from "@/lib/qaleen-catalog";
import { readSupabaseCatalog, saveSupabaseCatalog } from "@/lib/qaleen-supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readSupabaseCatalog());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load catalog." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const catalog = normalizeQaleenCatalog(body.catalog);
    const saved = await saveSupabaseCatalog(catalog);

    return NextResponse.json({ catalog: saved, configured: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save catalog." },
      { status: 500 }
    );
  }
}
