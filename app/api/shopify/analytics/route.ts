import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ShopifyClient } from "@/lib/shopify/shopify-client";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create Shopify client from user's connection
    const client = await ShopifyClient.fromConnection(userId);

    // Fetch analytics
    const analytics = await client.getAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Shopify analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}