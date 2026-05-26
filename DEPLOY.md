# TANAN Mining Dashboard — Deployment Guide
## บริษัท ธนธรณินทร์ จำกัด

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and open your project
2. Open the **SQL Editor**
3. Paste the entire contents of `supabase/schema.sql` and click **Run**
4. This will create all tables, indexes, RLS policies, and seed data
5. Copy your credentials from **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2 — Local development

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 4. Run dev server
npm run dev
# → Open http://localhost:3000
```

---

## Step 3 — Deploy to Vercel

### Option A: Vercel CLI (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import the repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**

---

## Project Structure

```
tanan-mining/
├── public/fonts/Prompt-Black.ttf   ← Custom font
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx            ← Main overview dashboard
│   │   │   ├── production/         ← Production records & charts
│   │   │   ├── equipment/          ← Fleet management
│   │   │   ├── hr/                 ← Staff & workforce
│   │   │   └── sites/              ← Mine site cards
│   │   └── globals.css
│   ├── components/dashboard/       ← Reusable UI components
│   ├── lib/supabase.ts             ← Supabase client
│   └── types/database.ts           ← TypeScript types
└── supabase/schema.sql             ← Database schema + seed data
```

---

## Adding real data

After seeding, replace the sample records via Supabase dashboard or your app's data-entry forms. The dashboard reads everything live from Supabase so changes appear instantly.
