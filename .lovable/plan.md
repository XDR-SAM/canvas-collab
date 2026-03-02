

## Remaining Features Plan

After reviewing the full codebase, Phases 1-3 are implemented. Here is what is still missing or incomplete:

### 1. Board Sharing UI
The `board_collaborators` table exists but there is no UI. Will add:
- Share dialog on Board page to invite users by email (lookup profiles, insert collaborator)
- Collaborator role selector (viewer/editor)
- Show shared boards on Dashboard alongside owned boards
- Active collaborator avatars on the board navbar

### 2. Admin Analytics Charts
The Overview tab has stat cards but no charts. Will add:
- User signups over time (line chart, Recharts)
- Boards created over time (bar chart)
- Role distribution (pie chart)
- Uses data already available from profiles/boards `created_at` fields

### 3. Maintenance Mode & Announcement Banner
Settings exist in `app_settings` but are not enforced in the app:
- ProtectedRoute checks `maintenance_mode` and blocks non-admins with a maintenance page
- Announcement banner component rendered at top of canvas/dashboard when `announcement_banner` is set
- Both use the existing `use-app-settings` hook

### 4. Collapsible Properties Panel
Properties panel always shows, eating drawing space. Will:
- Add a toggle button to show/hide the panel
- Default to collapsed, open on element selection
- Remember preference

### 5. Settings Page Enhancements
Current settings page is minimal. Will add:
- Avatar upload using a Supabase storage bucket
- Account deletion option
- Theme preference persistence

### 6. Polish & Missing Bits
- Keyboard shortcut help modal (? key)
- Board thumbnail generation on save (canvas snapshot to storage)
- Empty state improvements on dashboard

### Technical Notes
- Recharts is already installed
- Storage bucket needed for avatars and thumbnails (migration required)
- `use-app-settings` hook already fetches settings; maintenance/banner logic wraps existing components
- Board sharing requires a profile lookup query for inviting by email

