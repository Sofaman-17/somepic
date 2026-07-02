# OS Interno · Guía de arranque completa
## De cero a funcionando en 30 minutos

---

## Lo que vas a tener al final

Una aplicación web privada accesible desde cualquier navegador con:
- Login con usuario y contraseña
- Dashboard con estadísticas y gráficos reales
- Biblioteca de libros físicos (Vinted/Wallapop)
- Pipeline de contenido AI (TikTok/Reels/Shorts)
- Productos digitales (Gumroad)
- Ventas unificadas de todos los canales
- Generador de scripts con Claude AI
- Analytics con 5 tipos de gráficos
- Filtros y búsqueda en todas las secciones
- Ajustes de perfil y contraseña

---

## Requisitos previos

Instala estas herramientas si no las tienes:

### 1. Node.js
- Descarga desde https://nodejs.org (versión LTS, la verde)
- Instala y reinicia el ordenador
- Verifica: abre Terminal y escribe `node --version` → debe mostrar v18 o superior

### 2. VS Code (editor de código)
- Descarga desde https://code.visualstudio.com
- Instala normalmente

### 3. Git (opcional pero recomendado)
- Mac: ya viene instalado
- Windows: descarga desde https://git-scm.com

---

## PASO 1 · Preparar el proyecto

### 1.1 Descomprime el ZIP
- Doble clic en `os-interno-mvp-charts.zip`
- Se crea una carpeta llamada `mvp`
- Muévela donde quieras (ej: Escritorio o Documentos)

### 1.2 Abre la carpeta en VS Code
- Abre VS Code
- Archivo → Abrir carpeta → selecciona la carpeta `mvp`

### 1.3 Abre la Terminal integrada
- En VS Code: menú Terminal → Nueva Terminal
- Verás una ventana negra en la parte inferior

### 1.4 Instala las dependencias
Escribe esto en la terminal y pulsa Enter:
```
npm install
```
Espera 1-2 minutos. Normal que aparezcan muchas líneas.

---

## PASO 2 · Crear el proyecto en Supabase (base de datos)

### 2.1 Crea una cuenta
- Ve a https://supabase.com
- Clic en "Start your project" → regístrate con Google o email

### 2.2 Crea un nuevo proyecto
- Clic en "New project"
- Organization: la que se creó automáticamente
- Name: `os-interno` (o el nombre que quieras)
- Database Password: escribe una contraseña segura y GUÁRDALA
- Region: `West EU (Frankfurt)` — la más cercana a España
- Clic en "Create new project"
- Espera 2-3 minutos mientras se crea

### 2.3 Ejecuta el schema de la base de datos
- En tu proyecto Supabase, clic en **SQL Editor** (icono de base de datos en el menú izquierdo)
- Clic en "New query"
- Abre el archivo `supabase-schema.sql` de tu proyecto con VS Code
- Selecciona TODO el contenido (Ctrl+A / Cmd+A) y cópialo
- Pégalo en el editor SQL de Supabase
- Clic en el botón verde **"Run"**
- Debe aparecer "Success. No rows returned"

Esto crea todas las tablas, reglas de seguridad y datos de prueba.

### 2.4 Obtén las claves de API
- En Supabase, clic en **Settings** (rueda dentada, abajo a la izquierda)
- Clic en **API**
- Copia estos dos valores (los necesitarás en el paso 3):
  - **Project URL**: algo como `https://abcdefgh.supabase.co`
  - **anon public**: una cadena larga que empieza por `eyJ...`

---

## PASO 3 · Configurar las variables de entorno

### 3.1 Crea el archivo de configuración
En la terminal de VS Code:
```
cp .env.local.example .env.local
```

