# PropRules

Plataforma donde los traders consultan las reglas de las principales prop firms de CFD y Futuros — drawdown, consistencia, payout, restricciones legales y casos reales — en un solo lugar.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Supabase** (Auth con Email/Password, Postgres, Row Level Security)
- **next-intl** (español / inglés)
- **next-themes** (modo oscuro / claro)
- **react-hot-toast** (notificaciones del admin)

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a supabase.com y crea un nuevo proyecto.
2. Ve a Project Settings → API y copia: Project URL y anon public key.
3. Crea el archivo `.env.local` en la raíz:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Ejecutar el esquema de base de datos

1. Ve a SQL Editor en el dashboard de Supabase.
2. Pega el contenido completo de `supabase/schema.sql`.
3. Ejecuta. Esto crea todas las tablas, políticas de seguridad (RLS) y datos de ejemplo de FTMO.

### 4. Habilitar Email Authentication

1. En Supabase: Authentication → Providers → Email.
2. Activa el proveedor Email (está activado por defecto en la mayoría de proyectos).
3. En Authentication → URL Configuration, agrega como Redirect URL:
   - http://localhost:3000/auth/callback
   - https://tu-dominio.com/auth/callback

### 5. Crear usuario y convertirte en administrador

1. En Supabase: Authentication → Users → Add user.
2. Crea un usuario con tu email y contraseña.
3. Inicia sesión en el sitio (esto crea tu fila en `admin_users` automáticamente).
4. Ve al SQL Editor de Supabase y ejecuta:

```sql
update admin_users set is_admin = true where email = 'tu-email@gmail.com';
```

Ahora puedes acceder a `/dashboard`.

### 6. Correr en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 — te redirige automáticamente a `/es`.

## Estructura del proyecto

```
app/
  [locale]/                          rutas publicas (es / en)
    page.tsx                         home
    [propSlug]/
      page.tsx                       redirige segun cantidad de challenges
      [challengeSlug]/page.tsx       pagina de reglas completa
  dashboard/                         panel admin (protegido)
  auth/callback/                     OAuth callback de Supabase
components/
  layout/                            Header, Footer
  home/                              PropList, ChallengeModal, UpdatesList
  rules/                             RulesTabs (7 pestanas), DiscountBar
  ui/                                Badge, AlertCard, RuleRow
lib/
  supabase/                          clientes browser y server
  data.ts                            funciones de fetching
  utils.ts                           helpers (slugify, timeAgo, cn)
types/
  index.ts                           modelo de datos completo
messages/
  es.json, en.json                   traducciones
supabase/
  schema.sql                         esquema completo + seed de FTMO
```

## Flujo de datos

Cada Prop tiene uno o mas Challenges. Cada Challenge tiene 6 secciones de reglas (Riesgo, Objetivos, Trading, Restricciones especiales, Financiada, Legal) mas un Resumen y La letra pequena. Cada seccion puede tener alertas, interpretaciones y casos practicos asociados.

Si una prop tiene un solo challenge activo, el boton "Ver reglas" navega directo a la pagina de reglas, sin modal. Si tiene mas de uno, abre el modal de seleccion.

## Panel de administracion

Accesible en /dashboard solo para usuarios con is_admin = true en la tabla admin_users.

Permite gestionar:
- Prop firms: crear, editar, duplicar, activar/desactivar, eliminar
- Challenges: anidados dentro de cada prop, con todos sus campos de reglas
- Actualizaciones: noticias de cambios, con opcion de destacar y ocultar
- Descuentos: codigo, descripcion y link de afiliado por prop
- Portada: titulo del hero en ambos idiomas
- Configuracion: SEO global y visibilidad de la seccion de actualizaciones

## Despliegue

El proyecto esta listo para desplegar en Vercel:

1. Sube el codigo a un repositorio de GitHub.
2. Importa el repo en vercel.com.
3. Agrega las mismas variables de entorno (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) en Vercel -> Settings -> Environment Variables.
4. Despliega. Vercel detecta Next.js automaticamente.
5. Conecta tu dominio desde Vercel -> Domains.
6. Actualiza el Redirect URL en Supabase con tu dominio de producción.

## Notas

- El admin es de escritorio, no se optimizo el dashboard para mobile intencionalmente.
- Los datos de ejemplo de FTMO en schema.sql sirven como referencia de como estructurar el contenido de cada prop nueva.
- El campo fine_print (La letra pequena) es texto completamente libre, ahi puedes escribir cualquier observacion que no encaje en las categorias estructuradas.
