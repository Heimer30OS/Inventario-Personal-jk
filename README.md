# Inventario Web

Versión web del "Sistema de Gestión de Inventario" (la app de escritorio en Java),
hecha con **Next.js + Supabase**, para que puedas usar el inventario desde el
navegador, con login y una base de datos en la nube compartida con quien tú
autorices.

Incluye las mismas funciones que la app de Java:

- **Login** (primera pantalla, obligatorio para entrar)
- **Productos**: crear, editar, buscar, ocultar/mostrar, exportar a Excel (.xlsx),
  importar desde TXT (`NOMBRE|DESCRIPCION|CATEGORIA|CANTIDAD|PRECIO`)
- **Existencias**: tarjetas resumen, filtros por estado, tabla de valorización
  y gráfico de barras por categoría

---

## 1. Crear la base de datos gratuita (Supabase)

Se usa **[Supabase](https://supabase.com)** porque da, gratis: base de datos
PostgreSQL en la nube + sistema de login (autenticación) integrado, que es
justo lo que necesita esta app. No hay que programar el login desde cero.

1. Entra a **https://supabase.com** y crea una cuenta gratuita (puedes usar tu
   cuenta de GitHub o Google).
2. Clic en **"New project"**.
   - Nombre: `inventario-web` (o el que quieras)
   - Contraseña de la base de datos: elige una segura y **guárdala**
   - Región: la más cercana a ti (ej. `South America (São Paulo)`)
   - Plan: **Free**
3. Espera 1-2 minutos mientras se crea el proyecto.
4. Ve a **SQL Editor** (menú izquierdo) → **New query**.
5. Abre el archivo `supabase/schema.sql` de este proyecto, copia todo su
   contenido, pégalo en el editor y dale **Run**. Esto crea la tabla
   `productos`, sus reglas de seguridad y 3 productos de ejemplo.
6. Ve a **Project Settings** (ícono de engranaje) → **API**. Copia:
   - **Project URL**
   - **anon public key**

   Los vas a necesitar en el paso 3.

### Crear usuarios que podrán iniciar sesión

Como es un sistema interno (igual que la app de escritorio), los usuarios no
se registran solos: tú los creas desde Supabase.

1. Ve a **Authentication** → **Users** → **Add user** → **Create new user**.
2. Escribe el correo y una contraseña, y marca **Auto Confirm User**.
3. Repite por cada persona que deba tener acceso.

Con eso, esas personas ya pueden iniciar sesión en la página web.

---

## 2. Probar el proyecto en tu computadora (opcional)

```bash
npm install
cp .env.local.example .env.local
```

Edita `.env.local` y pega los valores que copiaste de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

Luego:

```bash
npm run dev
```

Abre **http://localhost:3000** — te debe pedir login antes de mostrar nada más.

---

## 3. Publicar en Vercel (gratis)

1. Sube este proyecto a un repositorio de **GitHub** (crea uno nuevo y sube
   toda esta carpeta, o usa GitHub Desktop si prefieres no usar comandos).
2. Entra a **https://vercel.com** y crea una cuenta gratuita (puedes usar tu
   cuenta de GitHub).
3. Clic en **"Add New..." → "Project"** y selecciona el repositorio que
   subiste.
4. En **"Environment Variables"**, agrega las mismas dos variables del paso
   anterior:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clic en **Deploy**. En 1-2 minutos tendrás una URL pública, por ejemplo
   `https://inventario-web.vercel.app`, ya conectada a la misma base de datos
   que usa (o usará) tu app de escritorio si decides migrarla.

Cada vez que subas cambios a la rama principal del repositorio, Vercel vuelve
a publicar la página automáticamente.

---

## Notas importantes

- **La base de datos es compartida**: cualquier usuario que inicie sesión ve
  y edita el mismo inventario (igual que si varias personas usaran la app de
  Java sobre el mismo archivo). Si en el futuro necesitas que cada usuario
  tenga su propio inventario separado, se puede ajustar la seguridad
  (`RLS`) en `supabase/schema.sql`.
- **La app de escritorio actual guarda los datos en un archivo local**
  (`inventario.dat`), no en Supabase. Esta web es un sistema independiente y
  paralelo. Si más adelante quieres que la app de Java también use Supabase
  en vez del archivo local, se puede adaptar `GestorDatos.java` para que
  hable con la misma base de datos por HTTP (usando la API REST que Supabase
  genera automáticamente).
- El plan gratuito de Supabase incluye 500 MB de base de datos y pausa el
  proyecto tras 1 semana de inactividad (se reactiva solo con la primera
  visita, tarda unos segundos). Es más que suficiente para un inventario de
  este tamaño.
