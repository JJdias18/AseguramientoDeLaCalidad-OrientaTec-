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

# 4. Migraciones y seeds
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
  `EstandaresdeCodigo.md`; el brief de diseño en `DESIGN_BRIEF.md`. `CLAUDE.md` carga
  esos mismos documentos para el asistente de programación (ver
  [Cómo se construyó](#cómo-se-construyó)).

## Pruebas y calidad

- 214 pruebas automatizadas en verde: 108 en `server` (Jest + Supertest) y 106 en
  `client` (Jest + Testing Library). Cobertura de líneas cercana al 90 % en ambos
  paquetes (`npm run test:cobertura`).
- 64 casos de prueba documentados y trazados a las historias de usuario (CP-001 a
  CP-064) en `docs/trazabilidad.md`.
- Colección Postman versionada en `docs/postman_collection.json`, con 36 peticiones
  con aserciones.
- Evidencia de verificación y validación bajo ISO/IEC 25010 en
  `docs/verificacion-y-validacion.md`.

## Cómo se construyó

Desarrollé el código de este repositorio con **Claude Code** como asistente de
programación, dentro de un proceso controlado:

- **Especificación primero.** A partir de las historias de usuario (HU-01 a HU-07)
  definí un plan lineal por fases en [`PLAN.md`](PLAN.md): modelo de datos, contrato de
  la API, especificación del motor RIASEC y un registro de 38 decisiones técnicas con
  su justificación.
- **Un solo estándar para personas y asistente.** [`CLAUDE.md`](CLAUDE.md) carga
  [`EstandaresdeCodigo.md`](EstandaresdeCodigo.md) y `PLAN.md`, así que cada sesión
  respeta el mismo stack, las mismas convenciones y la misma Definition of Done que el
  resto del equipo.
- **Puertas de calidad.** Cada fase terminaba con lint y pruebas en verde, su checklist
  marcado y una pausa de revisión antes de avanzar a la siguiente.
- **Mi rol.** Definí el alcance y la arquitectura, tomé las decisiones técnicas, revisé
  cada cambio antes de integrarlo y validé el resultado con la batería de pruebas
  descrita arriba.
