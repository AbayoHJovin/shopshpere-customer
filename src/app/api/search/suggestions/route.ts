import { NextRequest, NextResponse } from "next/server";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "product" | "category" | "brand" | "keyword";
  productId?: string;
  categoryId?: string;
  brandId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Call backend API for suggestions
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const response = await fetch(
      `${backendUrl}/products/search/suggestions?q=${encodeURIComponent(
        query
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Backend search suggestions failed:", response.status);
      return NextResponse.json({ suggestions: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
