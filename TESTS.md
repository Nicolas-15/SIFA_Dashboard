# Tests — SIFA Dashboard

## Cómo ejecutar

```bash
# Una vez (CI)
npm test

# En modo watch (desarrollo)
npm run test:watch
```

## Archivos de test

| Archivo | Descripción | Tests |
|---|---|---|
| `tests/utils/pushNotifications.test.js` | Sistema de notificaciones push | 14 |
| `tests/services/user.service.test.js` | Servicio CRUD de usuarios (llamadas HTTP) | 12 |
| `tests/core/useUsers.test.js` | Hook useUsers con lógica de negocio | 24 |
| **Total** | | **50** |

---

## `tests/utils/pushNotifications.test.js`

Mockea `pushNotifications.service` (getAllDevices, sendSelectPush). No requiere conexión a backend ni Firebase.

### `extractDeviceList` (6 tests)

Prueba la función auxiliar que normaliza la respuesta del endpoint `/devices`:

- **devuelve el arreglo tal cual si la API responde con lista plana** — sin transformación.
- **extrae .content cuando la API responde con paginación** — soporta `{ content: [...], totalPages, ... }`.
- **retorna [] si la API responde null / undefined / objeto sin .content** — casos borde.
- **retorna [] si la paginación viene vacía** — `{ content: [] }`.

### `sendPushToEmail` (8 tests)

Prueba la función principal que envía notificación push a un email específico:

- **busca dispositivo por email (case-insensitive)** — encuentra `Fiscalizador@Test.Cl` con `fiscalizador@test.cl`.
- **usa título por defecto "Notificación SIFA"** — cuando no se provee título.
- **lanza DEVICE_NOT_FOUND** — si no hay dispositivo con ese email o la lista está vacía.
- **funciona con respuesta paginada** — `getAllDevices` puede devolver `{ content: [...] }`.
- **recorta espacios alrededor del email** — tolera `"  user@test.cl  "`.
- **propaga errores de red/FCM** — tanto de `getAllDevices` como de `sendSelectPush`.

---

## `tests/services/user.service.test.js`

Mockea `@/services/api` (apiFetch). Verifica que cada función del servicio construya bien la URL, método HTTP y body. Sin conexión real al backend.

### `getUsers` (4 tests)

| Test | Qué verifica |
|---|---|
| calls apiFetch with default page and size | `GET /auth/api/v1/users?page=0&size=10` |
| uses custom page and size from params | `?page=2&size=25` |
| returns the raw apiFetch response | la respuesta se pasa sin transformar |
| propagates errors from apiFetch | el error se relanza |

### `getUsersFiscalizadores` (2 tests)

- endpoint correcto: `GET auth/api/v1/users/fiscalizadores`
- devuelve la lista de fiscalizadores

### `createUser` (2 tests)

- envía `POST /auth/api/v1/users` con JSON body
- retorna el usuario creado

### `revokeUser` (1 test)

- envía `DELETE /auth/api/v1/users?rut=...`

### `activateUser` (1 test)

- envía `PATCH /auth/api/v1/users/{rut}/activate`

### `updateUserRole` (1 test)

- envía `PATCH /auth/api/v1/users/{rut}/role` con `{ role: ... }`

### `updateUser` (1 test)

- envía `PUT /auth/api/v1/users/{rut}` con JSON body

### Otros (2 tests)

- los tests de `getUsersFiscalizadores` ya contados arriba.

---

## `tests/core/useUsers.test.js`

Mockea `@/services/user.service` (todo el módulo) y `@/core/AuthContext`. Usa `renderHook` de `@testing-library/react`. Verifica la lógica de negocio: normalización de datos, transformación de RUT, mapeo de roles, control de estado.

### `fetchUsers (initial load)` — 7 tests

| Test | Qué verifica |
|---|---|
| fetches users on mount | llama `getUsers({ page: 0, size: 10 })` al montar |
| maps active user fields correctly | `name`, `lastname`, `rut`, `email`, `phone`, `status`, `role` |
| maps ADMIN role | `USER_ADMIN` → `Administrador` |
| maps SUPERVISOR role | `USER_SUPERVISOR` → `Supervisor` |
| maps USER_APP role | `USER_APP` → `Fiscalizador` |
| detects revoked user | `active: false` → `status: "revoked"` |
| sets error state on reject | `error: true`, `users: []` |
| sets pagination fields | `totalPages`, `totalElements`, `page`, `first`, `last` |

### `createUser` — 4 tests

| Test | Qué verifica |
|---|---|
| formatea RUT y mapea rol USER_JPL por defecto | `"12.345.678-9"` → `rut: "12345678"`, `dv: "9"`, `role: "USER_JPL"`, teléfono con prefijo `+569` |
| mapea role ADMIN → USER_ADMIN | según `SYSTEM_ROLES.ADMIN` |
| mapea role SUPERVISOR → USER_SUPERVISOR | según `SYSTEM_ROLES.SUPERVISOR` |
| mapea role USER_APP → USER_APP | según `SYSTEM_ROLES.USER_APP` |
| refetches page 0 después de crear | llama `getUsers({ page: 0 })` al terminar |

### `updateUser` — 5 tests

| Test | Qué verifica |
|---|---|
| llama updateUser con RUT limpio y campos mapeados | `lastName` (camelCase), teléfono con `+569` |
| incluye password en payload si se provee | `password: "newpass123"` |
| llama updateUserRole si cambió el rol | `USER_DEFAULT` → `USER_ADMIN` |
| NO llama updateUserRole si el rol es el mismo | solo `updateUser`, no `updateUserRole` |
| refetches después de actualizar | llama `getUsers` again |

### `toggleUserStatus` — 3 tests

| Test | Qué verifica |
|---|---|
| active → `revokeUser(rut)` | desactivación |
| revoked → `activateUser(rut)` | reactivación |
| refetches después del toggle | llama `getUsers` again |

### `goToPage` — 1 test

- cambia `page` a 3 y dispara `getUsers({ page: 3, size: 10 })`

### `fetchUsersFiscalizadores` — 2 tests

| Test | Qué verifica |
|---|---|
| fetch y normaliza lista de fiscalizadores | llama `getUsersFiscalizadores()`, normaliza RUT y campos |
| maneja error del fetch | `error: true`, `users: []` |
