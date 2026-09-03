# Kasbon

Web app sederhana buat catat utang piutang pribadi — siapa hutang berapa ke kamu, atau kamu hutang berapa ke siapa. Dibuat pakai Next.js 16 App Router, TypeScript, Tailwind CSS v4, dan Supabase.

## Demo

- **Live demo:** `<https://kasbon-fmw8.vercel.app>`
- **Repo:** `<https://github.com/Ariwibowo07/kasbon>`

## Stack

- Next.js 16 (App Router) + TypeScript (strict mode)
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth) via `@supabase/ssr` dan `@supabase/supabase-js`
- Lucide React buat icon

### Library tambahan (di luar yang wajib)

- **`zod`** — dipakai buat validasi input di API routes dan direfleksikan lagi di sisi client (form). Alasannya: biar aturan validasi (nama wajib, jumlah harus angka positif, catatan max 200 karakter, dst) gak perlu ditulis manual dua kali dengan resiko beda logic antara client dan server, dan error message-nya bisa langsung Bahasa Indonesia.

Gak ada library UI/state-management tambahan lain — state cukup pakai `useState`/`useEffect` bawaan React karena scope-nya masih kecil (satu resource: `debts`).

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd kasbon
npm install
```

### 2. Buat project Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (free tier).
2. Di **Project Settings → API**, salin `Project URL` dan `anon public key`.
3. Copy `.env.example` jadi `.env.local`, lalu isi:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. (Opsional tapi disarankan) Di **Authentication → Providers → Email**, matikan "Confirm email" kalau mau testing cepat tanpa cek inbox. Kalau dibiarkan aktif, user baru harus klik link konfirmasi dulu sebelum bisa login.

### 3. Migrate database

Ada dua cara:

**A. Lewat Supabase SQL Editor (paling gampang)**
Buka **SQL Editor** di dashboard Supabase, paste isi `supabase/migrations/0001_init.sql`, lalu Run.

**B. Lewat Supabase CLI**

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Migration ini bikin tabel `debts`, enum `debt_type`, index buat filter/sort, trigger `updated_at`, dan **RLS policies** yang membatasi user cuma bisa SELECT/INSERT/UPDATE/DELETE row miliknya sendiri.

### 4. Jalankan local

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — bakal diredirect ke `/login` kalau belum login.

### 5. Build production

```bash
npm run build
npm start
```

## Approach

Struktur datanya sengaja dibuat tipis: satu tabel `debts` dengan kolom `type` (`owed_to_me` / `i_owe`) dan `settled_at` (nullable timestamp — null berarti belum lunas, diisi berarti lunas). Keputusan yang paling saya banggain adalah nge-treat "tandai lunas" sebagai update `settled_at` di server lewat `PATCH /api/debts/[id]`, bukan cuma toggle state di client — jadi statusnya persist beneran di database dan gak balik ke "belum lunas" pas di-refresh (salah satu auto-reject di brief). RLS di-enforce dobel: lewat Supabase RLS policy (`auth.uid() = user_id`, plus `force row level security` biar gak ada celah lewat REST API langsung) dan juga di query API route (`.eq("user_id", user.id)`) sebagai defense-in-depth, walaupun secara teori RLS-nya sendiri udah cukup.

## Trade-off

Kalau ada 1 hari lagi, yang mau saya polish:

1. **Group by orang** — brief nyebut bonus "Budi: 3 entry, total Rp X", belum sempat saya bikin toggle-nya di UI (data-nya udah bisa di-agregasi dari list yang ada, tinggal bikin view-nya).
2. **Optimistic update** — sekarang tiap aksi (tandai lunas, hapus, edit) nunggu response API dulu baru refresh list. Buat UX yang lebih responsif, bisa dibikin optimistic dengan rollback kalau gagal.
3. **Test otomatis** — belum ada unit/integration test buat validasi schema dan RLS (sekarang RLS saya cek manual pakai `curl` + anon key user lain). Idealnya ada test script yang jalan di CI buat mastiin RLS gak pernah bocor pas ada perubahan schema.
4. **Toast notification** — error dari API sekarang cuma muncul di dalam modal/list; notifikasi global (toast) bakal lebih enak buat aksi cepat kayak tandai lunas/hapus.

## Time spent

Jujur: sekitar **6-7 jam**, termasuk setup project, semua CRUD + auth + RLS, styling mobile-first, dan nulis README ini.

## Cek RLS gak bocor (cara testing manual)

```bash
# Ganti <ANON_KEY> dan <OTHER_USER_ACCESS_TOKEN> (dari user lain yang login)
curl "https://xxxxxxxxxxxx.supabase.co/rest/v1/debts" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <OTHER_USER_ACCESS_TOKEN>"
# Harusnya cuma balikin row milik user itu sendiri, bukan semua row.
```

## Struktur project

```
src/
  app/
    api/debts/route.ts          GET (list + filter), POST (create)
    api/debts/[id]/route.ts     PATCH (update/tandai lunas), DELETE
    login/page.tsx              Halaman login
    signup/page.tsx             Halaman signup
    page.tsx                    Dashboard (protected)
  components/                   UI components (form, list, filter, states, chart)
  lib/
    supabase/                   Client Supabase (browser/server/middleware)
    format.ts                   Format Rupiah & relative time (id-ID)
    validation.ts                Zod schema (shared client + server)
  types/debt.ts                 TypeScript types
supabase/migrations/0001_init.sql   Schema + RLS policies
```
