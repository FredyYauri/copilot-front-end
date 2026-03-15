# Documento de Arquitectura — CRM System

> **Versión:** 1.0  
> **Fecha:** 14 de marzo de 2026  
> **Estado:** En desarrollo  

---

## 1. Visión General

El sistema CRM (Customer Relationship Management) es una aplicación web empresarial para la gestión de relaciones con clientes. La arquitectura se basa en una separación clara entre frontend y backend con comunicación vía API REST.

### Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Angular (standalone, signals) | 19+ |
| Backend | .NET (Clean Architecture) | 9+ |
| Base de datos | SQL Server | 2019+ |
| Acceso a datos | Dapper + Stored Procedures | 2.1+ |
| Autenticación | JWT Bearer | - |
| Mediator/CQRS | MediatR | 12+ |
| Validación | FluentValidation | 11+ |
| Logging | Serilog (structured) | - |
| Documentación API | Swagger / OpenAPI | - |

### Diagrama de Alto Nivel

```
┌─────────────────┐       HTTP/REST       ┌─────────────────────────────────┐
│                 │  ◄──────────────────► │                                 │
│  Angular 19+    │    JSON + JWT Bearer   │  .NET 9+ Web API               │
│  (SPA)          │                        │  (Clean Architecture)          │
│                 │                        │                                 │
│  localhost:4200  │                       │  localhost:5000                  │
└─────────────────┘                        └──────────┬──────────────────────┘
                                                      │
                                                      │ Dapper + SPs
                                                      ▼
                                           ┌─────────────────────┐
                                           │   SQL Server         │
                                           │   CRM_DB             │
                                           └─────────────────────┘
```

---

## 2. Principios de Diseño

- **SOLID** — Responsabilidad única, abierto/cerrado, sustitución de Liskov, segregación de interfaces, inversión de dependencias.
- **DRY** — No repetir lógica; abstraer lo común.
- **KISS** — La solución más simple que cumpla los requisitos.
- **YAGNI** — No diseñar para requisitos futuros hipotéticos.
- **Separation of Concerns** — Cada capa y módulo tiene una responsabilidad clara.
- **Fail Fast** — Detectar y reportar errores lo antes posible.

---

## 3. Proyecto Backend — CRM.WebAPI

### 3.1 Arquitectura: Clean Architecture

```
┌────────────────────────────────────────────────────────┐
│                    WebAPI Layer                         │
│  Controllers, Middlewares, Swagger, Program.cs          │
├────────────────────────────────────────────────────────┤
│                 Application Layer                       │
│  Commands, Queries (CQRS), Validators, DTOs, Behaviors │
├────────────────────────────────────────────────────────┤
│                Infrastructure Layer                     │
│  Dapper Repos, SQL Connection, JWT, BCrypt              │
├────────────────────────────────────────────────────────┤
│                   Domain Layer                          │
│  Entities, Interfaces, Enums, Exceptions                │
└────────────────────────────────────────────────────────┘
```

**Regla de dependencia:** Las capas internas nunca conocen a las externas. Domain no depende de nada. Application depende solo de Domain. Infrastructure implementa las abstracciones. WebAPI conecta todo.

### 3.2 Estructura de Carpetas

