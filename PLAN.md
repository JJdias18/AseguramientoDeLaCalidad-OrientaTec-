# PLAN.md — Plan lineal de construcción · Brújula Vocacional

> Ejecutar en orden. Cada fase termina con lint + pruebas en verde, checklist marcado
> y una pausa para revisión. Referencias `HU-0X` = historias del documento de historias.
> Fechas = cronograma del primer entregable (referencia de plazos del curso).

---

## Decisiones tomadas (registro)

| # | Decisión | Elección | Razón |
|---|----------|----------|-------|
| 1 | Migraciones | **node-pg-migrate** con SQL crudo + driver `pg` | El estándar del proyecto exige “SQL estándar”; sin ORM |
| 2 | Búsqueda sin acentos (HU-04) | Extensión **unaccent** de PostgreSQL, habilitada por migración | Única solución robusta y testeable en la capa de datos |
| 3 | Eliminar reactivos (HU-07) | **Soft delete** (`is_active = false`) | Preserva respuestas históricas (`answers`) con FK a `questions` |
| 4 | Generación de PDF (HU-06) | **pdfkit** server-side | Liviano, sin navegador headless, gratis |
| 5 | Reintentos de cuestionario | Permitidos; `GET /profile` devuelve el perfil **más reciente** | Evita ambigüedad en HU-03 y HU-06 |
| 6 | Sesión | JWT con expiración 24 h, sin refresh tokens | Suficiente para el alcance del curso |
| 7 | Orquestación monorepo | **npm workspaces** (root privado) | Un solo `npm install`; los scripts raíz corren lint/test en ambos paquetes |
| 8 | Versión ESLint | **8.57.1 fija** + config `.eslintrc` (legacy) | `eslint-config-airbnb(-base)` no soporta flat config; ESLint 9 rompería Airbnb |
| 9 | Tests del cliente | **Jest + jsdom + Testing Library + babel-jest** | El estándar del proyecto exige Jest (no Vitest) pese a Vite ESM |
| 10 | Push en Fase 0 | **Solo git local** (`main` + `develop`), sin remoto | No hay remoto/credenciales configurados localmente; el push se hará cuando el equipo lo indique |
| 11 | Scaffold del cliente | **Manual con React fijado en 18.3** (sin `npm create vite`) | La plantilla actual de Vite trae React 19 + ESLint 9 flat, incompatibles con el stack fijo |
| 12 | Entregables de la Fase 1.5 (propuestas) | Previews en `docs/design/direcciones/` + propuesta en `docs/design/DIRECCIONES.md`; los 6 colores RIASEC de la dirección "Huella" validados para daltonismo (CVD ΔE adyacente ≥ 12) y todo texto verificado WCAG AA por cálculo | El brief exige comparación lado a lado y accesibilidad AA como DoD |
| 13 | JWT (HU-01) | Librería **jsonwebtoken** | Firmar/verificar tokens con expiración 24h (decisión #6); no había dependencia instalada aún |
| 14 | Ruteo del cliente (HU-01) | **react-router-dom v6** | Rutas públicas/protegidas (login, registro) y las que siguen en fases 3–8; no había dependencia instalada aún |
| 15 | `import.meta.env` bajo Jest (HU-01) | **babel-plugin-transform-vite-meta-env**, activo solo en `BABEL_ENV=test` | Vite resuelve `import.meta.env` nativamente; Jest usa Babel a CommonJS y no lo soporta sin plugin (decisión #9: Jest, no Vitest) |
| 16 | Interacción en pruebas de componentes (HU-01) | **@testing-library/user-event** | Complemento estándar de Testing Library para simular clics/tecleo de forma realista; faltaba instalarlo |
| 17 | Validación de props en componentes (HU-01) | **prop-types** como dependencia directa del cliente | Airbnb ESLint exige `react/prop-types`; ya estaba disponible transitivamente vía `eslint-plugin-react` pero no declarada |
| 18 | ESLint `react/require-default-props` (HU-01) | Override a `{ functions: 'defaultArguments' }` | Airbnb asume `defaultProps`, deprecado en componentes función desde React 18.3; se acepta el valor por defecto en la desestructuración |
| 19 | ESLint `jsx-a11y/label-has-associated-control` (HU-01) | Override a `{ assert: 'htmlFor' }` | DESIGN.md fija el patrón `<label for>` + `<input id>` como hermanos (nunca label envolviendo el control); el default de la regla exige ambos (anidar y `htmlFor`) |
| 20 | CORS (HU-01, corrección) | Paquete **cors**, origen desde `CLIENT_ORIGIN` (fallback `http://localhost:5173`), validado con función (`callback(null, !origin \|\| origin === allowedOrigin)`) en vez de string estático | El cliente Vite (puerto 5173) no podía llamar al backend (puerto 3000); la validación por función deja el header ausente ante orígenes no permitidos, en vez de reflejar siempre el mismo valor |
| 21 | `GET /profile` (HU-02) | Se implementa ya en Fase 3 devolviendo el perfil **más reciente** (scores + holland + dominantes); **sin** recomendaciones de áreas | HU-02 exige "calcula el perfil y lo muestra": la pantalla "Mi huella" necesita leerlo tras el envío y al recargar. La afinidad con áreas (HU-03) queda para la Fase 4; no se adelanta |
| 22 | Formato de error con detalle (HU-02) | `AppError` gana un 4º parámetro opcional `details`; el middleware lo incluye como `{ error: { code, message, details } }` solo cuando existe | El envío incompleto debe indicar **cuáles** reactivos faltan (`details.missing`/`missingPositions`) sin romper el formato uniforme de error del proyecto |
| 23 | Explicación de afinidad (HU-03) | Se deriva del tipo con mayor **producto puntaje×peso** (no del dominante global del perfil), con desempate estable R-I-A-S-E-C → "Coincide con tu interés {interés}." | El escenario exige una explicación por área; el argmax de la contribución da un texto distinto y correcto para cada área (nombra el interés del estudiante que ESA área realmente premia) en vez de repetir el mismo dominante en todas |
| 24 | Respuesta sin perfil (HU-03) | `GET /recommendations` responde **200** con `{ hasProfile: false, recommendations: [] }` (no 404 ni 401) | El criterio pide que la falta de perfil "lleve al cuestionario, no sea un error de sesión"; un 200 con bandera explícita deja a la UI mostrar el estado vacío sin tratarlo como fallo |
| 25 | Drill-down a carreras (HU-03) | Cada área recomendada **embebe** sus carreras (`id`, `name`, `fieldOfWork`, `duration`) en la respuesta de `/recommendations` | El catálogo de carreras (`GET /careers`, búsqueda/filtros) es de la Fase 5; embeber las carreras del área cubre el drill-down de HU-03 sin adelantar HU-04 |
| 26 | Parámetro `area` del catálogo (HU-04) | Es el **id numérico** de `areas`, validado como entero positivo (400 si no lo es) | Reusa el modelo existente (`areas.id`) en vez de crear un enum de áreas nuevo |
| 27 | Punto de tinta del área en el catálogo (HU-04) | Se deriva de la dimensión con mayor peso en `riasec_weights` reusando `scoringService.rankTypes` (mismo criterio de desempate R-I-A-S-E-C) | Evita duplicar la lógica de argmax que ya usa HU-03; ninguna columna nueva en `areas` |
| 28 | Chips de filtro por área (HU-04, frontend) | Se arman con las áreas presentes en la respuesta **sin filtros** de `GET /careers` (sin agregar un endpoint `GET /areas`) | El catálogo completo ya trae `area.id`/`area.name` por carrera; minimalismo: no crear un endpoint nuevo solo para poblar los chips |
| 29 | Botón "Comparar esta carrera" de la ficha (DESIGN.md §7.6) | Se **omite** hasta la Fase 6 (HU-05), cuando exista la funcionalidad de comparación | `EstandaresdeCodigo.md` prohíbe adelantar fases; un botón sin destino funcional confundiría al estudiante |
| 30 | Enlace "Comparar" en la nav (HU-05, frontend) | Se agrega junto a "Carreras" en la nav simple existente (logo + enlaces + avatar), **no** la tab bar móvil completa de 4 destinos que describe DESIGN.md §5 | Sigue el mismo patrón mínimo con el que se agregó "Carreras" en la Fase 5 (decisión #28); la tab bar móvil queda pendiente para cuando el resto de destinos (Cuestionario, Mi huella) la necesiten |
| 31 | Recomparar al cambiar una carrera (HU-05, frontend) | La comparación inicial requiere el botón "Comparar" (habilitado solo con dos carreras distintas); una vez mostrada, cambiar cualquiera de los dos selects vuelve a consultar `GET /careers/compare` de inmediato, sin nuevo clic | El criterio de HU-05 pide la acción explícita "elige Comparar" para la primera comparación (escenario 1) pero actualización inmediata al cambiar una carrera ya comparada (escenario 4); un único flag `intentado` distingue ambos casos sin duplicar lógica |
| 32 | `GET /profile/report` sin perfil (HU-06) | Responde **404 `PROFILE_NOT_FOUND`** (igual que `GET /profile`), no un 200 con bandera como `/recommendations` | El botón de descarga ya está deshabilitado en el frontend sin perfil (criterio de HU-06); a diferencia de `/recommendations`, esta ruta no alimenta un estado vacío de la UI, así que llegar sin perfil es un caso anómalo y no uno esperado |
| 33 | Fecha del reporte PDF (HU-06) | Es la **fecha de generación** del PDF (hoy), no la fecha en que se calculó el perfil | El criterio solo pide "fecha" sin especificar cuál; la fecha de generación es la que tiene sentido en un documento descargado en cualquier momento después del cuestionario |
| 34 | Carreras sugeridas del reporte (HU-06) | Se arman recorriendo las áreas de `getRecommendations` (ya ordenadas por afinidad) y tomando sus carreras ya embebidas, sin duplicar, hasta un tope de 6 | Reusa el mismo dato que ya arma HU-03 para el drill-down; evita una consulta o criterio de selección nuevo, y garantiza que el PDF coincida con "Mi huella" |
| 35 | Colores del PDF (HU-06) | `pdfReportService.js` define `COLOR_JADE`/`COLOR_TINTA`/`COLOR_MUSGO`/`COLOR_HAIRLINE` como constantes locales, con los mismos hex que `tokens.css` | El servidor no puede leer `tokens.css` (es un archivo del cliente); son los únicos valores de color fuera de `tokens.css` en todo el proyecto, y solo porque el documento se genera fuera del navegador |
| 36 | Jest del servidor en serie (HU-07) | `jest.config.cjs` fija `maxWorkers: 1` | Los tests de rutas pegan a una única BD real sin mocks; `adminQuestionRoutes.test.js` crea/desactiva reactivos activos y `questionnaireRoutes.test.js` exige exactamente 30 activos del seed. En paralelo (workers por defecto) ambos archivos pueden ejecutarse a la vez y pisarse; en serie el conteo queda determinista |
| 37 | Ruta de admin en el cliente (HU-07) | `AdminRoute` anidado dentro de `ProtectedRoute`: sin sesión redirige a login (como cualquier ruta protegida); con sesión pero sin rol admin muestra "Acceso denegado" con enlace a inicio, en vez de redirigir | DESIGN.md §7.8 pide ese mensaje específico para un estudiante que entra por URL directa; redirigir silenciosamente ocultaría por qué no puede entrar |
| 38 | Fixes P0/P1 del critique de diseño (post-Fase 8) | Se construye la **tab bar móvil** de DESIGN.md §5 (supersede la "nav simple" de la decisión #30; el admin suma un 5.º destino "Reactivos"), HomePage pasa a consultar `hasProfile` (reusa `GET /recommendations`), el modal recupera `margin: auto` (el reset global lo pisaba) + `aria-labelledby`, y la tabla admin se apila <720px con tipo "letra · nombre" y chip "Activo" | `/impeccable critique` (snapshot `.impeccable/critique/2026-07-04...client-src.md`, 28/40) encontró 2 P0 (header desbordado a 360px, home negando un perfil existente) y 2 P1 (modal en la esquina, tabla admin inusable en móvil); extensiones registradas en DESIGN.md §10 |

(Si alguien toma una decisión nueva, agregala a esta tabla.)

---

## A. Modelo de datos (PostgreSQL)

Tablas (snake_case, plural). Ajustar tipos según la migración, pero respetar la forma:

- **users** — `id`, `full_name`, `email` (único), `password_hash`, `role`
  (`student` | `admin`), `created_at`, `updated_at`.
- **questions** (reactivos) — `id`, `text`, `riasec_type` (`R|I|A|S|E|C`),
  `scale_min` (default 1), `scale_max` (default 5), `is_active` (bool, default true),
  `created_at`, `updated_at`. **El DELETE del admin pone `is_active = false`.**
- **attempts** (intentos de cuestionario) — `id`, `user_id` (FK), `status`
  (`in_progress` | `completed`), `started_at`, `completed_at`.
- **answers** (respuestas) — `id`, `attempt_id` (FK), `question_id` (FK), `value`
  (int, entre scale_min y scale_max), `created_at`. Único `(attempt_id, question_id)`.
- **profiles** — `id`, `user_id` (FK), `attempt_id` (FK), `scores` (jsonb: puntaje por
  tipo RIASEC), `holland_code` (p. ej. `"IAE"`), `created_at`.
- **areas** — `id`, `name`, `description`, `riasec_weights` (jsonb: peso 0–1 por tipo).
- **careers** — `id`, `area_id` (FK), `name`, `description`, `field_of_work`,
  `duration`, `profile_desc`, `created_at`.

**Seeds obligatorios:** ≥ **30 reactivos** (5 por cada tipo RIASEC), 5–6 **áreas** con su
vector de pesos, ≥ **20 carreras** repartidas entre las áreas, y **1 usuario admin** de
prueba. El contenido lo redacta el equipo.

## B. Motor RIASEC (especificación)

Módulo puro y muy testeado (`server/src/services/scoringService.js`,
`recommendationService.js`).

1. **Perfil:** por cada tipo RIASEC, sumar (o promediar) los `value` de los reactivos de
   ese tipo. Guardar el vector de 6 dimensiones en `profiles.scores`. `holland_code` =
   los 2–3 tipos con mayor puntaje, en orden.
2. **Afinidad con áreas:** similitud coseno entre el vector del estudiante y el
   `riasec_weights` de cada área → porcentaje 0–100 redondeado.
3. **Orden:** descendente por afinidad. **Desempate estable** por `name` ascendente, para
   que un mismo perfil dé **siempre el mismo orden** (criterio HU-03, escenario 4).
4. **Salida:** al menos las 3 áreas más afines, cada una con `%` y una explicación breve
   generada a partir del tipo dominante (“coincide con tu interés investigativo”).

## C. Contrato de API (Express, prefijo `/api/v1`)

**Auth** — `POST /auth/register`, `POST /auth/login` (→ JWT), `GET /auth/me`.
**Cuestionario** — `GET /questions` (solo activos), `POST /attempts` (inicia o retoma),
`GET /attempts/current`, `PATCH /attempts/:id/answers` (autosave por reactivo),
`POST /attempts/:id/submit` (calcula perfil).
**Perfil / recomendaciones** — `GET /profile` (el más reciente del usuario),
`GET /recommendations`, `GET /profile/report` (PDF).
**Carreras** — `GET /careers?search=&area=` (búsqueda con `unaccent(lower(...))`),
`GET /careers/:id`, `GET /careers/compare?a=&b=`.
**Admin** — `GET|POST|PUT|DELETE /admin/questions` (rol `admin`; DELETE = soft delete).

Errores con formato uniforme `{ error: { code, message } }`.
Cada fase de backend actualiza `/docs/postman_collection.json`.

---

## FASE 0 — Andamiaje y herramientas
Objetivo: repo listo para trabajar. (EDT 1.1 / 1.2 · cronograma: ya vencido — prioridad máxima)

- [x] Monorepo con `/client` (Vite + React) y `/server` (Express).
- [x] ESLint base Airbnb + Prettier + `.editorconfig` (2 espacios, comillas simples,
      punto y coma, 100 cols). Scripts `lint`, `format`, `test`.
- [x] Jest configurado en `/server` (y en `/client` para componentes clave).
- [x] `docker-compose.yml` con PostgreSQL + `.env.example`.
- [x] node-pg-migrate configurado; carpetas `migrations/` + `seeds/`.
- [x] README con pasos para levantar el proyecto. `.gitignore` correcto.
- [x] Ramas `main` y `develop` creadas.
- [x] Colección Postman vacía inicial en `/docs/postman_collection.json`.

**DoD:** `npm run lint` y `npm test` corren sin error (aunque no haya features aún).

## FASE 1 — Capa de datos
Objetivo: esquema + seeds. (EDT 1.2.2.1 · cronograma: diseño de modelo 19–20/6, vencido)

- [x] Migraciones para todas las tablas de la sección A + extensión `unaccent`.
- [x] Seeds: ≥ 30 reactivos (5 por tipo), áreas con pesos, ≥ 20 carreras, 1 admin.
- [x] Capa de acceso a datos (repositorios/queries) con manejo de errores.

**DoD:** `migrate` + `seed` dejan la BD poblada; smoke test de conexión pasa.

## FASE 1.5 — Dirección visual del frontend
Objetivo: identidad y prototipo aprobados antes de escribir React. (EDT 1.2.2.2)
Regido por **DESIGN_BRIEF.md**: leerlo completo antes de empezar.

- [x] Proponer **2–3 direcciones de arte** (concepto, paleta, tipografías, elemento
      firma) con una preview HTML de la pantalla de resultados en cada una.
      → `docs/design/DIRECCIONES.md` + `docs/design/direcciones/index.html`.
- [x] **PAUSA** — el equipo eligió la dirección **2 · "Huella"** (3/7). Se le corrió
      `/impeccable critique` (26/40, 3×P1 + 2×P2) y se corrigieron todos los
      hallazgos P1+P2+menores + polish antes de congelarla (ver
      `docs/design/DIRECCIONES.md`).
- [x] Con la dirección elegida: `DESIGN.md` (concepto, tokens, componentes,
      especificación por pantalla), `client/src/styles/tokens.css` y
      `docs/prototipo.html` navegable (8 pantallas + estados, consume tokens.css).
- [x] **PAUSA** — aprobación del equipo (3/7). Se habilita el frontend de las
      fases 2–8.

**DoD:** dirección aprobada por el equipo; tokens implementados; ningún valor visual
hardcodeado fuera de `tokens.css`.

## FASE 2 — Registro e inicio de sesión · HU-01 (Alta)
Cronograma: Módulo de Autenticación **27/6 – 4/7**.

- [x] `register` (bcrypt, valida correo único y contraseña ≥ 8 con letras y números).
- [x] `login` (JWT 24 h, **mensaje genérico** ante credenciales incorrectas).
- [x] Middleware de auth + de rol. `GET /auth/me`.
- [x] Frontend: pantallas de registro e inicio de sesión, contexto de auth, rutas
      protegidas, contraseña enmascarada, campos obligatorios.
- [x] **Pruebas** de los 5 escenarios de HU-01 (registro ok, correo repetido,
      contraseña débil, login ok, credenciales incorrectas).
- [x] Postman actualizado.

**Cerrada 3/7.** `npm run lint` y `npm test` en verde en `client` y `server`
(30 + 38 pruebas). Traza en `docs/trazabilidad.md`. Ver resumen de fase para detalle.

## FASE 3 — Cuestionario vocacional · HU-02 (Alta)
Cronograma: **5/7 – 12/7**.

- [x] `GET /questions` (solo activos), ciclo de `attempts`, `PATCH .../answers` con
      **autosave**.
- [x] `POST .../submit` → invoca el **motor de scoring** (sección B) y crea `profile`.
- [x] Bloqueo de envío si quedan reactivos sin responder.
- [x] **Retomar** desde el último reactivo respondido.
- [x] Frontend: instrucciones + total de preguntas, cuestionario (uno por uno o por
      bloques), barra de progreso, escala 1–5, reanudar avance.
- [x] **Pruebas** de los 4 escenarios de HU-02, con foco en el cálculo del perfil
      (unitarias del `scoringService`).
- [x] Postman actualizado.

**Cerrada 3/7.** `npm run lint` y `npm test` en verde en `client` y `server`
(57 + 61 pruebas). Motor `scoringService` puro con 17 unitarias (incluye casos borde:
respuestas iguales, empates RIASEC, extremos de la escala). Endpoints nuevos:
`GET /questions`, `POST /attempts`, `GET /attempts/current`, `PATCH /attempts/:id/answers`,
`POST /attempts/:id/submit`, `GET /profile`. Frontend: intro + cuestionario con huella de
progreso, escala 1–5 accesible, autosave, retomar y pantalla "Mi huella". Traza CP-016…CP-026
en `docs/trazabilidad.md` (26 casos, supera la meta de 25). Decisiones nuevas: #21, #22.

## FASE 4 — Recomendación de áreas · HU-03 (Alta)
Cronograma: **13/7 – 20/7**.

- [x] `recommendationService` con afinidad coseno + **orden determinista** (desempate
      por nombre).
- [x] `GET /recommendations`: ≥ 3 áreas con `%` y explicación; si no hay perfil,
      respuesta que lleva al cuestionario.
- [x] Frontend: vista de recomendaciones, drill-down a carreras del área.
- [x] **Pruebas** de los 4 escenarios de HU-03 (mínimo 3 áreas, sin perfil, explicación,
      resultados consistentes en dos consultas).
- [x] Postman actualizado.

**Cerrada 3/7.** `npm run lint` y `npm test` en verde en `client` y `server`
(62 + 78 pruebas). Motor `recommendationService` puro con 12 unitarias (coseno,
desempate por nombre, perfil plano, vector nulo, consistencia). Endpoint nuevo:
`GET /recommendations` (200 con `hasProfile`, nunca 401/500 sin perfil). Frontend:
sección "Tus áreas más afines" en "Mi huella" con la huella variante **eco** por área,
% de afinidad, explicación y drill-down a las carreras. Traza CP-027…CP-033 en
`docs/trazabilidad.md` (33 casos). Decisiones nuevas: #23, #24, #25.

## FASE 5 — Catálogo de carreras · HU-04 (Media)
Cronograma: Módulo de Información **21/7 – 28/7**.

- [x] `GET /careers` con búsqueda vía `unaccent` (insensible a mayúsculas/acentos) y
      filtro por área; `GET /careers/:id` (descripción, campo laboral, duración, perfil).
- [x] Frontend: listado, búsqueda, filtros, ficha; mensaje “No se encontraron carreras”.
- [x] **Pruebas** de los 4 escenarios de HU-04 (incluida búsqueda con acentos).
- [x] Postman actualizado.

**Cerrada 3/7.** `npm run lint` y `npm test` en verde en `client` y `server`
(75 + 86 pruebas). Endpoints nuevos: `GET /careers?search=&area=` (filtrado 100 % en
SQL con `unaccent(lower(...))`, nunca en JS) y `GET /careers/:id`; ambos requieren
sesión de estudiante como el resto de endpoints de consulta. Frontend: `/carreras`
(buscador con debounce, chips de área, cards con punto de tinta, esqueleto de carga,
estado "No se encontraron carreras" con acción para limpiar filtros) y `/carreras/:id`
(descripción, campo laboral, duración, perfil del estudiante, huella "eco" del área).
Verificado en navegador con Playwright (catálogo, búsqueda con y sin acentos, sin
resultados, filtro por área, ficha), sin errores de consola. Traza CP-034…CP-041 en
`docs/trazabilidad.md` (41 casos). Decisiones nuevas: #26, #27, #28, #29.

## FASE 6 — Comparar carreras · HU-05 (Media)
Cronograma: **29/7 – 5/8**.

- [x] Comparar exactamente 2 carreras **distintas** (rechazar si es la misma o falta una).
- [x] Frontend: selección A/B, tabla lado a lado (duración, área, campo laboral, perfil),
      recomparar al cambiar una.
- [x] **Pruebas** de los 4 escenarios de HU-05.
- [x] Postman actualizado.

**Cerrada 4/7.** `npm run lint` y `npm test` en verde en `client` y `server`
(82 + 93 pruebas). Endpoint nuevo: `GET /careers/compare?a=&b=` (400 `MISSING_CAREER` si
falta una, 400 `SAME_CAREER` si es la misma, 404 `CAREER_NOT_FOUND` si alguna no existe,
200 con ambas fichas completas si son válidas y distintas); reusa `findByIdWithArea` y el
mismo `toDetail` de la ficha (HU-04). Frontend: `/comparar` con dos selects poblados desde
el catálogo completo, botón "Comparar" (deshabilitado con ayuda si falta una carrera),
error inline bajo la Carrera B si se repite, tabla lado a lado que se apila por atributo en
&lt;720px, y recálculo inmediato al cambiar cualquiera de los dos selects una vez hecha la
primera comparación. Se integró el botón "Comparar esta carrera" pospuesto de la Fase 5
(pospone la Carrera A vía `?a=<id>`) y el enlace "Comparar" en la nav. Verificado en
navegador con Playwright (comparación válida, una sola carrera, misma carrera repetida,
cambio de carrera, entrada desde la ficha), sin errores de consola. Traza CP-042…CP-049 en
`docs/trazabilidad.md` (49 casos). Decisiones nuevas: #30, #31.

## FASE 7 — Descargar perfil en PDF · HU-06 (Baja)
- [x] `GET /profile/report` genera PDF con **pdfkit**: nombre, fecha, perfil, áreas
      afines y ≥ 3 carreras sugeridas.
- [x] Opción de descarga **deshabilitada** si no hay perfil.
- [x] **Pruebas** de los 3 escenarios de HU-06.
- [x] Postman actualizado.

**Cerrada 4/7.** `npm run lint` y `npm test` en verde en `client` y `server`
(85 + 97 pruebas). Endpoint nuevo: `GET /profile/report` (401 sin sesión, 404
`PROFILE_NOT_FOUND` sin perfil, 200 `application/pdf` con perfil). Módulo puro
`pdfReportService` (pdfkit, `compress: false`) que solo da formato: reusa
`questionnaireService.getRecommendations` (mismo `recommendationService` de HU-03)
para que el PDF coincida siempre con "Mi huella", sin recalcular afinidad aparte.
Frontend: botón "Descargar reporte (PDF)" en "Mi huella", deshabilitado con texto
de ayuda sin perfil, que descarga el blob autenticado vía `fetch` + `Authorization`
header (no un `<a href>` directo, porque la ruta requiere JWT) y dispara la
descarga con un enlace temporal. Traza CP-050…CP-054 en `docs/trazabilidad.md`
(54 casos). Decisiones nuevas: #32, #33, #34, #35.

## FASE 8 — Gestión del banco de reactivos · HU-07 (Baja)
- [x] CRUD de `questions` protegido por rol `admin`; texto y área obligatorios;
      **confirmación** antes de eliminar; acceso negado a estudiantes.
- [x] DELETE = **soft delete** (`is_active = false`); el reactivo deja de aparecer en el
      cuestionario pero las respuestas históricas se conservan.
- [x] Frontend: panel de admin (listar/crear/editar/desactivar).
- [x] **Pruebas** de los 5 escenarios de HU-07.
- [x] Postman actualizado.

**Cerrada 4/7.** `npm run lint` y `npm test` en verde en `client` y `server`
(100 + 108 pruebas). Endpoints nuevos, todos tras `requireAuth` + `requireRole('admin')`:
`GET/POST /admin/questions`, `PUT/DELETE /admin/questions/:id` (404 `QUESTION_NOT_FOUND`
sobre un id inexistente, 400 `INVALID_QUESTION_TEXT`/`INVALID_RIASEC_TYPE` si faltan datos,
403 `FORBIDDEN` para un estudiante). El DELETE reutiliza `questionRepository.deactivate`
de la Fase 1 (soft delete ya existía; ahora tiene endpoint). Frontend: `/admin/reactivos`
(tabla con estado activo/inactivo, formulario único para crear/editar, modal `<dialog>`
nativo de confirmación antes de desactivar con el texto de consecuencia de DESIGN.md §7.8,
toast de aviso tras cada acción) protegida por `AdminRoute` (anidada en `ProtectedRoute`:
sin sesión redirige a login, con sesión pero sin rol admin muestra "Acceso denegado").
Enlace "Gestión de reactivos" en el nav solo para `user.role === 'admin'` (UX; la
seguridad real es el `roleMiddleware` del servidor). Traza CP-055…CP-064 en
`docs/trazabilidad.md` (64 casos). Decisiones nuevas: #36, #37.

## FASE 9 — Calidad y cierre
Objetivo: cerrar el aseguramiento de calidad. (EDT 1.4 / 1.5 · cronograma: 6/8 – 30/8)

- [ ] Consolidar **≥ 25 casos de prueba** documentados en `/docs/casos-prueba.md`.
- [ ] **Casos de prueba de usabilidad** (EDT 1.4.1.2) en `/docs/casos-usabilidad.md`:
      tareas guiadas por HU + cuestionario de satisfacción (escala 1–5).
- [ ] **Protocolo de validación con usuarios**: plantilla para registrar las sesiones con
      **≥ 15 usuarios de prueba** del cuestionario (objetivo SMART 2) y medir la
      **satisfacción ≥ 80 %** (objetivo SMART 3). *El protocolo, la hoja de registro y el
      cálculo se preparan antes; la ejecución con personas la hace el equipo.*
- [ ] **Matriz de trazabilidad** caso ↔ criterio de aceptación ↔ HU en
      `/docs/trazabilidad.md`.
- [ ] Reporte de **métricas de calidad** en `/docs/metricas.md` (cobertura, % de casos
      aprobados, resultados de usabilidad) mapeadas a características **ISO/IEC 25010**
      (adecuación funcional, usabilidad, fiabilidad, seguridad).
- [ ] Manual de usuario e informe final.
- [ ] Despliegue en ambiente de pruebas (o instrucciones reproducibles para levantarlo).

---

## Orden de dependencias (resumen)

`Fase 0 → 1 → 1.5 (diseño) → 2 (HU-01) → 3 (HU-02) → 4 (HU-03) → 5 (HU-04) → 6 (HU-05)`
`HU-06 depende de HU-02 + HU-03 · HU-07 depende de HU-01 (rol admin) · Fase 9 al final.`

**Nota de calendario:** hoy (2/7) el cronograma del entregable marca el módulo de
autenticación en curso (vence 4/7). Las fases 0–2 deben ejecutarse de inmediato y en
bloque para recuperar el plan.
