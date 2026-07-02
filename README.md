# OS Interno · Guía de arranque completa

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **UI**: shadcn/ui (componentes instalados manualmente)
- **Backend/DB**: Supabase (Auth + PostgreSQL + Storage)
- **Deploy**: Vercel (recomendado)

---

## 1. Configura Supabase

### Crea el proyecto
1. Ve a supabase.com → New project
2. Nombre: `os-interno`
3. Región: West EU (Frankfurt)

### Ejecuta el schema
1. Supabase → SQL Editor
2. Pega el contenido de `supabase-schema.sql`
3. Haz clic en Run

### Obtén las keys
Settings → API → copia Project URL y anon public key

---

## 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu_anon_key
```

---

## 3. Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — redirige automáticamente a /login

---

## 4. Crear usuario admin

En Supabase → Authentication → Users → Add user
Luego en SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin', full_name = 'Tu Nombre'
WHERE email = 'tu@email.com';
```

---

## 5. Estructura

```
src/
├── app/
│   ├── (auth)/login/page.tsx       # Login
│   └── (dashboard)/
│       ├── layout.tsx               # Sidebar + Header (protegido)
│       ├── dashboard/page.tsx       # Stats generales
│       ├── biblioteca/page.tsx      # Libros fisicos
│       ├── contenido/page.tsx       # Pipeline AI
│       ├── productos/page.tsx       # Productos digitales
│       └── ventas/page.tsx          # Ventas unificadas
├── components/
│   ├── ui/                          # Button, Card, Badge, Input…
│   ├── layout/                      # Sidebar, Header, PageHeader
│   ├── dashboard/                   # StatCard, RecentSales, ContentPipeline
│   ├── biblioteca/                  # BookRow
│   ├── contenido/                   # ContentCard
│   ├── productos/                   # ProductCard
│   └── ventas/                      # SaleRow
├── lib/supabase/                    # client.ts + server.ts
├── types/index.ts                   # Todos los tipos TypeScript
└── middleware.ts                    # Proteccion de rutas
```

---

## 6. Deploy

```bash
npm i -g vercel
vercel
```

Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel Dashboard.

---

## Proximos pasos

- Formularios modales para crear/editar registros
- Filtros y busqueda en cada seccion
- Upload de imagenes a Supabase Storage
- Generador de hooks/scripts con Claude API
- Conexion Gumroad API (sync automatica de ventas)
- Graficos de ingresos (Recharts)
