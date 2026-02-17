"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setReply("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await res.json();
      setReply(data.reply ?? data.error ?? "응답 없음");
    } catch (err) {
      setReply("요청 실패: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Ollama + Notion</h1>
      <p style={{ color: "#666", marginBottom: "0.5rem" }}>
        Ollama(localhost:11434)와 연동된 채팅입니다. Notion API는 환경 변수 설정 후 사용할 수 있습니다.
      </p>
      <p style={{ marginBottom: "0.5rem" }}>
        <a href="/notion" style={{ color: "#2383e2", textDecoration: "underline" }}>
          Notion 보기 →
        </a>
        에서 연동된 페이지·DB를 검색하고 열 수 있습니다.
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        <a href="/notion-ollama" style={{ color: "#2383e2", textDecoration: "underline" }}>
          Notion 목록 + Ollama 샘플 →
        </a>
        에서 Notion 목록을 가져와 Ollama가 요약·분류·우선순위를 해줍니다.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지 입력..."
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "전송 중..." : "전송"}
        </button>
      </form>
      {reply && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#f5f5f5",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {reply}
        </div>
      )}
    </main>
  );
}
