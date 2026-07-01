import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/queries";

export async function GET() {
  try {
    const history = getPriceHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error in /api/history:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
