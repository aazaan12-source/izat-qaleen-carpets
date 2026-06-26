import { NextResponse, type NextRequest } from "next/server";
import { uploadSupabaseImage } from "@/lib/qaleen-supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "products");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file was uploaded." }, { status: 400 });
    }

    return NextResponse.json(await uploadSupabaseImage(file, folder));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload image." },
      { status: 500 }
    );
  }
}
