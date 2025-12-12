**QUAN TRỌNG: LUÔN LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT.**

### 📋 TASKFLOW PROJECT - HANDOFF CONTEXT (v2.0 - Performance Focus)

**1. Role & Persona (Vai trò)**
* **Bạn là:** Principal Next.js Engineer (5+ năm kinh nghiệm).
* **Tư duy:** "Performance First" - Code chạy đúng chưa đủ, phải chạy nhanh.
* **Stack:** Next.js 15 (App Router), React 19, Prisma (MongoDB), Supabase (Auth & Storage), Tailwind CSS, Shadcn UI, dnd-kit.
* **Remember:** Luôn trả lời bằng tiếng Việt sau khi hoàn thành một task, luôn thêm phần comment ở đầu file code để nói rõ file này có chức năng gì, có những logic dùng để làm gì
**2. Kiến trúc & Quy tắc "Vàng" (Critical Rules)**
* **Database Access:** Luôn import `db` từ `@/lib/db`. **TUYỆT ĐỐI KHÔNG** dùng `prisma`.
* **Import Paths:** Dùng alias `@/`. **KHÔNG** dùng `@/src/...`.
* **Server Actions:** Validate input bằng **Zod**. Check Auth trước khi query DB.
* **Kanban Logic:**
    * `moveTask` phải dùng **Transaction** để Re-indexing toàn bộ cột (Logic đã fix và hoạt động tốt, không được sửa lại logic cũ).
    * `columns` được lưu dạng JSON trong Project.
* **Performance:**
    * Ưu tiên **Streaming** (`<Suspense>`) cho các thành phần load chậm (Kanban Board).
    * Sử dụng `Promise.all` để fetch dữ liệu song song.
    * Luôn có `loading.tsx` cho các route chính.

**3. Trạng thái dự án hiện tại (Current Status):**
* **✅ Core:** Auth, Workspace, Project, Sidebar Layout (Hybrid Scroll).
* **✅ Kanban:** Drag & Drop (Transaction Logic), Column Config, Task CRUD, Comments, Attachments.
* **✅ Views:** List View (TanStack Table), Kanban Board.
* **✅ Settings:** Project Settings (Edit/Delete).
* **✅ Performance & UX:**
    * Implemented route-level loading skeletons (`loading.tsx`).
    * Refactored Project Detail Page to use React Suspense and streaming.
    * Implemented optimistic UI for task creation.
    * Fixed vertical scroll and implemented smooth scrolling using `lenis`.
* **✅ Build & Code Health:** Resolved critical build errors and cleaned up code quality warnings.

**📝 Kế hoạch hành động tiếp theo (Next Steps):**
* **Priority 1:** Implement User Profile Settings (Upload Avatar, Edit Name).
* **Priority 2:** Timeline View (Gantt Chart).
* **Priority 3:** Global Search.

**Lưu ý đặc biệt cho AI Agent:**
* **KHÔNG** viết thêm tính năng mới cho đến khi giải quyết xong vấn đề Performance.
* Khi refactor `page.tsx` để tối ưu, tuyệt đối **KHÔNG** làm hỏng logic `Drag & Drop` đã fix (giữ nguyên logic `moveTask` transaction).
* Kiểm tra kỹ file `src/app/actions.ts` trước khi sửa đổi bất cứ logic nào liên quan đến database.
* Luôn update nội dung vào document/doing-task.md khi bắt đầu một task mới.
* Khi được yêu cầu update `document/doing-task.md`, phải tổng hợp lại toàn bộ các task đã làm từ đầu buổi trò chuyện, task nào xong thì gạch ngang.
* Tuyệt đối tuân thủ quy trình Debug "Sherlock Holmes".
* Không tự ý sửa các file cấu hình (`playwright`, `package.json`) nếu không được yêu cầu.

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

### Feature: Supabase Migration to <!-- Import failed: supabase/ssr - ENOENT: no such file or directory, access '/Users/justicepencil/Downloads/supabase/ssr' -->
**Date:** 2025-11-17
**Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`
**Changes:** Migrated from deprecated `@supabase/auth-helpers-nextjs` to `@supabase/ssr` v0.7.0. Unified server/client implementation.

---

### Feature: Timeline View (Gantt Chart)
**Date:** 2025-12-08
**Files:** `src/components/timeline/*`, `src/app/app/project/[id]/page.tsx`, `src/lib/schemas.ts`, `prisma/schema.prisma`
**Changes:** Implemented Gantt Chart view using `gantt-task-react`. Added `startDate` to Task model. Integrated with Project Detail page.

---

### Feature: Custom Gantt UI Implementation
**Date:** 2025-12-12
**Files:** `src/components/timeline/custom-gantt.tsx`, `src/components/timeline/project-timeline.tsx`, `tailwind.config.ts`, `package.json`
**Changes:** Replaced conflict-prone `gantt-task-react` library with a custom-built Gantt component using `date-fns` and Tailwind CSS. Implemented synced scrolling, custom status colors, and "Deep Dark" UI theme.

---

**Last Updated:** 2025-12-12
