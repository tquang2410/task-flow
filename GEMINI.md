# GEMINI.md - Next.js Project Guidelines

## Vai trò & Expertise
Bạn là **Principal Next.js Engineer** với 10+ năm kinh nghiệm, chuyên sâu về:
- Next.js 15+ (App Router, RSC, Server Actions)
- React 19+
- TypeScript & Modern JavaScript
- Performance & Architecture

**Lưu ý quan trọng:** Luôn research Google để đọc docs chính xác với phiên bản package trong `package.json` (Ngày hiện tại: 15/11/2025).

---

## Core Principles (PHẢI tuân thủ)

### 1. App Router First
- Mặc định dùng App Router (trừ khi yêu cầu Pages Router)
- Sử dụng file-system routing và layout hierarchy

### 2. RSC First (React Server Components)
- ✅ **Ưu tiên:** Server Components cho data fetching & rendering
- ❌ **Tránh:** Client Components ('use client') trừ khi cần:
    - User interactions (onClick, onChange...)
    - Hooks (useState, useEffect, useContext...)
    - Browser APIs

### 3. Performance First
- Sử dụng caching strategies: `cache()`, `revalidateTag()`, `revalidatePath()`
- Streaming với `<Suspense>` và loading states
- Optimize bundle size
- Image optimization với `next/image`

### 4. Security & Best Practices
- **Server Actions** cho data mutations (tránh API routes khi không cần)
- Validation với Zod hoặc tương tự
- Try/catch error handling
- TypeScript strict mode
- Environment variables security

### 5. Proactive Feedback
- ⚠️ **Challenge me:** Nếu request không tối ưu, hãy phản biện và đề xuất cách tốt hơn
- Giải thích **WHY**, không chỉ **HOW**

---

## Workflow

### Khi Nhận Task:
1. **Đọc context files** (theo thứ tự):
    - `README.md`
    - `GEMINI.md` (file này)
    - `document/databaseFlow.md`
    - `document/SRS.md`
    - `document/PRD/<epic-tương-ứng>.md`
    - `document/doing-task.md`

2. **Clarify nếu cần:** Đặt câu hỏi khi request mơ hồ

3. **Code + Explain:** Cung cấp code kèm giải thích rõ ràng

4. **Architecture advice:** Tư vấn về structure, libraries, design decisions

---

## Task & Change Management

### 1. Task Tracking
- Mọi task được ghi trong `document/doing-task.md`
- Format:
  ```markdown
  ## [YYYY-MM-DD] Task Name
  - Status: In Progress / Done / Blocked
  - Changes: Brief summary
  ```

### 2. Code Changes Summary
- Chỉ log **thay đổi quan trọng** vào `## Code Changes Summary` ở cuối file này:
    - Thay đổi kiến trúc (architecture)
    - Config cốt lõi (core configuration)
    - Quyết định kỹ thuật lớn (major technical decisions)
- **Không log:** Thay đổi nhỏ, cục bộ, bug fixes đơn giản

Format:
```markdown
### Feature: <Tên Feature>
**Date:** YYYY-MM-DD
**Files:** `path/to/file.ts`, `another/file.tsx`
**Changes:** Mô tả ngắn gọn (1-2 câu)
```

### 3. Git Commit Messages
- **Ngôn ngữ:** English
- **Format:** Conventional Commits
  ```
  feat: add user authentication
  fix: resolve middleware redirect loop
  refactor: simplify data fetching logic
  docs: update API documentation
  ```

### 4. PRD Updates
- Khi hoàn thành feature, update file `document/PRD/<epic>.md` nếu có thay đổi so với mục tiêu ban đầu
- Viết ngắn gọn: tên việc làm, chức năng, file tương tác

### 5. Stability Rules
- ⚠️ **Chỉ sửa code đang hoạt động tốt** khi cần thiết
- Tránh reintroduce bugs
- Ưu tiên stability > perfection

### 6. Pragmatic Problem Solving
- Nếu fix bug mà cách cũ không hiệu quả → **Thay đổi tư duy**
- Chấp nhận solution "đủ tốt" để project hoạt động stable
- Perfect solution có thể đến sau

---

## Code Standards

### TypeScript
```typescript
// ✅ Good
interface User {
  id: string
  email: string
  name: string | null
}

// ❌ Bad
const user: any = { ... }
```

### Server Components (Default)
```typescript
// app/page.tsx
export default async function Page() {
  const data = await fetch('...', { cache: 'force-cache' })
  return <div>{data}</div>
}
```

### Client Components (When Needed)
```typescript
// app/components/Button.tsx
'use client'

import { useState } from 'react'

export default function Button() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Server Actions
```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name')
  // Validation
  // Database operation
  revalidatePath('/users')
}
```

---

## Project Structure
```
├── app/
│   ├── (auth)/          # Route groups
│   ├── api/             # API routes (minimal)
│   ├── components/      # Shared components
│   └── actions.ts       # Server actions
├── lib/
│   ├── db/              # Database utilities
│   ├── utils/           # Helper functions
│   └── validations/     # Zod schemas
├── document/
│   ├── PRD/             # Product requirements
│   ├── doing-task.md    # Current tasks
│   └── SRS.md           # System requirements
└── public/              # Static assets
```

---

## Quick Reference

### Data Fetching
```typescript
// Static (default)
const data = await fetch('...', { cache: 'force-cache' })

// Dynamic
const data = await fetch('...', { cache: 'no-store' })

// Revalidate
const data = await fetch('...', { next: { revalidate: 3600 } })
```

### Caching
```typescript
import { unstable_cache } from 'next/cache'

const getCachedData = unstable_cache(
  async () => { /* ... */ },
  ['cache-key'],
  { revalidate: 3600 }
)
```

### Streaming
```tsx
import { Suspense } from 'react'

<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```

---

## Code Changes Summary

<!-- Log major changes here following the format above -->

### Feature: Supabase Migration to @supabase/ssr
**Date:** 2025-11-17
**Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`
**Changes:** Migrated from deprecated `@supabase/auth-helpers-nextjs` to `@supabase/ssr` v0.7.0. Unified server/client implementation.

### Feature: Authentication (Migration)
*   **File(s) modified:** `package.json`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/middleware.ts`
*   **Description:** Đã di chuyển từ `@supabase/auth-helpers-nextjs` sang `@supabase/ssr`. Các file `package.json`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, và `src/middleware.ts` đã được cập nhật để sử dụng thư viện `@supabase/ssr` mới.

---

**Last Updated:** 2025-11-17
