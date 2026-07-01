import { NextResponse } from "next/server";
import { getCurrentPrices, getDashboardStats } from "@/lib/queries";

export async function GET() {
  try {
    const prices = getCurrentPrices();
    const stats = getDashboardStats();
    return NextResponse.json({ prices, stats });
  } catch (error) {
    console.error("Error in /api/prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch current prices" },
      { status: 500 }
    );
  }
}
