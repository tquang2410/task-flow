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
