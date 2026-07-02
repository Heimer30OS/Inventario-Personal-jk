-- ============================================================
--  Esquema de base de datos para "Inventario Web"
--  Ejecuta este script en Supabase: Project > SQL Editor > New query
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.productos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text not null default '',
  categoria   text not null,
  cantidad    integer not null default 0 check (cantidad >= 0),
  precio      numeric(12,2) not null default 0 check (precio >= 0),
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id)
);

-- Mantiene el listado ordenado por fecha de creación al consultarlo
create index if not exists productos_created_at_idx on public.productos (created_at desc);

-- ── Seguridad a nivel de fila ────────────────────────────────
-- Este inventario es compartido: cualquier usuario autenticado
-- (dado de alta por ti en Authentication > Users) puede ver y
-- administrar todos los productos, igual que en la app de escritorio.
alter table public.productos enable row level security;

create policy "usuarios_autenticados_pueden_leer"
  on public.productos for select
  to authenticated
  using (true);

create policy "usuarios_autenticados_pueden_insertar"
  on public.productos for insert
  to authenticated
  with check (true);

create policy "usuarios_autenticados_pueden_actualizar"
  on public.productos for update
  to authenticated
  using (true)
  with check (true);

create policy "usuarios_autenticados_pueden_borrar"
  on public.productos for delete
  to authenticated
  using (true);

-- ── Datos de ejemplo (opcional, puedes borrar este bloque) ───
insert into public.productos (nombre, descripcion, categoria, cantidad, precio, activo)
values
  ('Cuaderno profesional', '100 hojas cuadriculadas', 'Papelería', 40, 15.50, true),
  ('Mouse inalámbrico', 'Mouse óptico USB', 'Electrónica', 4, 85.00, true),
  ('Silla de oficina', 'Silla ergonómica con respaldo alto', 'Mobiliario', 0, 650.00, true)
on conflict do nothing;
