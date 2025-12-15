## ~~[2025-12-07] Refine Timeline View Implementation~~
- Status: Done
- Changes:
    - **Schema & Actions**: Added `startDate` to `CreateTaskSchema` and `createTask` action.
    - **UI**: Added `DatePicker` for Start Date in `TaskDetailSheet`.
    - **Timeline Logic**: Updated `TimelineView` to fallback `startDate` to `createdAt` (instead of now) and default duration to 1 day.
    - **Styling**: Added dark mode colors to Gantt chart bars.

## ~~[2025-12-07] Implement Timeline View (Gantt Chart)~~
- Status: Done
- Changes:
    - Add `startDate` to `Task` model in `schema.prisma`.
    - Install `gantt-task-react`.
    - Implement `TimelineView` and `TimelineToolbar` components.
    - Create `ProjectTimeline` server component with Suspense.
    - Integrate Timeline tab into `ProjectDetailPage`.

## ~~[2025-12-07] Implement User Profile Settings~~
- Status: Done
- Changes:
    - Create `UpdateProfileSchema` in `src/lib/schemas.ts`.
    - Implement `updateProfile` server action in `src/app/actions.ts`.
    - Create `ProfileForm` component at `src/components/settings/profile-form.tsx`.
    - Create settings page at `src/app/app/settings/page.tsx`.
    - Add link to settings page in the main sidebar layout.

## ~~[2025-12-07] Restore Sidebar & Fix Layout Scroll~~
- Status: Done
- Changes: Overwrote `src/app/app/layout.tsx` with correct code to restore all sidebar icons and fix scrolling behavior.

## ~~[2025-12-07] Restore Settings Link in Sidebar~~
- Status: Done
- Changes:
    - Added `Settings` import to `lucide-react`.
    - Added new Link to `/app/settings` in the sidebar navigation.

## ~~[2025-12-07] Implement Client-side File Validation for Avatar~~
- Status: Done
- Changes:
    - Added file size validation (1MB limit) to `handleAvatarChange` in `src/components/settings/profile-form.tsx`.
    - Displayed toast error for oversized files, reset file input and preview.
    - Updated `UpdateProfileSchema` in `src/lib/schemas.ts` with file size validation.

## ~~[2025-12-07] Fix Type Error in `src/app/app/project/[id]/page.tsx`~~
- Status: Done
- Changes:
    - Modify `ProjectDetailPageProps` interface to remove `Promise` from `params` type.
    - Remove `await` from `const { id } = await params;`.

## ~~[2025-12-07] Align `ProjectDetailPageProps` with Next.js `PageProps`~~
- Status: Done
- Changes:
    - Modify `ProjectDetailPageProps` in `src/app/app/project/[id]/page.tsx` to include `searchParams`.

## ~~[2025-12-07] Revert `params` type to `Promise` in `page.tsx` (Debugging)~~
- Status: Done
- Changes:
    - Modify `ProjectDetailPageProps` in `src/app/app/project/[id]/page.tsx` to use `params: Promise<{ id: string }>;`.
    - Re-introduce `await` to `const { id } = await params;`.

## ~~[2025-12-07] Make both `params` and `searchParams` `Promise`s in `page.tsx` (Debugging)~~
- Status: Done
- Changes:
    - Modify `ProjectDetailPageProps` in `src/app/app/project/[id]/page.tsx` to use `params: Promise<{ id: string }>;` and `searchParams: Promise<{ [key: string]: string | string[] | undefined }>;`.
    - Add `await` to `searchParams` destructuring in `ProjectDetailPage` component.

## ~~[2025-12-07] Update Next.js to address security vulnerability~~
- Status: Done
- Changes:
    - Update `next` to the latest version to resolve CVE-2025-66478.
    - Run `npm run build` to verify the update.

## ~~[2025-12-07] Update Supabase libraries to address build errors~~
- Status: Done
- Changes:
    - Update `@supabase/ssr` and `@supabase/supabase-js` to their latest versions.
    - Run `npm run build` to verify the update.