```
copilot-back-end/
├── CRM.sln
├── database/
│   ├── 01-create-database.sql
│   ├── 02-create-tables.sql
│   └── 03-create-stored-procedures.sql
└── src/
    ├── CRM.Domain/
    │   ├── Entities/
    │   │   ├── AuditableEntity.cs       # Base class con campos de auditoría
    │   │   └── User.cs                  # Entidad de dominio rica
    │   ├── Enums/
    │   │   └── UserRole.cs              # Roles de usuario (User, Admin, Manager)
    │   ├── Exceptions/
    │   │   ├── DomainException.cs       # Excepciones de reglas de negocio
    │   │   └── NotFoundException.cs     # Entidad no encontrada
    │   └── Interfaces/
    │       ├── IDbConnectionFactory.cs  # Abstracción de conexión a BD
    │       └── IUserRepository.cs       # Contrato de repositorio
    │
    ├── CRM.Application/
    │   ├── Common/
    │   │   ├── Behaviors/
    │   │   │   ├── LoggingBehavior.cs   # Pipeline: logging automático
    │   │   │   └── ValidationBehavior.cs # Pipeline: validación con FluentValidation
    │   │   ├── Interfaces/
    │   │   │   ├── IJwtTokenGenerator.cs # Generación de tokens JWT
    │   │   │   └── IPasswordHasher.cs    # Hashing de contraseñas
    │   │   └── Models/
    │   │       └── Result.cs             # Result Pattern para errores de negocio
    │   ├── DTOs/
    │   │   └── Auth/
    │   │       ├── ForgotPasswordRequestDto.cs
    │   │       ├── LoginRequestDto.cs
    │   │       ├── LoginResponseDto.cs
    │   │       └── UserDto.cs
    │   ├── Features/
    │   │   └── Auth/
    │   │       └── Commands/
    │   │           ├── ForgotPassword/
    │   │           │   ├── ForgotPasswordCommand.cs
    │   │           │   ├── ForgotPasswordCommandHandler.cs
    │   │           │   └── ForgotPasswordCommandValidator.cs
    │   │           └── Login/
    │   │               ├── LoginCommand.cs
    │   │               ├── LoginCommandHandler.cs
    │   │               └── LoginCommandValidator.cs
    │   └── DependencyInjection.cs
    │
    ├── CRM.Infrastructure/
    │   ├── Identity/
    │   │   ├── BcryptPasswordHasher.cs  # BCrypt para hashing seguro
    │   │   └── JwtTokenGenerator.cs     # Generación JWT con claims
    │   ├── Persistence/
    │   │   ├── SqlConnectionFactory.cs  # Crea SqlConnection desde config
    │   │   └── Repositories/
    │   │       └── UserRepository.cs    # Dapper + Stored Procedures
    │   ├── Settings/
    │   │   ├── DatabaseSettings.cs
    │   │   └── JwtSettings.cs
    │   └── DependencyInjection.cs
    │
    └── CRM.WebAPI/
        ├── Controllers/
        │   └── AuthController.cs        # Endpoints de autenticación
        ├── Extensions/
        │   └── SwaggerExtensions.cs     # Configuración de Swagger/OpenAPI
        ├── Middlewares/
        │   └── GlobalExceptionMiddleware.cs # Manejo global de errores (RFC 7807)
        ├── Properties/
        │   └── launchSettings.json
        ├── appsettings.json
        ├── appsettings.Development.json
        └── Program.cs                   # Composition root
```

### 3.3 Flujo de una Request (CQRS)

```
HTTP Request
    │
    ▼
[AuthController]  ──────►  [MediatR Pipeline]
                                │
                                ├── LoggingBehavior (log entrada/salida)
                                ├── ValidationBehavior (FluentValidation)
                                │
                                ▼
                          [CommandHandler]
                                │
                                ├── IUserRepository (via Dapper)
                                ├── IPasswordHasher (BCrypt)
                                └── IJwtTokenGenerator
                                │
                                ▼
                          [SQL Server via Stored Procedures]
```

### 3.4 API Endpoints

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Autenticación de usuario | No |
| POST | `/api/auth/forgot-password` | Solicitar recuperación de contraseña | No |

#### POST /api/auth/login

**Request:**
```json
{
  "email": "admin@crm.com",
  "password": "Admin@123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64string...",
  "user": {
    "id": "guid-string",
    "email": "admin@crm.com",
    "firstName": "Admin",
    "lastName": "Sistema",
    "role": "Admin"
  }
}
```

**Response 401:**
```json
{
  "title": "Authentication failed",
  "detail": "Credenciales incorrectas.",
  "status": 401
}
```

#### POST /api/auth/forgot-password

**Request:**
```json
{
  "email": "user@crm.com"
}
```

**Response 200:**
```json
true
```

### 3.5 Seguridad

- **Autenticación:** JWT Bearer tokens con expiración configurable (default: 60 min).
- **Hashing:** BCrypt con work factor 12 para contraseñas.
- **CORS:** Configuración restrictiva — solo `http://localhost:4200` en desarrollo.
- **Validación:** FluentValidation en pipeline MediatR antes de cada handler.
- **Error handling:** Middleware global que retorna `ProblemDetails` (RFC 7807) sin exponer stack traces.
- **Anti-enumeración:** El endpoint `forgot-password` siempre retorna `true` independientemente de si el email existe.

### 3.6 Acceso a Datos

- **Dapper** como micro-ORM para invocación de stored procedures.
- **Stored Procedures** para todas las operaciones de datos (Insert, Update, Select, Soft Delete).
- **SqlConnectionFactory** inyectable que crea conexiones desde la configuración.
- **Soft Delete** — los registros nunca se eliminan físicamente; se marca `IsDeleted = 1`.
- **Auditoría** — todos los registros tienen `CreatedAt`, `CreatedBy`, `LastModifiedAt`, `LastModifiedBy`.

### 3.7 Base de Datos — Tablas

| Tabla | Descripción |
|---|---|
| `Users` | Cuentas de usuario con autenticación y roles |
| `RefreshTokens` | Tokens de refresco para gestión de sesiones JWT |

### 3.8 Stored Procedures

