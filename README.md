# Todo Web — App de tareas (versión web)

Versión **web** de una app de tareas (Todo) que consume **el mismo backend** que
la app móvil. Permite organizar tareas en **listas**, con **prioridades**,
**fechas límite** y **categorías**, además de búsqueda, vista global de tareas y
estadísticas del usuario.

La autenticación es con **Firebase Authentication** (email/contraseña) y todas
las peticiones al backend se hacen con **Axios** usando un interceptor que
inyecta un `idToken` fresco de Firebase en cada request.

---

## ✨ Características

- 🔐 **Login / registro** con Firebase (email + contraseña) y **persistencia de sesión**.
- 🛡️ **Rutas protegidas**: las pantallas internas requieren sesión; sin sesión redirige a Login.
- 🗂️ **Listas** (CRUD): crear, editar, borrar; al borrar una lista las tareas quedan sin lista (no se borran).
- ✅ **Tareas** (CRUD): crear, editar, **completar/toggle**, borrar — con **prioridad** (Alta/Media/Baja), **fecha límite**, **lista** y **categorías**.
- 🏷️ **Categorías**: selección múltiple y creación de categorías al vuelo desde el formulario de tarea.
- 📋 **Todas las tareas**: ordena por recientes / prioridad / fecha límite y filtra por estado y prioridad.
- 🔎 **Búsqueda**: busca simultáneamente entre **listas y tareas** (por nombre, descripción y categoría).
- 👤 **Perfil / About**: email del usuario, estadísticas (listas, tareas, pendientes, completadas, por prioridad) y **logout**.
- 🎨 UI limpia y minimalista (light mode), componentes reutilizables, manejo de **loading** y **errores** en todas las llamadas, y diseño **responsive** con sidebar.

---

## 🧰 Tecnologías

| Área | Stack |
|------|-------|
| Framework | **React 19** + **Vite** + **TypeScript** |
| Routing | **react-router-dom v7** |
| Auth | **Firebase Authentication** (Web SDK, email/password) |
| HTTP | **Axios** (instancia personalizada + interceptors) |
| Estilos | CSS con design tokens (variables), tipografía **Inter** |
| Deploy | **Vercel** |

> Nota: la consigna recomendaba Next.js pero permitía explícitamente **React + Vite**.
> Como la autenticación es 100% del lado del cliente (Firebase), un SPA con Vite es la
> opción más simple y directa, y despliega igual de bien en Vercel.

---

## 📁 Estructura del proyecto

```
src/
├── api/                 # Funciones de acceso al backend (una por recurso)
│   ├── lists.ts         #   /list, /list/{id}, /list/{id}/todos
│   ├── todos.ts         #   /todo, /todo/my-todos, /todo/{id}, /todo/{id}/toggle
│   ├── categories.ts    #   /category
│   └── user.ts          #   /user (registro público)
├── components/
│   ├── ui/              # Primitivos reutilizables (Button, Modal, Field, Icons, States…)
│   ├── ListCard.tsx     # Tarjeta de lista
│   ├── ListFormModal.tsx
│   ├── TodoItem.tsx     # Item de tarea (toggle, editar, borrar)
│   ├── TodoFormModal.tsx# Formulario de tarea (prioridad, fecha, lista, categorías)
│   ├── PriorityBadge.tsx
│   ├── CategoryChip.tsx
│   ├── Layout.tsx       # Layout con sidebar de navegación
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx  # Estado de sesión de Firebase (onAuthStateChanged)
├── hooks/
│   ├── useMeta.ts       # Carga listas + categorías para los formularios
│   ├── useTodoManager.ts# Maneja la colección de tareas (toggle optimista + modales)
│   └── useDebounce.ts
├── lib/
│   ├── firebase.ts      # Init de Firebase + persistencia local
│   ├── api.ts           # Instancia de Axios + interceptors (token fresco / errores)
│   ├── types.ts         # Tipos del dominio (Todo, TaskList, Category…)
│   ├── format.ts        # Fechas y utilidades de prioridad
│   └── constants.ts     # Paleta de colores y prioridades
└── pages/
    ├── Login.tsx        # Login + registro
    ├── Home.tsx         # Listas del usuario
    ├── ListDetail.tsx   # Tareas de una lista
    ├── AllTodos.tsx     # Todas las tareas (orden + filtros)
    ├── Search.tsx       # Búsqueda (listas y tareas)
    └── Profile.tsx      # Perfil / About + estadísticas + logout
```

