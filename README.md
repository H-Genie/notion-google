# Notion + Gmail (Ollama)

Next.js App Router 기반 프로젝트로, **Ollama**(localhost:11434)와 **Notion**을 연동합니다.

## 요구 사항

- Node.js 18+
- [Ollama](https://ollama.com/) 설치 및 실행 (기본: `http://localhost:11434`)
- (선택) Notion 연동을 위한 [Notion Integration](https://www.notion.so/my-integrations) 시크릿 키

## 설치 및 실행

```bash
npm install
cp .env.local.example .env.local
# .env.local에 NOTION_API_KEY 필요 시 추가
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 환경 변수 (.env.local)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `OLLAMA_BASE_URL` | Ollama 서버 URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | 사용할 모델 이름 | `llama3.2` |
| `NOTION_API_KEY` | Notion 연동 시크릿 (선택) | - |

## Ollama 사용

- Ollama는 **localhost:11434**에서 동작해야 합니다.
- 터미널에서 `ollama serve`로 서버를 띄우고, `ollama run llama3.2` 등으로 모델을 풀한 뒤 사용하세요.
- 채팅 UI에서 입력한 메시지는 `/api/chat`를 통해 Ollama로 전달됩니다.

## Notion 연결 방법 (단계별)

### 1단계: Notion 연동(Integration) 만들기

1. 브라우저에서 **[Notion 연동 페이지](https://www.notion.so/my-integrations)** 로 이동합니다.
2. **「새 연동」** 을 클릭합니다.
3. **이름** (예: `notion-gmail`)을 입력하고, 사용할 **워크스페이스**를 선택한 뒤 **제출**합니다.
4. 만들어진 연동 페이지에서 **「시크릿」** 항목의 **Internal Integration Secret** 값을 복사합니다.  
   (형식: `secret_xxxxxxxxxxxx...`)

### 2단계: 프로젝트에 시크릿 넣기

프로젝트 루트에 `.env.local` 파일을 만들고 아래 한 줄을 넣습니다.

```env
NOTION_API_KEY=secret_여기에_복사한_시크릿_붙여넣기
```

저장한 뒤 **개발 서버를 다시 실행**합니다 (`npm run dev`).

### 3단계: Notion 페이지/DB에 연동 연결하기

Notion API는 **연동을 “연결”한 페이지/데이터베이스만** 접근할 수 있습니다.

1. Notion에서 **연동으로 접근할 페이지**를 엽니다.
2. 오른쪽 상단 **⋯** 메뉴 → **연결** → **연동 연결**을 선택합니다.
3. 1단계에서 만든 연동(예: `notion-gmail`)을 선택해 연결합니다.
4. **데이터베이스**를 쓰는 경우, 해당 **데이터베이스 페이지**에도 같은 방식으로 **연동 연결**을 해줍니다.

### 4단계: 동작 확인

- 브라우저 또는 터미널에서 아래 주소로 접속해 보세요.  
  `http://localhost:3000/api/notion/search?q=테스트`  
- 결과가 JSON으로 나오면 Notion 연동이 정상 동작하는 것입니다.
- `NOTION_API_KEY`가 없거나, 해당 페이지/DB에 연동을 연결하지 않았으면 검색 결과가 비어 있거나 오류가 날 수 있습니다.

---


## Notion MCP / API 연동

- **앱 내부**: 위처럼 `NOTION_API_KEY`를 설정하면 `/api/notion/search?q=검색어`로 Notion 검색을 사용할 수 있습니다.
- **Cursor IDE**: Cursor에서 Notion MCP 서버를 사용 중이라면, 이 프로젝트와 함께 Ollama를 쓰는 플로우를 구성할 수 있습니다.

## API 엔드포인트

- `POST /api/chat` — Ollama와 대화 (body: `{ "message": "메시지" }`)
- `GET /api/notion/search?q=검색어` — Notion 검색 (NOTION_API_KEY 필요)
