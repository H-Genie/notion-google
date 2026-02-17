/**
 * Notion API 응답에서 제목 추출
 */
type NotionSearchItem = {
  id: string;
  object: string;
  url?: string | null;
  title?: Array<{ plain_text?: string }>;
  properties?: Record<string, { type?: string; title?: Array<{ plain_text?: string }>; [k: string]: unknown }>;
  [k: string]: unknown;
};

export function extractTitle(item: NotionSearchItem): string {
  // Database: title 배열
  if (Array.isArray(item.title) && item.title.length > 0) {
    const t = item.title[0]?.plain_text;
    if (t) return t;
  }
  // Page: properties 안의 title 타입 속성
  const props = item.properties;
  if (props && typeof props === "object") {
    for (const key of Object.keys(props)) {
      const p = props[key] as { type?: string; title?: Array<{ plain_text?: string }> } | undefined;
      if (p?.type === "title" && Array.isArray(p.title) && p.title.length > 0) {
        const t = p.title[0]?.plain_text;
        if (t) return t;
      }
    }
  }
  return "제목 없음";
}
