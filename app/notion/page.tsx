"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./notion-page.module.css";

type NotionItem = {
  id: string;
  object: string;
  url: string | null;
  title: string;
};

export default function NotionPage() {
  const [list, setList] = useState<NotionItem[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NotionItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/notion/list?limit=24");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "목록을 불러올 수 없습니다.");
          setList([]);
          return;
        }
        setList(data.results ?? []);
      } catch {
        if (!cancelled) setError("요청 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/notion/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "검색 실패");
        setSearchResults([]);
        return;
      }
      setSearchResults(data.results ?? []);
    } catch {
      setError("검색 요청 실패");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  const items = searchResults !== null ? searchResults : list;
  const isSearch = searchResults !== null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← 홈
        </Link>
        <h1 className={styles.title}>Notion 보기</h1>
        <p className={styles.desc}>
          연동된 페이지와 데이터베이스를 검색하고 Notion에서 바로 열 수 있습니다.
        </p>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="페이지 또는 DB 검색..."
            className={styles.searchInput}
            disabled={searching}
          />
          <button type="submit" className={styles.searchBtn} disabled={searching}>
            {searching ? "검색 중…" : "검색"}
          </button>
        </form>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.section}>
        {loading ? (
          <div className={styles.loading}>목록 불러오는 중…</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            {isSearch
              ? "검색 결과가 없습니다. 다른 검색어를 시도해 보세요."
              : "연동된 Notion 페이지가 없습니다. Notion에서 Integration을 페이지/DB에 연결해 주세요."}
          </div>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>
              {isSearch ? `검색 결과 (${items.length}개)` : "연동된 페이지 & 데이터베이스"}
            </h2>
            <div className={styles.grid}>
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  <span
                    className={`${styles.badge} ${
                      item.object === "database" ? styles.badgeDatabase : styles.badgePage
                    }`}
                  >
                    {item.object === "database" ? "DB" : "페이지"}
                  </span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  {item.url && (
                    <span className={styles.cardLink}>Notion에서 열기 →</span>
                  )}
                </a>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
