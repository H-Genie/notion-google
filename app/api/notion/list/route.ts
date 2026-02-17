import { NextRequest, NextResponse } from "next/server";
import { notion, isNotionConfigured } from "@/lib/notion";
import { extractTitle } from "@/lib/notion-utils";

/**
 * Notion 연동된 최근 페이지/DB 목록
 * GET /api/notion/list?limit=20
 */
export async function GET(request: NextRequest) {
  if (!isNotionConfigured() || !notion) {
    return NextResponse.json(
      { error: "NOTION_API_KEY가 설정되지 않았습니다. .env.local에 추가하세요." },
      { status: 503 }
    );
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 20, 50);

  try {
    const response = await notion.search({
      page_size: limit,
    });

    const results = (response.results ?? []).map((item: Record<string, unknown>) => ({
      id: item.id,
      object: item.object,
      url: item.url ?? null,
      title: extractTitle(item as Parameters<typeof extractTitle>[0]),
    }));

    return NextResponse.json({ results, has_more: response.has_more ?? false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Notion 목록 조회 실패: " + message },
      { status: 500 }
    );
  }
}
