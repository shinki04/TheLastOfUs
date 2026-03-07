import { NextRequest, NextResponse } from "next/server";

import { fetchSavedPosts } from "@/app/actions/saved_posts";

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(
      request.nextUrl.searchParams.get("page") || "1",
      10
    );
    const itemsPerPage = parseInt(
      request.nextUrl.searchParams.get("itemsPerPage") || "10",
      10
    );

    const response = await fetchSavedPosts(page, itemsPerPage);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
