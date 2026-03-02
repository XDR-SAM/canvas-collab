

## Phase 1: Foundation — Auth, Landing Page & Dashboard

### 1. Database Schema & Security
- Set up tables: `profiles`, `boards`, `board_collaborators`, `board_sessions`, `app_settings`, and `user_roles` (for secure role management)
- Use `app_role` enum (`admin`, `pro_user`, `free_user`) stored in a separate `user_roles` table
- RLS policies on all tables with a `has_role()` security definer function
- Trigger to auto-create profile on signup
- Plan stored on `profiles` table (`free`/`pro`), role in `user_roles`

### 2. Authentication System
- Email/password signup & login pages at `/login` and `/signup`
- Google OAuth integration
- Email verification & password reset flow (with `/reset-password` page)
- Auth context with session management
- Protected route wrapper checking auth + role
- Role-based route guard for `/admin/*`

### 3. Landing Page (`/`)
- Hero section with headline, CTA "Start Drawing Free", animated mockup
- Features section (6 cards with icons)
- How it works (3-step flow)
- Pricing section (Free vs Pro cards)
- Testimonials section (3 cards)
- Footer with links
- Dark/light mode toggle

### 4. User Dashboard (`/dashboard`)
- Board cards grid showing all user boards
- Create new board (name input dialog)
- Rename, duplicate, delete boards
- Star/favorite toggle
- Search by name, sort by last modified/created/name
- Board thumbnail previews (placeholder initially)
- Empty state with CTA
- Loading skeletons

### 5. App Shell & Navigation
- Top navbar with logo, nav links, user avatar dropdown
- Dark/light mode toggle (persisted in localStorage)
- Toast notifications (Sonner) for all actions
- Responsive layout

This phase gives you a fully functional authenticated app with user management and board CRUD. The next phases will add the canvas editor, real-time collaboration, export features, and admin panel.