### 3.2 Edita el archivo
- En VS Code, abre el archivo `.env.local` (aparece en el explorador de archivos)
- Rellena con tus datos:

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu_clave_anon
ANTHROPIC_API_KEY=sk-ant-...tu_clave_anthropic
```

### 3.3 Obtén la clave de Anthropic (para el generador de IA)
- Ve a https://console.anthropic.com
- Regístrate o inicia sesión
- Clic en **API Keys** → **Create Key**
- Copia la clave (empieza por `sk-ant-`) y pégala en `.env.local`
- IMPORTANTE: esta clave solo se muestra una vez, guárdala

---

## PASO 4 · Crear tu usuario

### 4.1 Crea el primer usuario en Supabase
- En Supabase → **Authentication** (icono de persona) → **Users**
- Clic en **Add user** → **Create new user**
- Email: tu email real
- Password: contraseña segura
- Marca "Auto confirm user" ✓
- Clic en "Create user"

### 4.2 Asigna el rol de admin
- En Supabase → **SQL Editor** → New query
- Pega esto (cambia el email por el tuyo):

```sql
UPDATE public.profiles
SET role = 'admin', full_name = 'Tu Nombre Aquí'
WHERE email = 'tu@email.com';
```
- Clic en "Run"

---

## PASO 5 · Arrancar la aplicación

En la terminal de VS Code:
```
npm run dev
```

Abre tu navegador y ve a:
```
http://localhost:3000
```

Redirigirá automáticamente al login. Entra con el email y contraseña que creaste.

¡Ya tienes el sistema funcionando!

---

## PASO 6 · Publicar en internet (Deploy en Vercel)

Para acceder desde cualquier dispositivo (móvil, otro ordenador, etc.):

### 6.1 Sube el código a GitHub
- Ve a https://github.com → New repository
- Name: `os-interno` → Create repository
- En la terminal:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/os-interno.git
git push -u origin main
```

### 6.2 Conecta con Vercel
- Ve a https://vercel.com → Sign up with GitHub
- Clic en "Add New Project"
- Selecciona el repositorio `os-interno`
- Clic en "Deploy" (Vercel lo detecta como Next.js automáticamente)

### 6.3 Añade las variables de entorno en Vercel
- Una vez desplegado, ve a tu proyecto en Vercel
- Settings → Environment Variables
- Añade las tres variables del archivo `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `ANTHROPIC_API_KEY`
- Clic en "Redeploy" para aplicar los cambios

Tu app estará disponible en una URL como `https://os-interno.vercel.app`

---

## Solución de problemas comunes

### "Error: Cannot find module"
```
npm install
```

### "Invalid API key" (Supabase)
- Verifica que copiaste bien la URL y la anon key en `.env.local`
- La URL no debe tener `/` al final

### "Unauthorized" al usar el generador de IA
- Verifica que la `ANTHROPIC_API_KEY` está en `.env.local`
- La clave debe empezar por `sk-ant-`

### La página de login no redirige al dashboard
- Verifica que ejecutaste el SQL del schema en Supabase
- Verifica que creaste el usuario con "Auto confirm user" marcado

### "npm run dev" no funciona
- Verifica que Node.js está instalado: `node --version`
- Verifica que estás dentro de la carpeta `mvp` en la terminal

---

## Estructura de archivos importante

```
mvp/
├── .env.local              ← TUS CLAVES (nunca subir a GitHub)
├── supabase-schema.sql     ← Schema de la BD (ya ejecutado)
├── src/
│   ├── app/                ← Páginas de la aplicación
│   ├── components/         ← Componentes reutilizables
│   └── lib/                ← Lógica de negocio y acciones
└── package.json            ← Dependencias del proyecto
```

---

## Próximas funcionalidades planeadas

- [ ] Conexión automática con Gumroad API (sync de ventas)
- [ ] Notificaciones de nuevas ventas
- [ ] Exportar datos a CSV/Excel
- [ ] App móvil (PWA)
- [ ] Múltiples usuarios con invitación

---

*OS Interno v1.0 · Generado con Claude · Stack: Next.js + Supabase + TypeScript*
