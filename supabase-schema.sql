-- ══════════════════════════════════════════════════════════════════
-- OS INTERNO · SCHEMA SUPABASE
-- Ejecuta este SQL en el editor SQL de tu proyecto Supabase
-- ══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- EXTENSIONES
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extiende auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'editor' check (role in ('admin', 'editor')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Crea un perfil automáticamente al registrar un usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- BOOKS (Libros físicos – Vinted)
-- ─────────────────────────────────────────────
create table public.books (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  author         text,
  isbn           text,
  condition      text not null default 'bueno'
                   check (condition in ('nuevo', 'muy_bueno', 'bueno', 'aceptable')),
  status         text not null default 'disponible'
                   check (status in ('disponible', 'vendido', 'reservado', 'archivado')),
  purchase_price numeric(10,2),
  sale_price     numeric(10,2),
  platform       text not null default 'vinted'
                   check (platform in ('vinted', 'wallapop', 'otro')),
  listing_url    text,
  cover_url      text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- DIGITAL PRODUCTS (Productos digitales – Gumroad)
-- ─────────────────────────────────────────────
create table public.digital_products (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  description    text,
  type           text not null default 'ebook'
                   check (type in ('ebook', 'plantilla', 'curso', 'pack', 'otro')),
  status         text not null default 'borrador'
                   check (status in ('borrador', 'publicado', 'archivado')),
  price          numeric(10,2) not null default 0,
  gumroad_url    text,
  cover_url      text,
  file_url       text,
  sales_count    integer not null default 0,
  revenue_total  numeric(10,2) not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- CONTENT PIECES (Contenido AI – TikTok / Reels / Shorts)
-- ─────────────────────────────────────────────
create table public.content_pieces (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  script              text,
  hook                text,
  platform            text not null default 'todos'
                        check (platform in ('tiktok', 'instagram', 'youtube', 'todos')),
  status              text not null default 'idea'
                        check (status in ('idea', 'en_produccion', 'grabado', 'editado', 'publicado', 'archivado')),
  ai_generated        boolean not null default false,
  publish_date        date,
  video_url           text,
  thumbnail_url       text,
  views               integer,
  likes               integer,
  linked_product_id   uuid references public.digital_products(id) on delete set null,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- SALES (Ventas unificadas de todos los canales)
-- ─────────────────────────────────────────────
create table public.sales (
  id                  uuid primary key default uuid_generate_v4(),
  channel             text not null
                        check (channel in ('vinted', 'gumroad', 'wallapop', 'directo', 'otro')),
  status              text not null default 'completada'
                        check (status in ('completada', 'pendiente', 'reembolsada', 'cancelada')),
  amount              numeric(10,2) not null,
  fees                numeric(10,2),
  net_amount          numeric(10,2) generated always as (amount - coalesce(fees, 0)) stored,
  product_type        text not null check (product_type in ('book', 'digital')),
  book_id             uuid references public.books(id) on delete set null,
  digital_product_id  uuid references public.digital_products(id) on delete set null,
  buyer_name          text,
  notes               text,
  sold_at             timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- TRIGGERS: updated_at automático
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger books_updated_at
  before update on public.books
  for each row execute procedure public.set_updated_at();

create trigger digital_products_updated_at
  before update on public.digital_products
  for each row execute procedure public.set_updated_at();

create trigger content_pieces_updated_at
  before update on public.content_pieces
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Solo usuarios autenticados pueden acceder — sistema 100% privado
-- ─────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.books             enable row level security;
alter table public.digital_products  enable row level security;
alter table public.content_pieces    enable row level security;
alter table public.sales             enable row level security;

-- Políticas: cualquier usuario autenticado puede leer y escribir todo
-- (sistema interno de 2 personas – no necesitamos restricciones granulares en MVP)
create policy "authenticated_all" on public.profiles
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on public.books
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on public.digital_products
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on public.content_pieces
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on public.sales
  for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- DATOS DE PRUEBA (opcional – comenta si no quieres)
-- ─────────────────────────────────────────────
insert into public.books (title, author, condition, status, purchase_price, sale_price, platform) values
  ('El nombre del viento', 'Patrick Rothfuss', 'muy_bueno', 'disponible', 2.00, 8.00, 'vinted'),
  ('Sapiens', 'Yuval Noah Harari', 'bueno', 'disponible', 1.50, 6.00, 'vinted'),
  ('Atomic Habits', 'James Clear', 'nuevo', 'vendido', 3.00, 12.00, 'vinted');

insert into public.digital_products (title, description, type, status, price, sales_count, revenue_total) values
  ('Plantilla Notion para creadores', 'Sistema completo de gestión de contenido', 'plantilla', 'publicado', 9.99, 23, 229.77),
  ('Guía AI para TikTok', 'Cómo usar IA para crear contenido viral', 'ebook', 'publicado', 14.99, 8, 119.92);

insert into public.content_pieces (title, hook, platform, status, ai_generated) values
  ('5 libros que cambiarán tu forma de pensar', 'Estos libros me arruinaron la vida... para bien', 'tiktok', 'idea', true),
  ('Cómo genero ingresos pasivos vendiendo PDFs', 'Gané 200€ este mes sin trabajar (casi)', 'instagram', 'en_produccion', true),
  ('Mi sistema de productividad con Notion + IA', 'El sistema que uso para crear 30 vídeos al mes', 'youtube', 'publicado', false);

insert into public.sales (channel, status, amount, fees, product_type, buyer_name, sold_at) values
  ('vinted', 'completada', 8.00, 0.80, 'book', 'María G.', now() - interval '2 days'),
  ('gumroad', 'completada', 9.99, 1.00, 'digital', 'Carlos M.', now() - interval '1 day'),
  ('gumroad', 'completada', 14.99, 1.50, 'digital', 'Ana P.', now()),
  ('vinted', 'completada', 6.00, 0.60, 'book', 'Luis R.', now() - interval '5 days');
