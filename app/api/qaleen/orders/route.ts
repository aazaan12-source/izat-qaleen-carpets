import { NextResponse, type NextRequest } from "next/server";
import {
  readSupabaseOrders,
  saveSupabaseOrder,
  updateSupabaseOrderStatus
} from "@/lib/qaleen-supabase-server";
import type { QaleenOrder } from "@/lib/qaleen-catalog";

export const dynamic = "force-dynamic";

const validStatuses: QaleenOrder["status"][] = [
  "WhatsApp sent",
  "Pending",
  "Confirmed",
  "Delivered",
  "Cancelled"
];

export async function GET() {
  try {
    return NextResponse.json(await readSupabaseOrders());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = body.order as QaleenOrder;

    if (!order?.id || !order?.createdAt || !Array.isArray(order.items)) {
      return NextResponse.json({ error: "Order is incomplete." }, { status: 400 });
    }

    return NextResponse.json({ order: await saveSupabaseOrder(order), configured: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save order." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const status = body.status as QaleenOrder["status"];

    if (!body.id || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Order status update is invalid." }, { status: 400 });
    }

    return NextResponse.json({
      order: await updateSupabaseOrderStatus(String(body.id), status),
      configured: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update order." },
      { status: 500 }
    );
  }
}
