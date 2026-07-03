# Brújula Vocacional

Sistema web de orientación vocacional (modelo RIASEC/Holland) para estudiantes próximos a
ingresar a la universidad. Proyecto de OrientaTec Costa Rica S.A. (empresa ficticia,
EdTech), desarrollado como caso de aseguramiento de la calidad de software bajo
ISO/IEC 25010.

## Arquitectura

Monorepo (npm workspaces) con arquitectura web cliente-servidor en tres capas:

```
/client   → React 18 + Vite (capa de presentación)
/server   → Node.js + Express + pg (capa de lógica/servicios + acceso a datos)
/docs     → especificación, casos de prueba, trazabilidad, métricas, colección Postman
PostgreSQL → capa de datos (docker-compose o instalación local)
```

El frontend consume el backend únicamente por la API REST (`/api/v1/...`).

## Requisitos

- Node.js ≥ 20 y npm ≥ 10.
- Docker con el plugin Compose v2 (`docker compose`) **o** PostgreSQL 16 local.
- Git.

## Cómo levantar el proyecto

```bash
# 1. Instalar dependencias de ambos paquetes (desde la raíz)
npm install

# 2. Configurar variables de entorno
cp .env.example server/.env
# Editar server/.env si hace falta (JWT_SECRET, credenciales de BD).

# 3. Levantar PostgreSQL
docker compose up -d db
# Nota: requiere el plugin Compose v2. Si solo tenés el engine de Docker,
# instalá docker-compose o usá un PostgreSQL local con las credenciales
# de .env.example.

# 4. Migraciones y seeds (disponibles a partir de la Fase 1)
npm run migrate --workspace server
npm run db:seed --workspace server

# 5. Correr en desarrollo
npm run dev:server   # API en http://localhost:3000
npm run dev:client   # Frontend en http://localhost:5173
```

## Scripts (desde la raíz)

| Script                 | Qué hace                                            |
| ---------------------- | --------------------------------------------------- |
| `npm run lint`         | ESLint (Airbnb + Prettier) en client y server       |
| `npm run format`       | Prettier en modo escritura                          |
| `npm run format:check` | Prettier en modo verificación                       |
| `npm test`             | Jest en client (jsdom) y server (node + Supertest)  |
| `npm run dev:client`   | Vite dev server                                     |
| `npm run dev:server`   | API Express con `node --watch`                      |

## Flujo de trabajo

- Ramas: `main` (estable), `develop` (integración), `feature/hu-0X-...` (una por
  historia de usuario). PR hacia `develop`.
- Commits estilo Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- El plan de construcción por fases vive en `PLAN.md`; el contexto permanente en
  `CLAUDE.md`; el brief de diseño en `DESIGN_BRIEF.md`.

## Pruebas y calidad

- Unitarias y de API con Jest + Supertest (`npm test`).
- Colección Postman versionada en `docs/postman_collection.json`, actualizada en cada
  fase de backend.
- Meta del proyecto: ≥ 25 casos de prueba documentados y trazados
  (`docs/trazabilidad.md`, a partir de la Fase 9).
