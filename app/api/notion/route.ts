import { NextRequest, NextResponse } from "next/server"
import { notion, isNotionConfigured } from "@/lib/notion"

type NotionClient = NonNullable<typeof notion>

/** 오늘 날짜 YYYY-MM-DD */
function todayISO(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

/**
 * 특정 Notion Database 조회용 API
 * GET /api/notion?databaseId=...&after=today&editedAfter=2026-03-09T00:00:00Z
 * - after=today: 오늘 날짜 이후(이후 포함)만 조회. 생략 시 필터 없음.
 * - after=YYYY-MM-DD: 해당 날짜 이후만 조회
 * - editedAfter=ISO_DATETIME: 이 시점 이후에 수정된 페이지만 조회 (현재는 예시로만, 실제 필터는 주석 처리됨)
 */
export async function GET(request: NextRequest) {
  if (!isNotionConfigured() || !notion) {
    return NextResponse.json(
      {
        error: "NOTION_API_KEY가 설정되지 않았습니다. .env.local에 추가하세요."
      },
      { status: 503 }
    )
  }

  const client = notion as NotionClient
  const searchParams = request.nextUrl.searchParams
  const databaseId = searchParams.get("databaseId")! as string
  const afterParam = searchParams.get("after")
  // const editedAfter = searchParams.get("editedAfter") // 예: "2026-03-09T00:00:00Z"

  try {
    const database = await client.databases.retrieve({
      database_id: databaseId
    })
    const properties = (database as any).properties ?? {}
    const propKeys = Object.keys(properties)

    let afterDate: string | null = null
    if (afterParam === "today") {
      afterDate = todayISO()
    } else if (afterParam && /^\d{4}-\d{2}-\d{2}$/.test(afterParam)) {
      afterDate = afterParam
    }

    const datePropertyName = afterDate
      ? (
          Object.entries(properties).find(
            ([_, p]: [string, any]) => p?.type === "date"
          ) as [string, any] | undefined
        )?.[0]
      : null

    const filter =
      afterDate && datePropertyName
        ? {
            property: datePropertyName,
            date: { on_or_after: afterDate }
          }
        : undefined

    // 특정 시점 이후에 수정된 값만 조회하고 싶을 때 사용할 수 있는 예시 필터입니다.
    // 현재는 실제 쿼리에는 적용하지 않고, 참고용으로만 남겨둡니다.
    //
    // const editedFilter =
    //   editedAfter != null
    //     ? {
    //         timestamp: "last_edited_time" as const,
    //         last_edited_time: {
    //           on_or_after: editedAfter,
    //         },
    //       }
    //     : undefined;
    //
    // 최종 filter를 날짜 + 수정일 둘 다 걸고 싶다면, 다음과 같이 and 조건으로 결합할 수 있습니다.
    //
    // const finalFilter =
    //   filter && editedFilter
    //     ? {
    //         and: [filter, editedFilter],
    //       }
    //     : filter ?? editedFilter;

    const sorts =
      datePropertyName != null
        ? [
            {
              property: datePropertyName,
              direction: "ascending" as const
            }
          ]
        : undefined

    const response = await client.databases.query({
      database_id: databaseId,
      page_size: 100,
      // filter를 수정일 기준까지 포함해서 쓰고 싶다면,
      // 위의 finalFilter 예시를 참고해서 아래 한 줄을 교체하면 됩니다.
      ...(filter && { filter }),
      // ...(finalFilter && { filter: finalFilter }),
      ...(sorts && { sorts })
    })

    const rows = response.results ?? []

    return NextResponse.json({
      database,
      propKeys,
      rows,
      ...(afterDate && {
        filterApplied: {
          after: afterDate,
          dateProperty: datePropertyName ?? null
        }
      })
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error: "Notion 데이터베이스 조회 중 오류가 발생했습니다: " + message
      },
      { status: 500 }
    )
  }
}