### Cómo se autentican las peticiones

El interceptor de request de Axios (`src/lib/api.ts`) obtiene **siempre** un token
fresco con `auth.currentUser.getIdToken()` (Firebase lo auto-refresca), de modo que
nunca se recibe un `401` después de 1 hora:

```ts
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## ⚙️ Variables de entorno

Copia `.env.example` a `.env` y completa los valores (las claves de Firebase del
cliente web son **públicas** y seguras para el frontend):

```bash
# URL del backend (Cloud Run)
VITE_API_URL=https://todo-backend-7sluyuniza-uc.a.run.app

# Config del cliente web de Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=medsync-1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medsync-1
VITE_FIREBASE_STORAGE_BUCKET=medsync-1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=311397141244
VITE_FIREBASE_APP_ID=1:311397141244:web:6934803947fb8515f2a579
```

> En **Vercel** estas mismas variables deben configurarse en
> *Project → Settings → Environment Variables* (todas con el prefijo `VITE_`).

---

## 🚀 Instalación y ejecución (local)

Requisitos: **Node 18+** (probado con Node 24).

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env (ver sección anterior)
cp .env.example .env

# 3. Levantar el servidor de desarrollo (http://localhost:3000)
npm run dev

# Build de producción y preview
npm run build
npm run preview
```

El dev server corre en el puerto **3000**, que ya está permitido en el CORS del
backend, así que funciona en local sin configurar nada más.

---

## ☁️ Deploy en Vercel

1. Sube el proyecto a un repositorio (GitHub/GitLab) o usa `vercel` CLI.
2. En Vercel, importa el proyecto. Detecta Vite automáticamente:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - El archivo `vercel.json` incluido ya configura el *rewrite* de SPA para que
     rutas como `/list/:id` funcionen al recargar.
3. Agrega las **variables de entorno** `VITE_*` en *Settings → Environment Variables*.
4. Deploy. Obtendrás una URL del tipo `https://tu-app.vercel.app`.

### ⚠️ Paso CRÍTICO: CORS del backend

El backend (Cloud Run) sólo permite `localhost` por defecto. Para que el sitio en
Vercel pueda llamar al backend hay que **añadir el dominio de Vercel** a la variable
`CORS_ORIGINS` del servicio y redeployar. Esto requiere la cuenta de GCP
(`medsync40@gmail.com`, proyecto `project-f9adc6cd-78f9-462a-8a6`):

```bash
gcloud run services update todo-backend --region us-central1 \
  --update-env-vars 'CORS_ORIGINS=http://localhost:3000,https://TU-APP.vercel.app'
```

> Sin este paso, el sitio en producción cargará pero las peticiones al backend
> serán bloqueadas por CORS.

### 🔗 Link desplegado (Vercel)

```
TODO: pegar aquí la URL de Vercel tras el primer deploy
https://<tu-app>.vercel.app
```

---

## 🧪 Usuarios de prueba

| Email | Contraseña |
|-------|------------|
| `ferro.prod@gmail.com` | `Test1234!` |

Esta cuenta ya tiene listas y tareas de ejemplo en la nube (las mismas que la app
móvil). También puedes **registrar** un usuario nuevo desde la pantalla de Login
(usa la ruta pública `POST /user` y luego inicia sesión con Firebase).

---

## ✅ Verificación realizada

Probado end-to-end en local contra el backend de producción con el usuario de prueba:
login y persistencia de sesión, carga de listas y tareas reales, crear/completar/
editar/borrar tareas (con prioridad, fecha, lista y categorías), búsqueda de listas
y tareas, estadísticas del perfil y logout. La consola queda sin errores.