| SP | Descripción |
|---|---|
| `sp_Users_GetById` | Obtener usuario por ID |
| `sp_Users_GetByEmail` | Obtener usuario por email |
| `sp_Users_ExistsByEmail` | Verificar si existe un email |
| `sp_Users_Insert` | Crear nuevo usuario |
| `sp_Users_Update` | Actualizar perfil de usuario |
| `sp_Users_UpdatePasswordHash` | Actualizar contraseña |
| `sp_Users_SoftDelete` | Eliminación lógica |

---

## 4. Proyecto Frontend — Angular CRM

### 4.1 Arquitectura

El frontend sigue una arquitectura basada en features con lazy loading, standalone components y Angular Signals para reactividad.

```
┌─────────────────────────────────────────────────┐
│                   App Shell                      │
│  app.component → app.routes → Layouts            │
├─────────────────────────────────────────────────┤
│  Layouts Layer                                   │
│  AuthLayout (login flow) │ MainLayout (app flow) │
├─────────────────────────────────────────────────┤
│  Features (lazy loaded per route)                │
│  Auth │ Dashboard │ (futuras features)           │
├─────────────────────────────────────────────────┤
│  Core (singleton services, guards, interceptors) │
├─────────────────────────────────────────────────┤
│  Shared (componentes reutilizables, pipes, etc.) │
└─────────────────────────────────────────────────┘
```

### 4.2 Estructura de Carpetas

```
copilot-front-end/
├── angular.json
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts
    ├── index.html
    ├── styles.scss
    ├── environments/
    │   ├── environment.ts            # apiUrl: http://localhost:5000/api
    │   └── environment.production.ts # apiUrl: /api
    ├── styles/
    │   ├── _variables.scss           # Variables SCSS globales
    │   ├── _mixins.scss              # Mixins reutilizables
    │   └── _reset.scss               # CSS reset
    └── app/
        ├── app.component.ts          # Root component
        ├── app.component.html
        ├── app.config.ts             # provideRouter, provideHttpClient, interceptors
        ├── app.routes.ts             # Rutas raíz con lazy loading
        ├── core/
        │   ├── guards/
        │   │   └── auth.guard.ts     # authGuard (redirige si no autenticado)
        │   │                          # guestGuard (redirige si ya autenticado)
        │   ├── interceptors/
        │   │   ├── auth.interceptor.ts   # Agrega Bearer token a requests
        │   │   └── error.interceptor.ts  # Maneja 401 → redirige a login
        │   ├── models/
        │   │   ├── tokens.ts          # InjectionToken para API_URL
        │   │   └── user.model.ts      # Interfaces: User, LoginRequest, etc.
        │   └── services/
        │       └── auth.service.ts    # Servicio de autenticación con Signals
        ├── features/
        │   ├── auth/
        │   │   ├── auth.routes.ts
        │   │   └── pages/
        │   │       ├── login/
        │   │       │   ├── login.component.ts
        │   │       │   ├── login.component.html
        │   │       │   └── login.component.scss
        │   │       └── forgot-password/
        │   │           ├── forgot-password.component.ts
        │   │           ├── forgot-password.component.html
        │   │           └── forgot-password.component.scss
        │   └── dashboard/
        │       ├── dashboard.routes.ts
        │       └── pages/
        │           └── dashboard/
        │               ├── dashboard.component.ts
        │               ├── dashboard.component.html
        │               └── dashboard.component.scss
        └── layouts/
            ├── auth-layout/
            │   ├── auth-layout.component.ts
            │   ├── auth-layout.component.html
            │   └── auth-layout.component.scss
            └── main-layout/
                ├── main-layout.component.ts
                ├── main-layout.component.html
                └── main-layout.component.scss
```

### 4.3 Patrones y Convenciones Angular

| Aspecto | Convención |
|---|---|
| Componentes | Standalone + OnPush + templateUrl (archivo `.html` separado) |
| Reactividad | Angular Signals (`signal()`, `computed()`, `toSignal()`) |
| Control flow | `@if`, `@for`, `@switch`, `@defer` (nuevo syntax) |
| Inyección | `inject()` function (nunca constructor injection) |
| Formularios | Reactive Forms tipados (`FormGroup<T>`) |
| Routing | Lazy loading por feature con `loadComponent` / `loadChildren` |
| Interceptors | Funcionales (`HttpInterceptorFn`) |
| Guards | Funcionales (`CanActivateFn`) |
| Estilos | SCSS con BEM naming, encapsulación Emulated |
| Tipado | `strict: true`, nunca `any` |

### 4.4 Flujo de Autenticación

```
                        ┌─────────┐
                        │  Login  │
                        │  Page   │
                        └────┬────┘
                             │ onSubmit()
                             ▼
                      ┌──────────────┐
                      │ AuthService  │
                      │ .login()     │
                      └──────┬───────┘
                             │ POST /api/auth/login
                             ▼
                    ┌────────────────────┐
                    │  Backend API       │
                    │  AuthController    │
                    └────────┬───────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ Response: accessToken +      │
              │           refreshToken +     │
              │           user data          │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ AuthService stores:          │
              │ - token signal               │
              │ - currentUser signal         │
              │ - sessionStorage             │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ Router navigates to          │
              │ /dashboard                   │
              └──────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ authInterceptor adds         │
              │ Bearer token to all requests │
              └──────────────────────────────┘
```

