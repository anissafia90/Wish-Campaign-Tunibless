# Tunibless - New Year Wishes Platform 🎉

A beautiful, production-ready web application for sharing New Year wishes with the Tunibless community. Built with React, TypeScript, TailwindCSS.

## ✨ Features

### Core Features

- **Authentication System**: Secure email/password signup and login
- **Wish Wall**: Public feed of New Year wishes from the community
- **Create & Manage Wishes**: Post, edit, and delete your wishes (max 300 characters)
- **Like System**: Like wishes from other users (one like per user)
- **User Profiles**: Customizable profiles with avatar, name, and country
- **Admin Dashboard**: Protected admin area with:
  - Platform statistics (users, wishes, likes)
  - Content moderation (delete any wish)
  - Real-time metrics

### Technical Features

- **Real-time Updates**: Wish Wall updates automatically when new wishes are posted
- **Responsive Design**: Mobile-first, fully responsive UI
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Secure**: Row Level Security (RLS) policies on all database tables
- **Form Validation**: Client-side validation with helpful error messages
- **Toast Notifications**: User-friendly feedback for all actions

## 🎨 Design

The application uses Tunibless brand colors:

- **Primary Blue**: #1B4E9B (hsl(213 77% 35%))
- **Accent Red**: #D42A1C (hsl(6 78% 48%))
- Beautiful gradients and smooth transitions throughout

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone <YOUR_GIT_URL>
cd tunibless-wishes
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

All environment variables are automatically configured via Lovable Cloud:

- `VITE_SUPABASE_URL` - Lovable Cloud database URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public API key
- `VITE_SUPABASE_PROJECT_ID` - Project identifier

## 📱 Pages & Routes

- `/` - Home page with Wish Wall
- `/auth` - Login and signup
- `/dashboard` - User dashboard (authenticated)
- `/dashboard/new-wish` - Create new wish (authenticated)
- `/profile` - Edit user profile (authenticated)
- `/admin` - Admin dashboard (admin only)

## 🗄️ Database Schema

### Tables

**profiles**

- `id` (uuid, PK) - References auth.users
- `full_name` (text)
- `city` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamp)

**wishes**

- `id` (uuid, PK)
- `user_id` (uuid, FK to profiles)
- `title` (varchar 120)
- `content` (text, max 300 chars)
- `image_url` (text, nullable)
- `is_public` (boolean, default true)
- `likes_count` (integer, default 0)
- `created_at` (timestamp)

**likes**

- `id` (uuid, PK)
- `user_id` (uuid, FK to profiles)
- `wish_id` (uuid, FK to wishes)
- `created_at` (timestamp)
- Unique constraint on (user_id, wish_id)

**admin_users**

- `id` (uuid, PK)
- `user_id` (uuid, FK to profiles)
- `created_at` (timestamp)

### Security

All tables have Row Level Security (RLS) enabled:

- Users can only modify their own data
- Public wishes are viewable by everyone
- Admins can delete any wish
- Likes are public but only the owner can delete

```

## 🛠️ Built With

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Shadcn/ui** - UI components
- **React Router** - Routing
-  Backend (Supabase under the hood)
- **React Query** - Data fetching
- **Zod** - Schema validation
- **date-fns** - Date formatting
- **Sonner** - Toast notifications

## 📦 Project Structure

```

tunibless-wishes/
├── src/
│ ├── components/
│ │ ├── ui/ # Shadcn UI components
│ │ ├── Header.tsx # Navigation header
│ │ └── WishCard.tsx # Wish display component
│ ├── contexts/
│ │ └── AuthContext.tsx # Authentication state
│ ├── pages/
│ │ ├── Home.tsx # Landing + Wish Wall
│ │ ├── Auth.tsx # Login/Signup
│ │ ├── Dashboard.tsx # User dashboard
│ │ ├── NewWish.tsx # Create wish form
│ │ ├── Profile.tsx # Profile settings
│ │ └── Admin.tsx # Admin dashboard
│ ├── integrations/
│ │ └── supabase/ # Auto-generated Supabase client
│ ├── App.tsx # Root component with routes
│ ├── main.tsx # App entry point
│ └── index.css # Global styles + design system
├── public/
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json

```

## 🔒 Security Best Practices

- ✅ All database tables have RLS policies
- ✅ Client-side input validation with Zod
- ✅ Server-side validation via RLS
- ✅ Secure authentication via Lovable Cloud
- ✅ No sensitive data in client code
- ✅ Admin status verified server-side

## 🎯 Future Enhancements

Potential features to add:
- Image upload to storage (currently URL only)
- Pagination or infinite scroll on Wish Wall
- Social sharing buttons (Twitter, Facebook)
- Email notifications for likes
- Wish categories or tags
- Search and filter functionality
- Export wishes to CSV (admin)
- Dark mode toggle

## 📄 License

This project is private and proprietary to Tunibless.

---
```
