"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./notion-ollama.module.css";

type NotionItem = {
  id: string;
  object: string;
  url: string | null;
  title: string;
};

type AnalyzeResult = {
  list: NotionItem[];
  reply: string;
};

const PROMPT_LABELS: Record<string, string> = {
  summarize: "요약·분류",
  prioritize: "우선순위 정하기",
  suggest: "추가 아이디어 제안",
};

export default function NotionOllamaPage() {
  const [loading, setLoading] = useState(false);
  const [promptType, setPromptType] = useState<"summarize" | "prioritize" | "suggest">("summarize");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/notion/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "요청 실패");
        return;
      }
      setResult({ list: data.list ?? [], reply: data.reply ?? "" });
    } catch {
      setError("요청 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← 홈
        </Link>
        <h1 className={styles.title}>Notion 목록 + Ollama</h1>
        <p className={styles.desc}>
          Notion에서 가져온 페이지·DB 목록을 Ollama에게 넘겨 요약, 우선순위, 아이디어 제안을 받습니다.
        </p>
      </header>

      <section className={styles.controls}>
        <label className={styles.label}>
          Ollama에게 시킬 일
          <select
            value={promptType}
            onChange={(e) => setPromptType(e.target.value as "summarize" | "prioritize" | "suggest")}
            className={styles.select}
            disabled={loading}
          >
            <option value="summarize">{PROMPT_LABELS.summarize}</option>
            <option value="prioritize">{PROMPT_LABELS.prioritize}</option>
            <option value="suggest">{PROMPT_LABELS.suggest}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Notion 목록 가져오는 중… → Ollama 분석 중…" : "Notion 목록 가져와서 Ollama에게 요청"}
        </button>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <section className={styles.result}>
          <div className={styles.replyBox}>
            <h2 className={styles.replyTitle}>Ollama 응답</h2>
            <div className={styles.reply}>{result.reply}</div>
          </div>

          {result.list.length > 0 && (
            <div className={styles.listSection}>
              <button
                type="button"
                onClick={() => setShowList((s) => !s)}
                className={styles.listToggle}
              >
                {showList ? "▼" : "▶"} Notion에서 가져온 목록 ({result.list.length}개)
              </button>
              {showList && (
                <ul className={styles.list}>
                  {result.list.map((item) => (
                    <li key={item.id} className={styles.listItem}>
                      <span className={item.object === "database" ? styles.badgeDb : styles.badgePage}>
                        {item.object === "database" ? "DB" : "페이지"}
                      </span>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          {item.title}
                        </a>
                      ) : (
                        <span>{item.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
