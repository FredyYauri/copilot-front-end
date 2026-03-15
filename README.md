# CRM App — Angular 19+

Aplicación CRM (Customer Relationship Management) construida con Angular 19+, standalone components, signals y arquitectura limpia.

## Requisitos previos

- Node.js 20+
- Angular CLI 19+

```bash
npm install -g @angular/cli
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`.

## Estructura del proyecto

```
src/
├── app/
│   ├── core/                        # Servicios singleton, guards, interceptors, modelos
│   │   ├── guards/
│   │   │   └── auth.guard.ts        # authGuard y guestGuard (funcionales)
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts  # Agrega Bearer token a las peticiones
│   │   │   └── error.interceptor.ts # Manejo global de errores HTTP (401 → login)
│   │   ├── models/
│   │   │   ├── user.model.ts        # User, LoginRequest, LoginResponse
│   │   │   └── tokens.ts            # InjectionToken API_URL
│   │   └── services/
│   │       └── auth.service.ts      # Autenticación con signals
│   ├── features/                    # Módulos de negocio (lazy loaded)
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login/           # Login con email, password, aceptar, cancelar
│   │   │   │   └── forgot-password/ # Recuperación de contraseña
│   │   │   └── auth.routes.ts
│   │   └── dashboard/
│   │       ├── pages/dashboard/     # Dashboard con cards resumen
│   │       └── dashboard.routes.ts
│   ├── layouts/
│   │   ├── auth-layout/             # Layout centrado para pantallas de auth
│   │   └── main-layout/             # Sidebar + topbar + contenido principal
│   ├── app.component.ts
│   ├── app.config.ts                # Providers (router, httpClient, interceptors)
│   └── app.routes.ts                # Enrutamiento principal con lazy loading
├── environments/
│   ├── environment.ts               # Desarrollo (localhost:5000)
│   └── environment.production.ts    # Producción
├── styles/
│   ├── _variables.scss              # Paleta de colores, tipografía, espaciado
│   ├── _mixins.scss                 # Mixins reutilizables (inputs, botones, responsive)
│   └── _reset.scss                  # Reset CSS
├── styles.scss                      # Estilos globales
├── main.ts                          # Bootstrap de la aplicación
└── index.html
```

## Patrones y convenciones

| Aspecto | Decisión |
|---|---|
| Componentes | Standalone, `ChangeDetectionStrategy.OnPush`, `inject()` |
| Control flow | `@if`, `@for`, `@switch` (Angular 19+) |
| Formularios | Typed Reactive Forms (`FormControl<string>`) |
| Estado local | Signals (`signal()`, `computed()`) |
| Guards | Funcionales (`CanActivateFn`) |
| Interceptors | Funcionales (`HttpInterceptorFn`) |
| Routing | Lazy loading por feature (`loadComponent` / `loadChildren`) |
| Autenticación | Token en `sessionStorage`, guard de ruta, interceptor Bearer |
| Estilos | SCSS con variables, mixins, nomenclatura BEM |
| Tipado | `strict: true`, sin `any` |

## Enrutamiento

| Ruta | Componente | Guard |
|---|---|---|
| `/auth/login` | LoginComponent | guestGuard |
| `/auth/forgot-password` | ForgotPasswordComponent | guestGuard |
| `/dashboard` | DashboardComponent | authGuard |
| `/**` | Redirige a `/auth/login` | — |

## Path aliases (tsconfig)

```
@core/*     → src/app/core/*
@shared/*   → src/app/shared/*
@features/* → src/app/features/*
@layouts/*  → src/app/layouts/*
@env/*      → src/environments/*
```

## Funcionalidades actuales

- **Login**: formulario con email y contraseña, botones aceptar/cancelar, link a recuperar contraseña.
- **Recuperar contraseña**: formulario con email y mensaje de confirmación.
- **Dashboard**: vista con cards de resumen (Clientes, Oportunidades, Tareas, Ventas).
- **Layout auth**: diseño centrado minimalista con branding.
- **Layout principal**: sidebar con navegación, topbar con info del usuario.

## Build de producción

```bash
ng build --configuration production
```

Los artefactos se generan en `dist/crm-app/`.
