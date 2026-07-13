import { NextResponse } from "next/server";
import { getNewsEvents } from "@/lib/data";

export async function GET() {
  try {
    const news = getNewsEvents();
    return NextResponse.json({ news });
  } catch (error) {
    console.error("Error in /api/news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news events" },
      { status: 500 }
    );
  }
}
