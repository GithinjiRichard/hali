import { NextResponse } from "next/server";
import { getInsights } from "@/lib/data";

export async function GET() {
  try {
    const insights = getInsights();
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error in /api/insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
