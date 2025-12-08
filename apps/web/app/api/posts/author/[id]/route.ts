import { NextRequest, NextResponse } from "next/server";

import { fetchPostByAuthor } from "@/app/actions/post";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(
      request.nextUrl.searchParams.get("itemsPerPage") || "10",
      10
    );

    // Fetch from database
    const response = await fetchPostByAuthor(page, itemsPerPage, id!);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}
