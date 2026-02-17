import { NextRequest, NextResponse } from "next/server";
import { notion, isNotionConfigured } from "@/lib/notion";
import { extractTitle } from "@/lib/notion-utils";
import { ollama, defaultModel } from "@/lib/ollama";

type NotionItem = { id: string; object: string; url: string | null; title: string };

/**
 * Notion 목록을 가져와 Ollama에게 요약·분류 요청
 * POST /api/notion/analyze
 * body: { "promptType"?: "summarize" | "prioritize" | "suggest" }
 */
export async function POST(request: NextRequest) {
  if (!isNotionConfigured() || !notion) {
    return NextResponse.json(
      { error: "NOTION_API_KEY가 설정되지 않았습니다. .env.local에 추가하세요." },
      { status: 503 }
    );
  }

  let promptType = "summarize";
  try {
    const body = await request.json().catch(() => ({}));
    if (body.promptType && ["summarize", "prioritize", "suggest"].includes(body.promptType)) {
      promptType = body.promptType;
    }
  } catch {
    // use default
  }

  try {
    const response = await notion.search({ page_size: 24 });
    const list: NotionItem[] = (response.results ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      object: item.object as string,
      url: (item.url as string) ?? null,
      title: extractTitle(item as Parameters<typeof extractTitle>[0]),
    }));

    if (list.length === 0) {
      return NextResponse.json({
        list: [],
        reply: "연동된 Notion 페이지/DB가 없어서 분석할 목록이 없습니다. Notion에서 Integration을 연결한 뒤 다시 시도해 주세요.",
      });
    }

    const listText = list
      .map((item, i) => `${i + 1}. [${item.object === "database" ? "DB" : "페이지"}] ${item.title}`)
      .join("\n");

    const prompts: Record<string, string> = {
      summarize: `다음은 내 Notion에 연동된 페이지와 데이터베이스 목록이야. 이 목록만 보고 (1) 한 줄로 전체 요약 (2) 주제나 성격이 비슷한 것끼리 묶어서 분류해줘. 한국어로 답해줘.\n\n목록:\n${listText}`,
      prioritize: `다음은 내 Notion 페이지·DB 목록이야. 업무나 학습에 도움이 되도록 우선순위를 정해줘. 1~3순위만 정하고, 각각 한 줄 이유도 붙여줘. 한국어로 답해줘.\n\n목록:\n${listText}`,
      suggest: `다음은 내 Notion 목록이야. 이 목록을 보고 부족해 보이는 주제나 추가하면 좋을 페이지 아이디어를 2~3개만 짧게 제안해줘. 한국어로 답해줘.\n\n목록:\n${listText}`,
    };

    const completion = await ollama.chat.completions.create({
      model: defaultModel,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond in Korean. Be concise.",
        },
        { role: "user", content: prompts[promptType] },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ?? "응답을 생성하지 못했습니다.";

    return NextResponse.json({ list, reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isOllama =
      message.includes("ECONNREFUSED") ||
      message.includes("fetch failed") ||
      message.includes("localhost:11434");

    if (isOllama) {
      return NextResponse.json(
        {
          error:
            "Ollama 서버에 연결할 수 없습니다. localhost:11434에서 Ollama가 실행 중인지 확인해 주세요.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "분석 중 오류: " + message },
      { status: 500 }
    );
  }
}