### 4.5 Gestión de Estado

| Scope | Mecanismo |
|---|---|
| Estado local de componente | `signal()`, `computed()` |
| Estado global de sesión | `AuthService` con signals (`currentUser`, `token`, `isAuthenticated`) |
| Persistencia de sesión | `sessionStorage` (token + user serializado) |
| Estado compartido complejo | NgRx Signal Store (cuando se requiera) |

---

## 5. Comunicación Frontend ↔ Backend

| Aspecto | Detalle |
|---|---|
| Protocolo | HTTP/REST con JSON |
| Base URL (dev) | `http://localhost:5000/api` |
| Autenticación | JWT Bearer en header `Authorization` |
| Error handling | Frontend interceptor captura 401 → limpia sesión → redirige a login |
| CORS | Backend permite `http://localhost:4200` en desarrollo |
| Validación | Doble: FluentValidation en backend + Reactive Forms en frontend |

---

## 6. Configuración de Desarrollo

### Backend

```bash
# Ejecutar el API
cd copilot-back-end
dotnet run --project src/CRM.WebAPI

# O con hot reload
dotnet watch --project src/CRM.WebAPI
```

**URL:** `http://localhost:5000`  
**Swagger UI:** `http://localhost:5000` (redirige automáticamente)

### Frontend

```bash
cd copilot-front-end
npm install
ng serve
```

**URL:** `http://localhost:4200`

### Base de Datos

Ejecutar los scripts SQL en orden sobre SQL Server:
1. `database/01-create-database.sql` — Crea la base de datos `CRM_DB`
2. `database/02-create-tables.sql` — Crea tablas y usuario admin seed
3. `database/03-create-stored-procedures.sql` — Crea los stored procedures

**Usuario seed:** `admin@crm.com` / `Admin@123`

---

## 7. Decisiones Arquitectónicas (ADRs)

### ADR-001: Clean Architecture para el Backend
- **Contexto:** Se necesita una estructura mantenible y testeable.
- **Decisión:** Clean Architecture con 4 capas (Domain, Application, Infrastructure, WebAPI).
- **Justificación:** Separación clara de responsabilidades, facilita testing unitario y cambio de infraestructura sin afectar lógica de negocio.

### ADR-002: Dapper + Stored Procedures
- **Contexto:** Acceso a datos en SQL Server.
- **Decisión:** Dapper como micro-ORM invocando stored procedures.
- **Justificación:** Mejor rendimiento que EF Core para lecturas, control total sobre SQL, stored procedures encapsulan lógica de datos en la BD.

### ADR-003: CQRS con MediatR
- **Contexto:** Desacoplar controllers de lógica de negocio.
- **Decisión:** Patrón CQRS con MediatR como mediador in-process.
- **Justificación:** Controllers delgados, pipeline behaviors para cross-cutting concerns (validación, logging), un handler por caso de uso.

### ADR-004: Angular Signals sobre RxJS
- **Contexto:** Manejo de estado reactivo en el frontend.
- **Decisión:** Usar Angular Signals como mecanismo principal de reactividad.
- **Justificación:** API más simple que RxJS para estado sincrónico, mejor integración con OnPush change detection, menos boilerplate.

### ADR-005: Templates HTML externos
- **Contexto:** Organización del código de componentes Angular.
- **Decisión:** Siempre usar `templateUrl` con archivo `.html` separado, nunca `template` inline.
- **Justificación:** Mejor separación de concerns, mejor soporte de editores/IDE para HTML, archivos `.ts` más limpios y enfocados en lógica.

### ADR-006: JWT para autenticación
- **Contexto:** Autenticación de SPA contra API REST.
- **Decisión:** JWT Bearer tokens con BCrypt para hashing.
- **Justificación:** Stateless authentication ideal para SPA, tokens portables, BCrypt con work factor 12 para resistencia a ataques de fuerza bruta.

---

## 8. Roadmap de Features

| Feature | Estado | Prioridad |
|---|---|---|
| Autenticación (login/logout) | Implementado | Alta |
| Recuperación de contraseña | Implementado (sin email service aún) | Alta |
| Dashboard | Implementado (vista estática) | Media |
| Gestión de clientes (CRUD) | Pendiente | Alta |
| Gestión de oportunidades | Pendiente | Media |
| Gestión de tareas | Pendiente | Media |
| Reportes de ventas | Pendiente | Baja |
| Refresh token rotation | Pendiente | Alta |
| Roles y permisos | Pendiente (estructura lista) | Media |