## ~~[2025-12-07] Address Build Warnings~~
- Status: Done
- Changes:
    - Renamed `src/middleware.ts` to `src/proxy.ts`.
    - Removed unused variables/imports from `src/app/app/project/[id]/page.tsx`, `src/components/kanban/kanban-board.tsx`, `src/components/kanban/task-card.tsx`, `src/components/project/project-settings.tsx`, and `src/components/settings/profile-form.tsx`.
    - Renamed `middleware` function to `proxy` in `src/proxy.ts`.
    - Removed `members` prop from `TaskCard` usage in `src/components/kanban/board-column.tsx` and `src/components/kanban/kanban-board.tsx`.

## ~~[2025-12-12] Implement Custom Gantt UI~~
- Status: Done
- Changes:
    - Replaced `gantt-task-react` with custom `CustomGantt` component.
    - Implemented synced scrolling, month navigation, and task rendering logic.
    - Updated `tailwind.config.ts` with requested color palette.
    - Integrated new component into `ProjectTimeline`.

## ~~[2025-12-12] Implement Dynamic Gantt Chart with Priority-Based Colors~~
- Status: Done
- Changes:
    - **Dynamic Rendering**: Replaced hardcoded mock UI with dynamic `date-fns` rendering
    - **Timeline Header**: Fixed day format to single letter (T, F, S, M, W) with `format(day, 'EEEEEE')`
    - **Priority-Based Colors**: Implemented color system based on task priority
        * HIGH → Orange (#FB923C)
        * MEDIUM → Blue (#38BDF8)
        * LOW → Green (#84CC16)
        * Default → Purple (#A855F7)
    - **Layout Fixes**: Fixed calendar grid height to match Activity List sidebar (full height)
    - **Current Day Indicator**: Added diamond shape and pink vertical line for current day
    - **Task Bars**: Implemented dynamic calculation based on `startDate` and `dueDate`
    - **Icon Box**: Added wrapper for task bar icons with arrow icon
    - **Avatars**: Positioned assignee avatars outside task bars
    - **Scroll Sync**: Implemented synchronized scrolling between task list and gantt chart
    - **Files Modified**: `src/components/timeline/custom-gantt.tsx`
    - **Commit**: `b8a2a59` on branch `feat/timeline-view`

## ~~[2025-12-12] Implement Dynamic Task Icons Based on Keywords~~
- Status: Done
- Changes:
    - **Dynamic Icon Selection**: Created `getTaskIcon` helper function to map task titles to appropriate icons
    - **Icon Mapping**: Implemented keyword-based icon selection:
        * research/analysis → Search icon 🔍
        * design/ui/ux → Layout icon 🎨
        * mobile/app → Smartphone icon 📱
        * bug/fix/error → Bug icon 🐛
        * dev/api/backend → Code icon 💻
        * test/qa → ClipboardCheck icon ✅
        * default → Circle icon ⭕
    - **Imports**: Added new icons (Bug, Code, Layout, ClipboardCheck, Circle) from lucide-react
    - **UI Update**: Task bars now display context-appropriate icons based on task title
    - **Files Modified**: `src/components/timeline/custom-gantt.tsx`
    - **Commit**: `e526672` on branch `feat/timeline-view`

## ~~[2025-12-13] Add Interactive Features for Task Management~~
- Status: Done
- Changes:
    - **Task Editing**: Added click handler to task bars to open TaskDetailSheet
    - **Task Creation**: Implemented inline create task dialog for "Add New Activity" button
    - **Data Fetching**: Updated project query to include comments and attachments for TaskDetailSheet
    - **Props Passing**: Pass projectId, columns, and workspace members to CustomGantt
    - **Form Validation**: Integrated CreateTaskSchema with react-hook-form and zod
    - **User Feedback**: Added toast notifications for task creation success/error
    - **Auto Refresh**: Implemented page reload after task creation to show new tasks
    - **Dialog Components**: Added Dialog, Form, Input, Button components from shadcn/ui
    - **Features**:
        * Click task bar → Open TaskDetailSheet to view/edit task details
        * Click "Add New Activity" → Open dialog to create new task in first column
        * Full task management from Timeline view (view, edit, create)
    - **Files Modified**: 
        * `src/components/timeline/custom-gantt.tsx` - Added Dialog, Form components and create task logic
        * `src/components/timeline/project-timeline.tsx` - Include comments and attachments in task query
    - **Commit**: `b7387fa` on branch `feat/timeline-view`