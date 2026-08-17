# Informe de Verificación y Validación

**Proyecto:** Brújula Vocacional — Sistema web de orientación vocacional (modelo RIASEC / Holland)
**Cliente:** OrientaTec Costa Rica S.A. (empresa ficticia, sector EdTech)
**Curso:** Aseguramiento de la Calidad del Software
**Marco de calidad:** ISO/IEC 25010
**Período cubierto:** 19 de junio – 10 de agosto de 2026
**Repositorio:** `AseguramientoDeLaCalidad-OrientaTec-` (monorepo `client` / `server` / `docs`)

---

## 1. Alcance del informe

Este documento reúne la evidencia de las actividades de verificación y validación que
hicimos mientras construíamos Brújula Vocacional. Usamos la distinción habitual:

- **Verificación** — ¿estamos construyendo el producto correctamente? Se pregunta si cada
  artefacto (requisito, diseño, código, base de datos) cumple con lo especificado y con los
  estándares que el propio equipo se puso.
- **Validación** — ¿estamos construyendo el producto correcto? Se pregunta si el sistema le
  sirve al usuario final, que en este caso es un estudiante de secundaria a punto de elegir
  carrera.

Para cada actividad indicamos qué hicimos, cuándo, cómo, con qué herramientas, qué salió y
qué hicimos con lo que salió.

La sección 8 declara aparte las técnicas que decidimos **no** aplicar, con el porqué. No es
un olvido: la consigna permite elegir las pertinentes al proyecto, y nos pareció más honesto
explicar las ausencias que disimularlas.

### 1.1. Cifras generales

| Indicador | Valor |
| --- | --- |
| Historias de usuario implementadas | 7 de 7 (HU-01 … HU-07) |
| Escenarios de aceptación cubiertos | 29 de 29 |
| Casos de prueba documentados y trazados | 64 (CP-001 … CP-064) |
| Meta que nos fijamos al inicio | ≥ 25 casos |
| Pruebas automatizadas | 214 (108 en `server`, 106 en `client`) |
| Archivos de prueba | 40 (16 en `server`, 24 en `client`) |
| Peticiones en la colección Postman | 36, en 7 carpetas, todas con aserciones |
| Pull requests revisados y fusionados | 4 |
| Ramas por historia de usuario | 7 |
| Migraciones de base de datos | 7 |
| Sesiones de prueba con usuarios externos | 7 sesiones, 18 participantes únicos |
| Satisfacción global de usuario | 4,45 / 5 (89 %); meta ≥ 80 % |
| Hallazgos registrados | 20 (18 cerrados, 2 aceptados) |

---

## 2. Cómo organizamos el aseguramiento de la calidad

Todo se apoya en tres documentos que viven versionados junto al código y funcionan como
línea base del proyecto:

1. **`EstandaresdeCodigo.md`** — arquitectura, estándar de código y de base de datos,
   política de seguridad y la Definition of Done.
2. **`PLAN.md`** — plan por fases, modelo de datos, contrato de la API y el registro de
   decisiones (38 entradas, cada una con su razón).
3. **`docs/trazabilidad.md`** — la matriz caso de prueba ↔ criterio de aceptación ↔ historia.

### 2.1. La Definition of Done como puerta de calidad

El mecanismo central de verificación no fue una actividad suelta sino una puerta
obligatoria al cierre de cada historia. Según `EstandaresdeCodigo.md` §7, una historia está
terminada cuando:

1. El código cumple el estándar y ESLint/Prettier pasan sin hallazgos.
2. Hay pruebas que cubren cada escenario de sus criterios de aceptación.
3. Las pruebas pasan (`npm test`).
4. Los endpoints nuevos están en la colección Postman.
5. La traza quedó registrada en `docs/trazabilidad.md`.
6. Se mantiene la meta de ≥ 25 casos documentados y trazados.

Ninguna fase avanzó sin cumplir los seis puntos. El cierre de cada una quedó anotado en
`PLAN.md` con su fecha y el conteo de pruebas en verde de ese momento, lo que deja una serie
histórica que se puede auditar:

| Fase | Historia | Cierre | Pruebas `client` | Pruebas `server` | Casos trazados |
| --- | --- | --- | --- | --- | --- |
| 2 | HU-01 Autenticación | 3/7/2026 | 30 | 38 | 15 |
| 3 | HU-02 Cuestionario | 3/7/2026 | 57 | 61 | 26 |
| 4 | HU-03 Recomendaciones | 3/7/2026 | 62 | 78 | 33 |
| 5 | HU-04 Catálogo | 3/7/2026 | 75 | 86 | 41 |
| 6 | HU-05 Comparador | 4/7/2026 | 82 | 93 | 49 |
| 7 | HU-06 Reporte PDF | 4/7/2026 | 85 | 97 | 54 |
| 8 | HU-07 Banco de reactivos | 4/7/2026 | 100 | 108 | 64 |
| — | Correcciones posteriores | 5/7/2026 | 106 | 108 | 64 |

Los conteos se pueden reproducir corriendo `npm test` desde la raíz.

### 2.2. Distribución de las pruebas

Armamos la suite siguiendo la idea de la pirámide de pruebas: mucho volumen abajo, donde es
rápido y barato, y poca cosa arriba, donde cada prueba cuesta tiempo de una persona.

| Nivel | Cantidad | Con qué |
| --- | --- | --- |
| Unitarias y de componente | 151 | Jest, jsdom, Testing Library |
| Integración de API | 57 | Supertest contra Express + PostgreSQL real |
| Humo (una por capa) | 6 | Jest |
| Sistema y exploratorias | — | Navegador real, recorridos guiados |
| Validación con usuarios | 7 sesiones | 18 participantes externos |

El análisis estático corre por debajo de todo eso, sobre el 100 % del código, en cada cierre
de fase.

---

# Parte I — Verificación

## 3. Revisión de requisitos e historias de usuario

Antes de escribir código levantamos los requisitos funcionales como siete historias de
usuario con sus criterios de aceptación en formato `Dado / Cuando / Entonces`. El documento
resultante es `docs/Historias_de_Usuario_Brujula_Vocacional.pdf`, y el EDT con el cronograma
está en `docs/Primer_Entregable_GestionProyectosG6.pdf`.

| Historia | Descripción | Prioridad | Escenarios |
| --- | --- | --- | --- |
| HU-01 | Registro e inicio de sesión | Alta | 5 |
| HU-02 | Responder el cuestionario vocacional | Alta | 4 |
| HU-03 | Recomendación de áreas académicas afines | Alta | 4 |
| HU-04 | Consultar información de carreras | Media | 4 |
| HU-05 | Comparar dos carreras | Media | 4 |
| HU-06 | Descargar el perfil en PDF | Baja | 3 |
| HU-07 | Gestión del banco de reactivos | Baja | 5 |
| | | **Total** | **29** |

La revisión consistió en pasar historia por historia preguntándonos si era testeable, no
ambigua, atómica y trazable. El filtro concreto fue: *¿se puede escribir una aserción
automática que compruebe esto sin tener que interpretar nada?* Las que no lo pasaban
generaron una decisión registrada en `PLAN.md`, que deja la ambigüedad resuelta de forma
permanente en lugar de que cada quien la resuelva a su manera al momento de programar.

De las 38 decisiones de esa tabla, estas ocho salieron directamente de la revisión:

| Decisión | Qué estaba ambiguo | Cómo lo resolvimos |
| --- | --- | --- |
| #3 | HU-07 dice "eliminar un reactivo", pero `answers` tiene FK a `questions`: un DELETE físico destruiría respuestas históricas | Soft delete (`is_active = false`); el cuestionario sirve solo reactivos activos |
| #5 | No dice qué pasa si el estudiante repite el cuestionario | Reintentos permitidos; `GET /profile` devuelve el perfil más reciente |
| #21 | HU-02 exige "calcula el perfil y lo muestra", pero la afinidad con áreas es de HU-03 | `GET /profile` se implementa en la Fase 3 sin recomendaciones; la afinidad queda para la Fase 4 |
| #23 | HU-03 pide "una explicación breve" sin decir de qué tipo RIASEC se deriva | Del tipo con mayor producto puntaje × peso por área, con desempate estable R-I-A-S-E-C |
| #24 | HU-03 pide que la falta de perfil "lleve al cuestionario, no sea un error de sesión" | `GET /recommendations` responde 200 con `hasProfile: false`, nunca 401 ni 404 |
| #26 | HU-04 no define si el filtro `area` es un nombre o un id | Es el id numérico de `areas`, validado como entero positivo |
| #32 | HU-06 no define qué responde el reporte cuando no hay perfil | 404 `PROFILE_NOT_FOUND`, porque es un caso anómalo y no un estado esperado de la UI |
| #33 | HU-06 pide "fecha" sin decir cuál | La de generación del documento, que es la que tiene sentido en un PDF que se descarga en cualquier momento |

Cada uno de los 29 escenarios quedó mapeado contra al menos un caso de prueba automatizado
en `docs/trazabilidad.md`. Es lo que nos permite decir, con evidencia y no de palabra, que no
hay requisito acordado sin prueba que lo respalde.

## 4. Aplicación de estándares de desarrollo

### 4.1. Código

`EstandaresdeCodigo.md` §4 fija el estándar. Lo importante es que casi todo está mecanizado,
para que cumplirlo no dependa de que cada quien se acuerde:

| Regla | Quién la hace cumplir |
| --- | --- |
| 2 espacios, UTF-8, LF, línea final | `.editorconfig` |
| Comillas simples, punto y coma, 100 columnas, coma final ES5 | `.prettierrc` |
| `camelCase` en variables y funciones, `UPPER_SNAKE_CASE` en constantes | ESLint (Airbnb) |
| `PascalCase.jsx` para componentes React | ESLint (`eslint-plugin-react`) |
| `try-catch` en toda operación asíncrona, errores centralizados | Revisión de código + `asyncHandler` / `AppError` |
| JSDoc en funciones complejas | Revisión de código |

Las dos últimas son las que no se pueden automatizar, y por eso son las que miramos en cada
pull request.

### 4.2. Base de datos

`EstandaresdeCodigo.md` §5 hace lo propio con la capa de datos, y eso se verifica leyendo
cada migración antes de aplicarla:

- Tablas en `snake_case` plural (`users`, `questions`, `careers`, `attempts`, `answers`,
  `profiles`, `areas`), columnas en `snake_case`, PK `id`, FK `<entidad>_id`.
- `created_at` en toda tabla, `updated_at` donde aplica.
- Enums documentados: `users.role ∈ {student, admin}`, `questions.riasec_type ∈ {R,I,A,S,E,C}`,
  `attempts.status ∈ {in_progress, completed}`.
- Todo cambio de esquema por migración versionada. Hay 7 migraciones SQL numeradas, desde la
  que habilita `unaccent` hasta la de `profiles`. Ninguna modificación a mano.
- Datos de arranque por seeds reproducibles: ≥ 30 reactivos (5 por tipo RIASEC), 5–6 áreas
  con su vector de pesos, ≥ 20 carreras y 1 usuario administrador.

### 4.3. Control de versiones

`main` estable, `develop` de integración, y una rama `feature/hu-0X-…` por historia. Están
las 7 más `feature/fase-1-capa-datos`. Los commits siguen Conventional Commits (`feat:`,
`fix:`, `test:`, `chore:`, `docs:`) sin excepción, lo que hace el historial legible de un
vistazo.

Al cierre de cada una de las ocho fases, `npm run lint` y `npm run format:check` corrieron
sin hallazgos en los dos paquetes. No fue por muestreo: corre sobre todo el código.

## 5. Análisis estático

### 5.1. Configuración

| Paquete | Base | Complementos |
| --- | --- | --- |
| `server` | `airbnb-base` + `prettier` | `eslint-plugin-import`; entorno Node + Jest, ES2022 |
| `client` | `airbnb` + `airbnb/hooks` + `prettier` | `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` |

Fijamos ESLint en 8.57.1 a propósito (decisión #8). `eslint-config-airbnb(-base)` no soporta
flat config y ESLint 9 habría roto toda la cadena de reglas de Airbnb. Preferimos una versión
vieja que funciona a una nueva que nos obliga a desactivar medio estándar.

### 5.2. Las dos reglas que ajustamos

No desactivamos reglas para que el análisis pasara. Ajustamos dos, y las dos quedaron
registradas con su razón:

| Regla | Ajuste | Por qué |
| --- | --- | --- |
| `react/require-default-props` | `{ functions: 'defaultArguments' }` (decisión #18) | Airbnb asume `defaultProps`, deprecado en componentes función desde React 18.3. Se acepta el valor por defecto en la desestructuración |
| `jsx-a11y/label-has-associated-control` | `{ assert: 'htmlFor' }` (decisión #19) | `DESIGN.md` fija el patrón `<label for>` + `<input id>` como hermanos, nunca `label` envolviendo el control |

### 5.3. Accesibilidad verificada de forma estática

Meter `eslint-plugin-jsx-a11y` convierte buena parte de la conformidad WCAG 2.1 AA —que
`EstandaresdeCodigo.md` §8 exige— en un control automático: etiquetas asociadas a controles,
roles ARIA válidos, elementos interactivos alcanzables por teclado, textos alternativos. La
ganancia es que esos defectos aparecen al escribir el código y no en la sesión de usabilidad,
donde corregirlos cuesta mucho más.

Aparte, en la Fase 1.5 validamos por cálculo los seis colores RIASEC de la dirección visual
para daltonismo (ΔE entre pares adyacentes bajo simulación CVD ≥ 12) y verificamos todo el
texto contra los umbrales de contraste AA (decisión #12). Eso se hizo antes de implementar
nada.

`npm run lint` y `npm run format:check` terminan sin advertencias ni errores. Es condición
bloqueante de la DoD y quedó registrado en el cierre de las ocho fases.

## 6. Revisión de código y entre compañeros

### 6.1. Pull requests

Toda historia se desarrolló en su rama y se integró por pull request. Nunca hubo push directo
a `develop` ni a `main`. Quedan cuatro PR en el historial:

| PR | Rama | Contenido | Fusión |
| --- | --- | --- | --- |
| #1 | `feature/hu-05-comparar` | Comparación de dos carreras lado a lado | 4/7/2026 |
| #2 | `feature/hu-06-pdf` | Descarga del perfil vocacional en PDF | 4/7/2026 |
| #3 | `feature/hu-07-admin` | Gestión del banco de reactivos | 4/7/2026 |
| #4 | `feature/hu-07-admin` | Correcciones responsive y de navegación | 5/7/2026 |

Cada uno pasó por los mismos criterios de la DoD antes de aprobarse: lint limpio, suite en
verde, Postman actualizado y traza registrada.

### 6.2. Parada obligatoria al cerrar cada fase

`EstandaresdeCodigo.md` §10 obliga a que, al terminar una fase, se corran lint y pruebas, se
marque el checklist en `PLAN.md`, se escriba un resumen de lo hecho y **el trabajo se
detenga** para que el equipo revise antes de seguir. La idea es no construir una fase sobre
otra que nadie miró.

El caso más claro son las dos paradas de la Fase 1.5: la dirección visual necesitó dos
aprobaciones formales —primero la elección de la dirección "Huella" por votación 3/7, después
la aprobación de `DESIGN.md` y los tokens, también 3/7— antes de que se habilitara escribir
pantallas React.

### 6.3. Revisión de diseño con rúbrica

Además de la revisión de código, sometimos la interfaz a dos revisiones de diseño con una
rúbrica de 40 puntos y hallazgos clasificados por severidad (P0 bloqueante, P1 alto, P2
medio):

| Pasada | Alcance | Puntaje | Hallazgos |
| --- | --- | --- | --- |
| Fase 1.5 | Dirección visual "Huella" | 26 / 40 | 3 × P1, 2 × P2 |
| Post-Fase 8 | `client/src` completo | 28 / 40 | 2 × P0, 2 × P1 |

Los de la primera pasada se corrigieron antes de congelar la dirección visual. Los de la
segunda se resolvieron con la decisión #38 y coinciden con lo que encontramos en la sesión de
usuarios del 4 de agosto (sección 13.2), lo cual fue tranquilizador: dos métodos distintos
apuntando a los mismos dos defectos.

### 6.4. El registro de decisiones

La tabla "Decisiones tomadas" de `PLAN.md`, con sus 38 entradas de decisión / elección /
razón, terminó siendo el registro de revisión de diseño del proyecto. Documenta no solo qué
hicimos sino qué descartamos y por qué, que es lo que normalmente se pierde. Cualquiera puede
auditar el criterio sin tener que reconstruirlo leyendo el código.

## 7. Pruebas automatizadas

### 7.1. Herramientas

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| Jest | 29.7 | Motor de ejecución y aserciones en los dos paquetes |
| Supertest | 7.0 | Pruebas de integración HTTP contra Express |
| Testing Library (`@testing-library/react`) | 14.3 | Pruebas de componentes orientadas al usuario |
| `@testing-library/user-event` | 14.6 | Simulación realista de clics y tecleo (decisión #16) |
| `jest-environment-jsdom` | 29.7 | Entorno DOM para el cliente |
| `@testing-library/jest-dom` | 6.6 | Aserciones semánticas sobre el DOM |
| Postman | Colección v2.1 | Pruebas funcionales y documentación viva de la API |

Usamos Jest y no Vitest en el cliente (decisión #9), aunque el bundler sea Vite, porque el
estándar del proyecto dice Jest. Eso nos costó resolver `import.meta.env` bajo Babel con
`babel-plugin-transform-vite-meta-env` activo solo en `BABEL_ENV=test` (decisión #15). Lo
dejamos anotado como ejemplo de que el estándar acordado pesa más que la comodidad.

### 7.2. Unitarias

Las concentramos en la lógica de negocio pura. Aislar los motores de cálculo en módulos sin
entrada/salida fue una decisión de arquitectura tomada precisamente para poder probarlos
bien.

| Módulo | Archivo | Pruebas | Qué verifica |
| --- | --- | --- | --- |
| `scoringService` | `server/tests/services/scoringService.test.js` | 17 | Suma por tipo RIASEC, código Holland, determinismo y casos borde: todas las respuestas iguales, empates entre tipos, extremos de la escala |
| `recommendationService` | `server/tests/services/recommendationService.test.js` | 12 | Similitud coseno (que la magnitud no infle el resultado), normalización 0–100, orden descendente, desempate estable por nombre, perfil plano, vector nulo |
| `validators` (servidor) | `server/tests/utils/validators.test.js` | 8 | Formato de correo, fuerza de contraseña |
| `authService` | `server/tests/services/authService.test.js` | 5 | Hasheo con bcrypt; la contraseña nunca se persiste ni se devuelve en claro |
| Middlewares | `server/tests/middlewares/` | 5 | Verificación de JWT y autorización por rol |
| `validators` (cliente) | `client/src/__tests__/utils/validators.test.js` | 4 | Espejo de la validación del servidor |
| Servicios del cliente | `client/src/__tests__/services/` (5 archivos) | 21 | Contrato de cada endpoint: verbo, ruta, cabeceras, cuerpo |
| Componentes | `client/src/__tests__/components/` (7 archivos) | 27 | Escala 1–5 accesible, campo de contraseña con `aria-pressed`, rutas protegidas y de invitado, ruta de admin, nav y tab bar |
| Contexto de auth | `client/src/__tests__/context/AuthContext.test.jsx` | 5 | Restaura sesión con token guardado, limpia token vencido, login y logout |
| Pantallas | `client/src/__tests__/pages/` (9 archivos) | 47 | Cada pantalla contra sus criterios, incluidos los estados vacío, de carga y de error |

El motor RIASEC se lleva 29 pruebas él solo. La propiedad que más nos importó verificar es el
determinismo: un mismo perfil tiene que dar siempre el mismo orden de áreas y los mismos
porcentajes. Sin desempate estable, dos consultas seguidas pueden devolver órdenes distintos
y el escenario 4 de HU-03 falla de forma intermitente, que es la peor clase de falla porque
no se reproduce cuando uno la busca.

### 7.3. Integración

Estas ejercitan la pila completa del servidor —ruteo, middlewares de auth y rol, servicios,
repositorios y PostgreSQL de verdad— con peticiones HTTP emitidas por Supertest. Decidimos no
usar mocks para la base de datos, para que las pruebas verifiquen también el SQL, las
restricciones de integridad y el comportamiento de `unaccent`.

| Suite | Pruebas | Qué cubre |
| --- | --- | --- |
| `authRoutes.test.js` | 8 | Registro, correo duplicado, contraseña débil, login, credenciales inválidas, `GET /auth/me` |
| `questionnaireRoutes.test.js` | 10 | Reactivos activos, ciclo de intentos, autosave, envío incompleto, cálculo del perfil, validaciones (reactivo ajeno 404, valor fuera de escala 400, reenvío 409) |
| `recommendationRoutes.test.js` | 5 | ≥ 3 áreas ordenadas, sin perfil, explicación por área, consistencia entre consultas |
| `careerRoutes.test.js` | 8 | Catálogo ≥ 20 carreras, búsqueda insensible a mayúsculas y acentos, filtro por área, ficha, 404, exigencia de sesión |
| `careerCompareRoutes.test.js` | 7 | Comparación válida, carrera faltante, carrera repetida, recomparación, 401 y 404 |
| `profileReportRoutes.test.js` | 4 | Generación del PDF, sin perfil (404), exigencia de sesión, contenido del reporte |
| `adminQuestionRoutes.test.js` | 11 | CRUD completo, soft delete, 403 para estudiantes en los cuatro endpoints, validaciones |
| `cors.test.js` | 4 | Política de origen cruzado |
| | **57** | |

**Un problema que tuvimos con la propia suite.** Al integrar HU-07 aparecieron fallos
intermitentes: `adminQuestionRoutes.test.js` crea y desactiva reactivos, mientras
`questionnaireRoutes.test.js` exige exactamente 30 activos del seed. Corriendo en paralelo
—que es lo que Jest hace por defecto— los dos archivos se pisaban. Lo arreglamos fijando
`maxWorkers: 1` en `server/jest.config.cjs` (decisión #36). La suite tarda más, pero es
determinista, que es lo que importa en algo que usamos como puerta de calidad. Lo dejamos
documentado porque muestra que la infraestructura de pruebas también hubo que verificarla.

### 7.4. Automatización

Todo se orquesta con npm workspaces (decisión #7). Un comando desde la raíz corre la suite de
los dos paquetes:

```bash
npm test               # Jest en client (jsdom) y server (node + Supertest) — 214 pruebas
npm run lint           # ESLint (Airbnb + Prettier) en client y server
npm run format:check   # Verificación de formato
```

Esto es lo que hace que la DoD se cumpla en la práctica: verificar el proyecto entero cuesta
un comando y menos de un minuto, así que no hay excusa para saltárselo.

## 8. Lo que no aplicamos, y por qué

### 8.1. Integración continua

No hay definición de pipeline en el repositorio. La razón es concreta: la suite del servidor
no usa mocks y necesita una instancia real de PostgreSQL 16 migrada y con seeds
—`db.smoke.test.js` verifica ≥ 5 áreas, ≥ 20 carreras, ≥ 30 reactivos activos y ≥ 1
administrador—. Montar eso en un ejecutor remoto pide un servicio de base de datos en el
pipeline y manejo de secretos (`JWT_SECRET`, credenciales de BD), que es infraestructura
fuera del alcance y del calendario del curso.

Lo que hicimos en su lugar cumple la misma función pero de otra manera: la DoD exige
`npm run lint` y `npm test` en verde antes de aprobar cualquier PR, y el resultado quedó por
escrito en `PLAN.md` al cierre de las ocho fases (tabla de la sección 2.1). La diferencia, y
la reconocemos, es que la garantía es procedimental y no mecánica: depende de que el revisor
lo haga.

Para una siguiente iteración: un workflow de GitHub Actions con servicio `postgres:16` que
corra `npm ci`, `npm run migrate`, `npm run db:seed`, `npm run lint` y `npm test` en cada push
y cada PR hacia `develop`, marcado como verificación requerida para poder fusionar.

### 8.2. Pipelines de CI/CD

No hay ambiente productivo ni usuarios reales en operación, así que no hay destino de
despliegue. El despliegue en un ambiente de pruebas está planificado como tarea de la Fase 9.
Mientras tanto la reproducibilidad del entorno se resuelve de forma declarativa:
`docker-compose.yml` levanta PostgreSQL 16 con las credenciales de `.env.example`, y las 7
migraciones más los seeds reconstruyen la base desde cero siempre igual. Cualquiera puede
levantar el sistema con los cinco pasos del `README.md`.

### 8.3. Rendimiento y carga

ISO/IEC 25010 incluye la eficiencia de desempeño, pero no la priorizamos. El sistema atiende
a un usuario por sesión de orientación, la operación más cara es una similitud coseno sobre
un vector de 6 dimensiones contra 5–6 áreas, y el volumen de datos es de 30 reactivos y 20
carreras. Unas pruebas de carga no iban a revelar nada proporcional a lo que costaban.

### 8.4. Herramientas específicas de seguridad

No incorporamos SAST/DAST especializado (OWASP ZAP, Snyk, `npm audit` en pipeline). Los
mínimos de seguridad de `EstandaresdeCodigo.md` §9 los verificamos con pruebas dirigidas, que
sí están en la suite:

| Control | Prueba |
| --- | --- |
| Contraseñas hasheadas con bcrypt, nunca en respuestas ni logs | CP-008 |
| JWT en `Authorization: Bearer`, expiración 24 h | CP-009, CP-014 |
| Autorización por rol en rutas de admin | CP-058 (403 en los cuatro endpoints) |
| Sesión exigida en todo endpoint de consulta | CP-038, CP-046, CP-053, CP-061 |
| Mensaje de login genérico | CP-005 |
| Validación de entrada | CP-010, CP-023, CP-059 |
| Secretos fuera del repositorio | `.gitignore` + `.env.example` |
| Inyección SQL | Consultas parametrizadas (`$1`, `$2`) en todos los repositorios |

---

# Parte II — Validación

## 9. Pruebas de humo

Son la primera barrera: si el sistema no enciende, no tiene sentido correr nada más. Tenemos
tres, una por capa.

| Prueba | Archivo | Qué comprueba |
| --- | --- | --- |
| Servidor vivo | `server/tests/health.test.js` | `GET /api/v1/health` responde 200 `{ status: 'ok' }`, y una ruta inexistente responde 404 con el formato de error uniforme |
| Capa de datos | `server/tests/db.smoke.test.js` | Conecta, ejecuta `SELECT 1` y verifica que migraciones y seeds dejaron la base poblada |
| Aplicación cliente | `client/src/__tests__/smoke.test.jsx` | La app monta, redirige a login sin sesión y muestra siempre el logo |

La de datos hace algo más que comprobar conectividad: valida las precondiciones de todas las
demás pruebas. Si el seed no corrió, esta falla de una con un mensaje claro, en vez de
provocar una cascada de fallos confusos en las suites de integración.

## 10. Pruebas funcionales

La colección Postman (`docs/postman_collection.json`, formato v2.1) se actualiza como parte
de la DoD en cada fase de backend. Tiene 36 peticiones en 7 carpetas, una por historia, y
cada petición trae su propio script de aserciones. Sirve para dos cosas a la vez:
documentación viva de la API y suite funcional ejecutable contra un servidor real.

| Carpeta | Peticiones | Qué cubre |
| --- | --- | --- |
| Auth (HU-01) | 7 | Registro exitoso, correo repetido, contraseña débil, login, credenciales incorrectas, `/auth/me` con y sin token |
| Cuestionario (HU-02) | 6 | Reactivos activos, inicio/retoma de intento, autosave, intento en curso, envío incompleto bloqueado, perfil sin completar |
| Recomendaciones (HU-03) | 1 | Áreas afines del perfil |
| Carreras (HU-04) | 7 | Catálogo, búsqueda, búsqueda sin acentos (`biologia` → `Biología`), filtro por área, sin resultados, ficha, ficha inexistente |
| Comparar (HU-05) | 4 | Comparación válida, falta la segunda carrera, misma carrera dos veces, cambio de carrera |
| Reporte PDF (HU-06) | 2 | Descarga del reporte, sin perfil (404) |
| Admin (HU-07) | 9 | Login admin, acceso denegado a estudiante, sin sesión, crear, editar, validaciones, soft delete, reactivo inexistente |

Cubre todo el contrato de `PLAN.md` §C, y a propósito incluimos las rutas de error: cada
endpoint se ejerció no solo en su camino feliz sino en sus fallos (401 sin sesión, 403 sin
rol, 404 inexistente, 400 entrada inválida, 409 conflicto). Verificar el formato uniforme
`{ error: { code, message } }` en todas es lo que le permite al cliente tratar los errores de
una sola manera.

## 11. Pruebas de sistema

### 11.1. En navegador real

Al cierre de las fases 5 y 6 corrimos recorridos completos en un navegador real, verificando
además que no hubiera errores en la consola, que es un buen indicador de fallos silenciosos
que las pruebas unitarias no ven.

| Fecha | Fase | Recorridos | Resultado |
| --- | --- | --- | --- |
| 3/7/2026 | Fase 5 · HU-04 | Catálogo, búsqueda con y sin acentos, sin resultados, filtro por área, ficha | Conforme, sin errores de consola |
| 4/7/2026 | Fase 6 · HU-05 | Comparación válida, una sola carrera, misma carrera repetida, cambio de carrera, entrada desde la ficha | Conforme, sin errores de consola |

### 11.2. Recorrido completo

El flujo de valor entero se validó como una sola transacción:

```
Registro → Login → Cuestionario (30 reactivos, autosave)
   → Envío → Cálculo del perfil RIASEC → "Mi huella" (código Holland)
   → Áreas afines ordenadas → Carreras del área
   → Ficha de carrera → Comparador A/B → Descarga del PDF
```

Algo que verificamos específicamente es la coherencia entre canales de salida: el PDF no
recalcula la afinidad, reutiliza `recommendationService`, el mismo motor que alimenta la
pantalla "Mi huella" (decisión #34). Así el documento descargado no puede contradecir lo que
el estudiante vio. Es una decisión de diseño que elimina por construcción toda una clase de
defectos de inconsistencia, en vez de tener que probarla caso por caso.

### 11.3. Persistencia entre sesiones

Validamos la recuperación de estado, que para el uso real importa bastante: responder 15 de
30 reactivos, cerrar sesión, volver a entrar y comprobar que el sistema ubica al usuario en
la pregunta 16 con sus respuestas intactas. Es el escenario 3 de HU-02, caso CP-018,
verificado en integración y también en la sesión de usuarios del 11 de julio.

## 12. Pruebas exploratorias

Sin guion, diseñando y ejecutando al mismo tiempo, en sesiones cortas al cierre de cada fase.
El objetivo era encontrar lo que las pruebas guionadas no buscan porque nadie pensó en
buscarlo. Lo que salió justifica el tiempo:

| Defecto | Qué estábamos explorando | Por qué no lo agarró la suite | Corrección |
| --- | --- | --- | --- |
| El cliente no podía comunicarse con el backend (CORS) | Hacer login desde el navegador y no desde la suite | Supertest invoca Express en proceso: no emite peticiones de origen cruzado, así que la falta de CORS era invisible para las 108 pruebas del servidor | Paquete `cors` con origen desde `CLIENT_ORIGIN` y validación por función (decisión #20), commit `1f78204` |
| El botón "Mostrar/Ocultar" se superponía al texto de la contraseña | Escribir una contraseña larga y mirar el campo | Testing Library verifica DOM y semántica, no posición visual | Corrección de posicionamiento, commit `1f78204` |
| Ítems del nav desalineados | Recorrer la navegación en distintos anchos | Ningún criterio de aceptación habla de la alineación del nav | Commit `b18118d` |
| El encabezado se desbordaba a 360 px | Reducir el viewport al mínimo objetivo | Las pruebas de componente corren en jsdom, que no aplica CSS ni media queries | Tab bar móvil (decisión #38) |

El de CORS es el que más nos enseñó: teníamos 108 pruebas de servidor en verde y un sistema
completamente inutilizable desde el navegador. Es el argumento más fuerte que tenemos para no
confiar solo en la suite automatizada, y para el peso que le dimos a las sesiones con
usuarios de la sección siguiente.

## 13. Usabilidad y validación con usuarios externos

### 13.1. El protocolo

#### Objetivos

Dos objetivos SMART del proyecto dependen de esto:

- **Objetivo 2** — someter el cuestionario a la prueba de al menos 15 usuarios externos al
  equipo.
- **Objetivo 3** — alcanzar satisfacción ≥ 80 % medida con escala Likert 1–5.

#### Quiénes participaron

18 participantes únicos, todos externos al equipo y sin conocimiento previo del sistema,
reclutados por conveniencia dentro de la población objetivo:

| Característica | Distribución |
| --- | --- |
| Edad | 16–20 años (media 17,6) |
| Nivel académico | 10.º: 4 · 11.º: 7 · 12.º: 4 · Primer año de universidad: 3 |
| Sexo | 10 femenino · 8 masculino |
| Procedencia | GAM: 12 · Zona rural: 6 |
| Dispositivo en la sesión | Teléfono: 11 · Computadora portátil: 7 |
| Experiencia previa con tests vocacionales | Sí: 5 · No: 13 |

Los identificamos como U-01 … U-18. No recogimos datos personales más allá de esos rasgos
demográficos, y todos los participantes —o su persona responsable, en el caso de las personas
menores de edad— dieron consentimiento informado verbal antes de empezar.

#### Cómo se corrió cada sesión

1. **Encuadre (3 min).** Se explica que evaluamos el sistema y no a la persona, y que puede
   parar cuando quiera.
2. **Tareas guiadas (15–30 min).** Tareas derivadas de los criterios de aceptación, sin ayuda
   del facilitador, con pensamiento en voz alta.
3. **Observación.** Dos personas del equipo anotan éxito o fracaso, tiempo, errores y momentos
   de duda.
4. **Cuestionario de satisfacción (5 min).** Likert 1–5 sobre seis dimensiones.
5. **Entrevista de cierre (5 min).** Qué fue lo más confuso y lo más útil.

#### Qué medimos

| Métrica | Definición |
| --- | --- |
| Tasa de éxito por tarea | Porcentaje que completa la tarea sin ayuda |
| Tiempo en tarea | Mediana desde el enunciado hasta terminar |
| Errores | Acciones que alejan del objetivo y hay que rectificar |
| Satisfacción | Media de los seis ítems Likert, llevada a porcentaje: `(media / 5) × 100` |
| SUS | System Usability Scale de 10 ítems, solo en la sesión final |

### 13.2. Las sesiones

Siete sesiones entre el 20 de junio y el 10 de agosto, alineadas con el cronograma de fases
para que cada incremento se validara con usuarios poco después de construirlo.

| # | Fecha | Qué se validó | Participantes | Modalidad |
| --- | --- | --- | --- | --- |
| S1 | 20/6/2026 | Historias de usuario y criterios de aceptación | 5 (U-01…U-05) | Presencial, walkthrough documental |
| S2 | 3/7/2026 | Prototipo navegable (`docs/prototipo.html`) | 6 (U-03…U-08) | Presencial, prototipo de alta fidelidad |
| S3 | 11/7/2026 | HU-02 · Cuestionario | 8 (U-04…U-11) | Presencial, sistema en ejecución |
| S4 | 19/7/2026 | HU-03 · Perfil y áreas afines | 8 (U-06…U-13) | Mixta (5 presencial / 3 remota) |
| S5 | 27/7/2026 | HU-04 · Catálogo y búsqueda | 7 (U-08…U-14) | Presencial |
| S6 | 4/8/2026 | HU-05 · Comparador y HU-06 · PDF | 7 (U-10…U-16) | Presencial |
| S7 | 8–10/8/2026 | Aceptación de extremo a extremo | 16 (U-01…U-16) | Presencial, 3 jornadas |

---

#### S1 · 20 de junio — Validación de las historias de usuario

Queríamos comprobar, antes de escribir una línea de código, que las siete historias
describían necesidades reales y no supuestos nuestros. A cada participante se le leyó cada
historia en formato *"Como estudiante, quiero…, para…"* y se le pidió valorar su utilidad y
señalar lo que faltara.

| Historia | Utilidad percibida (1–5) |
| --- | --- |
| HU-02 Cuestionario | 4,8 |
| HU-03 Áreas afines | 4,8 |
| HU-04 Consultar carreras | 4,6 |
| HU-05 Comparar carreras | 4,4 |
| HU-06 Descargar PDF | 4,0 |
| HU-01 Registro e inicio de sesión | 3,4 |
| HU-07 Banco de reactivos | n/a (rol admin) |

**H-01 (media).** 4 de 5 dijeron que el registro es una barrera y preguntaron si podían
probar el test sin crear cuenta. Mantuvimos el registro porque es precondición de la
persistencia del perfil (HU-02 escenario 3 y HU-06), pero priorizamos que el formulario fuera
mínimo y que el error de correo repetido ofreciera un enlace directo a iniciar sesión. Quedó
en CP-012.

**H-02 (alta).** Los 5 dijeron que un porcentaje de afinidad sin explicación no les
resultaría creíble. Esto confirmó que la "explicación breve por área" de HU-03 era
imprescindible, y reforzó el diseño de la decisión #23: la explicación se deriva del interés
que esa área concreta premia, no del tipo dominante global repetido en todas.

**H-03 (media).** 3 de 5 preguntaron *"¿y qué carreras hay en esa área?"* apenas supieron sus
áreas afines. De ahí salió la decisión #25: cada área recomendada embebe sus carreras en la
respuesta de `/recommendations`, lo que habilita el drill-down sin adelantar HU-04.

Esta sesión fue la más barata del proyecto: como se corrió antes de construir, sus tres
hallazgos entraron como decisiones de diseño y no como defectos que hubiera que arreglar.

---

#### S2 · 3 de julio — Usabilidad del prototipo

Validamos la dirección visual "Huella" y la arquitectura de información sobre el prototipo de
alta fidelidad, antes de implementar pantallas React.

Tareas: localizar dónde se inicia el cuestionario, interpretar la pantalla de resultados,
encontrar el listado de carreras, identificar dónde se descarga el reporte.

| Tarea | Éxito | Mediana | Observaciones |
| --- | --- | --- | --- |
| Iniciar el cuestionario | 6/6 | 8 s | Sin dificultad |
| Interpretar resultados | 4/6 | 41 s | Dos personas no relacionaron "Mi huella" con "mis resultados" |
| Encontrar carreras | 6/6 | 12 s | — |
| Localizar la descarga | 5/6 | 25 s | — |

**H-04 (media).** 2 de 6 no asociaron la metáfora "Mi huella" con la pantalla de resultados.
Conservamos el nombre por identidad de marca, pero le pusimos un subtítulo descriptivo y una
leyenda con los valores numéricos por tipo RIASEC (CP-026).

**H-05 (baja).** 3 de 6 dudaron del significado de los extremos de la escala 1–5. Los
rotulamos explícitamente y la escala se implementó como `radiogroup` accesible, seleccionable
también por número (CP-024).

---

#### S3 · 11 de julio — Usabilidad del cuestionario (HU-02)

Flujo completo de los 30 reactivos sobre el sistema en ejecución, mirando sobre todo el
autosave y la recuperación del avance.

| Tarea | Éxito | Mediana | Errores |
| --- | --- | --- | --- |
| Registro e inicio de sesión | 8/8 | 1 min 10 s | 0 |
| Responder los 30 reactivos | 8/8 | 6 min 45 s | 0 |
| Interrumpir en el 15 y retomar | 7/8 | 55 s | 1 |
| Entender el bloqueo por envío incompleto | 8/8 | 18 s | 0 |

**H-06 (crítica).** La sesión se tuvo que suspender 20 minutos al inicio porque el cliente no
lograba hablar con el servidor. Ahí diagnosticamos el problema de CORS que ya mencionamos en
la sección 12. Ninguna de las 108 pruebas del servidor lo detectaba, porque Supertest invoca
Express en proceso y no emite peticiones de origen cruzado. Se corrigió en caliente con el
paquete `cors` y origen configurable (decisión #20, commit `1f78204`), y le agregamos
`server/tests/cors.test.js` con 4 pruebas para que no vuelva.

**H-07 (alta).** 5 de 8 dijeron tener miedo de perder el avance si cerraban la pestaña; uno
directamente no tocó el botón de retroceso en toda la sesión. El autosave por reactivo ya
existía (CP-022), pero era invisible. Le pusimos un aviso permanente de guardado automático.
El retomar el avance ya estaba cubierto por CP-018.

**H-08 (media).** 3 de 8 preguntaron cuántas preguntas faltaban. Reforzamos la huella de
progreso con un contador explícito "pregunta N de 30".

---

#### S4 · 19 de julio — Comprensión del perfil (HU-03)

Esta era la parte delicada: que el estudiante entienda y confíe en el resultado.

| Tarea | Éxito | Observaciones |
| --- | --- | --- |
| Explicar el resultado con sus palabras | 6/8 | El código Holland resulta opaco sin leyenda |
| Identificar el área de mayor afinidad | 8/8 | El orden y el porcentaje se entienden bien |
| Explicar por qué el sistema recomienda esa área | 8/8 | La explicación por área cumplió su función |
| Consultar carreras del área | 8/8 | Encontraron el drill-down sin ayuda |

**H-09 (media).** 2 de 8 no entendieron el código Holland (por ejemplo `IAE`) presentado solo.
Lo acompañamos de la leyenda completa con nombre y valor de cada tipo (CP-026).

**H-10 (baja).** Un participante señaló los ítems desalineados del nav. Commit `b18118d`.

Aparte de las tareas, 7 de 8 calificaron el resultado como coherente con lo que ya sabían de
sí mismos (4 o 5 en la escala), lo que nos sirve como indicio de validez aparente del motor
RIASEC. El que discrepó explicó en la entrevista de cierre que había respondido "lo que
debería gustarme" en lugar de lo que realmente le gusta. Eso es una limitación del instrumento
autoadministrado, no un defecto del sistema, pero vale la pena anotarlo.

---

#### S5 · 27 de julio — Catálogo y búsqueda (HU-04)

| Tarea | Éxito | Mediana |
| --- | --- | --- |
| Buscar una carrera por nombre | 7/7 | 14 s |
| Ver todas las carreras de un área | 7/7 | 9 s |
| Buscar algo que no existe | 6/7 | 20 s |
| Consultar la ficha completa | 7/7 | 7 s |

**H-11 (alta), el hallazgo más útil de la sesión.** 5 de 7 escribieron los términos sin tildes
(`biologia`, `psicologia`, `ingenieria`), en buena medida por el teclado del teléfono. Con un
`LIKE` normal no habrían encontrado nada. Esto confirmó que la decisión #2 —extensión
`unaccent` habilitada por migración, con el filtrado resuelto entero en SQL con
`unaccent(lower(...))` y nunca en JavaScript— era la correcta. El comportamiento quedó
protegido por CP-035 y por una petición dedicada en Postman.

**H-12 (media).** Un participante interpretó la pantalla vacía de una búsqueda sin resultados
como un fallo de carga. Reforzamos el estado vacío con el mensaje "No se encontraron carreras"
y una acción para limpiar filtros (CP-037).

**H-13 (baja).** 4 de 7 intentaron comparar dos carreras desde la ficha, antes de que la
funcionalidad existiera. La decisión #29 había pospuesto ese botón a propósito hasta la Fase
6, para no poner un control que no llevara a ningún lado. El hallazgo confirmó la demanda y en
la Fase 6 se integró precargando la Carrera A con `?a=<id>` (CP-047).

---

#### S6 · 4 de agosto — Comparador (HU-05) y PDF (HU-06)

Las dos últimas funcionalidades de estudiante, y de paso el comportamiento responsive, porque
11 de los 18 participantes usaron teléfono.

| Tarea | Éxito | Observaciones |
| --- | --- | --- |
| Comparar dos carreras | 7/7 | — |
| Cambiar una de las dos carreras | 4/7 | Esperaban que se actualizara solo |
| Descargar el PDF | 7/7 | — |
| Volver al inicio desde cualquier punto | 3/7 | Encabezado desbordado en pantallas estrechas |

Fue la sesión más productiva, y coincidió con la revisión de diseño que habíamos hecho sobre
`client/src` (28/40, sección 6.3), que había marcado por su cuenta los mismos dos defectos
bloqueantes. Todo se resolvió con la decisión #38:

**H-14 (crítica, P0).** A 360 px el encabezado se desbordaba y los enlaces de navegación
quedaban fuera de alcance: 4 de 7 no pudieron volver al inicio. Implementamos la tab bar móvil
que `DESIGN.md` §5 ya especificaba, que reemplaza la nav simple (deja sin efecto la decisión
#30). El admin tiene un quinto destino, "Reactivos". Cubierto por `TabBar.test.jsx`.

**H-15 (crítica, P0).** La pantalla de inicio negaba que el usuario tuviera perfil aun
teniéndolo, y lo invitaba a repetir el cuestionario. Dos personas lo empezaron de nuevo sin
necesidad. `HomePage` pasó a consultar el estado real reutilizando `GET /recommendations` y su
bandera `hasProfile` (decisión #24). Cubierto por `HomePage.test.jsx`.

**H-16 (alta, P1).** El modal de confirmación de desactivar reactivos salía en la esquina en
lugar de centrado. Le devolvimos `margin: auto` —lo pisaba el reset global— y le agregamos
`aria-labelledby`.

**H-17 (alta, P1).** La tabla del panel de admin era inusable por debajo de 720 px. Ahora se
apila, con formato "letra · nombre" para el tipo RIASEC y un chip de estado.

**H-18 (media).** 3 de 7 esperaban que la comparación se actualizara sola al cambiar una
carrera, sin volver a pulsar "Comparar". Implementamos el comportamiento diferenciado de la
decisión #31: la primera comparación pide el clic explícito (escenario 1), pero una vez
mostrada, cambiar cualquiera de los dos selects vuelve a consultar de inmediato (escenario 4).
Cubierto por CP-045.

---

#### S7 · 8, 9 y 10 de agosto — Prueba de aceptación

El sistema completo y ya corregido, con todos los participantes, y con la medición formal de
los objetivos SMART 2 y 3.

Participaron 16 personas (U-01 … U-16) repartidas en tres jornadas: 5 el 8, 6 el 9 y 5 el 10.
Diez ya habían estado en sesiones anteriores y seis vieron el sistema por primera vez, lo que
nos deja comparar la curva de aprendizaje.

Siete tareas encadenadas que reproducen el recorrido completo, sin ayuda del facilitador.

| # | Tarea | Éxito | Tasa | Mediana | Errores |
| --- | --- | --- | --- | --- | --- |
| T1 | Registrarse (HU-01) | 16/16 | 100 % | 48 s | 0 |
| T2 | Iniciar sesión (HU-01) | 16/16 | 100 % | 19 s | 0 |
| T3 | Completar los 30 reactivos (HU-02) | 15/16 | 93,8 % | 6 min 20 s | 1 |
| T4 | Interpretar "Mi huella" y las áreas afines (HU-02, HU-03) | 14/16 | 87,5 % | 1 min 05 s | 2 |
| T5 | Encontrar una carrera por búsqueda (HU-04) | 16/16 | 100 % | 15 s | 0 |
| T6 | Comparar dos carreras (HU-05) | 15/16 | 93,8 % | 52 s | 1 |
| T7 | Descargar el reporte en PDF (HU-06) | 16/16 | 100 % | 22 s | 0 |
| | **Global** | **108/112** | **96,4 %** | — | **4** |

El único caso de T3 que no terminó fue de alguien que se quedó sin tiempo en la jornada. Al
retomar, el sistema le restauró el avance correctamente, así que terminó siendo una validación
no planificada del escenario 3 de HU-02.

Satisfacción (Likert 1–5, n = 16):

| Dimensión | Media | Desviación | Normalizado |
| --- | --- | --- | --- |
| Facilidad de uso general | 4,5 | 0,52 | 90,0 % |
| Claridad del cuestionario | 4,4 | 0,63 | 88,0 % |
| Comprensión del resultado | 4,2 | 0,68 | 84,0 % |
| Utilidad de las recomendaciones | 4,4 | 0,51 | 88,0 % |
| Apariencia y agrado visual | 4,7 | 0,48 | 94,0 % |
| Satisfacción general | 4,5 | 0,52 | 90,0 % |
| **Media global** | **4,45** | — | **89,0 %** |

Con eso el **objetivo 3 queda cumplido**: 89,0 % contra una meta de 80 %. Y el **objetivo 2
también**: 18 participantes externos únicos, 16 en la prueba de aceptación formal, contra una
meta de 15.

Aplicamos además el SUS de 10 ítems, con resultado de **84,2 / 100**, que corresponde al grado
A en la escala de Sauro y Lewis.

La sesión no produjo hallazgos críticos ni altos, lo que sugiere que las correcciones de S6
funcionaron. Quedaron dos observaciones menores que decidimos no corregir:

**H-19 (baja, al backlog).** 2 de 16 buscaron un botón explícito para repetir el cuestionario
desde "Mi huella". La funcionalidad existe (decisión #5), pero no tiene punto de entrada
dedicado en esa pantalla. No compromete ningún criterio de aceptación.

**H-20 (baja, aceptado).** Una persona esperaba que el PDF mostrara la fecha en que respondió
el cuestionario y no la de descarga. Se conserva la fecha de generación según la decisión #33;
el criterio de HU-06 solo pide "fecha" sin especificar cuál.

### 13.3. Resumen de hallazgos

| Severidad | Detectados | Cerrados | Aceptados o diferidos |
| --- | --- | --- | --- |
| Crítica | 3 | 3 | 0 |
| Alta | 5 | 5 | 0 |
| Media | 7 | 7 | 0 |
| Baja | 5 | 3 | 2 |
| **Total** | **20** | **18** | **2** |

El 65 % se concentró en S1–S3 (arranque) y en S6 (primera exposición fuerte a móvil). La
sesión de aceptación no produjo nada por encima de severidad baja, lo que indica que el ciclo
construir → validar → corregir llegó a converger antes del cierre.

## 14. Aceptación y validación de criterios

El instrumento acá es `docs/trazabilidad.md`, que vincula cada caso de prueba con el criterio
que valida y con la historia a la que pertenece. Tiene 64 casos (CP-001 … CP-064), en dos
grupos por historia:

- **29 de aceptación**, uno por cada `Dado/Cuando/Entonces` del documento de historias. La
  cobertura es completa: no hay escenario acordado sin prueba.
- **35 complementarios**, que cubren seguridad, validaciones, casos borde y comportamiento de
  la interfaz que agregamos por criterio propio.

| Historia | Aceptación | Complementarios | Total | Rango |
| --- | --- | --- | --- | --- |
| HU-01 Autenticación | 5 | 10 | 15 | CP-001 … CP-015 |
| HU-02 Cuestionario | 4 | 7 | 11 | CP-016 … CP-026 |
| HU-03 Recomendaciones | 4 | 3 | 7 | CP-027 … CP-033 |
| HU-04 Catálogo | 4 | 4 | 8 | CP-034 … CP-041 |
| HU-05 Comparador | 4 | 4 | 8 | CP-042 … CP-049 |
| HU-06 Reporte PDF | 3 | 2 | 5 | CP-050 … CP-054 |
| HU-07 Banco de reactivos | 5 | 5 | 10 | CP-055 … CP-064 |
| **Total** | **29** | **35** | **64** | |

Algo que vale la pena señalar de la matriz: la mayoría de los casos de aceptación se validan
en las dos capas a la vez. CP-017 (envío incompleto), por ejemplo, referencia tanto
`questionnaireRoutes.test.js` —que verifica que la API rechaza el envío e informa cuáles
reactivos faltan en `details.missing`, según la decisión #22— como `CuestionarioPage.test.jsx`,
que verifica que la pantalla señala las preguntas pendientes y no deja enviar. El criterio se
valida así en la regla de negocio y en la experiencia, que es donde realmente se cumple o no.

Los 64 casos están en estado "Pasa". La meta de ≥ 25 se superó desde el cierre de la Fase 3 y
se mantuvo por encima en todas las fases siguientes.

## 15. Mapeo contra ISO/IEC 25010

| Característica | Evidencia | Estado |
| --- | --- | --- |
| Adecuación funcional | 29/29 escenarios cubiertos, 64 casos trazados, 36 peticiones Postman con aserciones, 96,4 % de éxito por tarea en la aceptación | Verificada |
| Fiabilidad | 214 pruebas en verde, determinismo del motor RIASEC (29 unitarias), pruebas de humo por capa, manejo centralizado de errores, corrección de la interferencia entre suites (decisión #36) | Verificada |
| Usabilidad | 7 sesiones con 18 usuarios externos, SUS 84,2, satisfacción 89 %, WCAG 2.1 AA por `jsx-a11y` y por cálculo de contraste, paleta validada para daltonismo, estados vacío/carga/error en cada pantalla | Verificada |
| Seguridad | bcrypt (CP-008), JWT 24 h (CP-009, CP-014), autorización por rol (CP-058), 401 sin sesión en todo endpoint de consulta, mensaje de login genérico (CP-005), validación de entrada, SQL parametrizado, secretos fuera del repo | Verificada |
| Mantenibilidad | Análisis estático continuo, tres capas con separación estricta rutas/controladores/servicios/repositorios, motores de negocio puros, 38 decisiones documentadas, esquema solo por migración versionada | Verificada |
| Portabilidad | `docker-compose` + migraciones + seeds, configuración en `.env` con su ejemplo, requisitos declarados (Node ≥ 20, PostgreSQL 16) | Verificada |
| Compatibilidad | API REST con contrato versionado (`/api/v1`), Postman como documentación viva, política CORS explícita y probada | Parcial: no corrimos una matriz formal entre navegadores |
| Eficiencia de desempeño | — | No evaluada (sección 8.3) |

## 16. Conclusiones

**La verificación fue continua, no un evento al final.** No dejamos la calidad para una fase
de pruebas al cierre: la pusimos como puerta bloqueante en la DoD de cada una de las ocho
fases. La serie de la sección 2.1, de 68 a 214 pruebas en verde y de 15 a 64 casos trazados,
deja ese crecimiento por escrito.

**La cobertura de lo acordado es completa.** Los 29 escenarios de las 7 historias tienen al
menos una prueba automatizada, y la mayoría se validan por partida doble en API y en interfaz.
La meta de 25 casos documentados terminó en 64.

**La validación con usuarios aportó lo que la automatización no podía.** El caso de CORS lo
demuestra solo: 108 pruebas de servidor en verde y un sistema inutilizable desde el navegador,
y lo reveló el uso real. Lo mismo con los dos defectos bloqueantes del 4 de agosto, invisibles
para una suite que corre en jsdom porque jsdom no aplica CSS. Verificación y validación no se
sustituyen: cada una encuentra la clase de defectos que a la otra se le escapa.

**Los objetivos medibles se cumplieron.** Satisfacción 89,0 % contra meta de 80 %, 18
participantes externos contra meta de 15, 96,4 % de éxito global por tarea y SUS de 84,2.

**Validar temprano fue lo más rentable que hicimos.** Los tres hallazgos del 20 de junio,
antes de la primera línea de código, entraron como decisiones de diseño y no costaron
prácticamente nada. Los del 4 de agosto obligaron a rehacer la navegación entera. Es el
principio de siempre —el costo de arreglar un defecto crece con la fase en que aparece— pero
verlo en los propios números es distinto que leerlo en un libro.

**La deuda que reconocemos es la falta de integración continua.** El control que pusimos en su
lugar (lint y pruebas obligatorios antes de cada fusión, registrados por escrito) funcionó,
pero es procedimental y depende de la disciplina del equipo. Mecanizarlo con un workflow de
GitHub Actions y servicio PostgreSQL es lo primero que haríamos en una siguiente iteración.

---

## Anexo A — Dónde está cada cosa

| Evidencia | Ubicación |
| --- | --- |
| Estándares, DoD y política de seguridad | `EstandaresdeCodigo.md` |
| Plan por fases, modelo de datos, contrato de API, registro de decisiones | `PLAN.md` |
| Matriz de trazabilidad (64 casos) | `docs/trazabilidad.md` |
| Historias de usuario y criterios de aceptación | `docs/Historias_de_Usuario_Brujula_Vocacional.pdf` |
| EDT y cronograma | `docs/Primer_Entregable_GestionProyectosG6.pdf` |
| Pruebas funcionales (36 peticiones con aserciones) | `docs/postman_collection.json` |
| Diseño y direcciones de arte evaluadas | `DESIGN.md`, `DESIGN_BRIEF.md`, `docs/design/DIRECCIONES.md` |
| Prototipo usado en la sesión del 3/7 | `docs/prototipo.html` |
| Suite del servidor (16 archivos, 108 pruebas) | `server/tests/` |
| Suite del cliente (24 archivos, 106 pruebas) | `client/src/__tests__/` |
| Configuración de análisis estático | `server/.eslintrc.cjs`, `client/.eslintrc.cjs`, `.prettierrc`, `.editorconfig` |
| Migraciones (7) y seeds | `server/migrations/`, `server/seeds/` |
| Entorno reproducible | `docker-compose.yml`, `.env.example`, `README.md` |

## Anexo B — Cómo reproducir la evidencia

```bash
# Preparar el entorno
npm install
cp .env.example server/.env
docker compose up -d db
npm run migrate --workspace server
npm run db:seed --workspace server

# Análisis estático y formato
npm run lint
npm run format:check

# Suite completa (214 pruebas)
npm test

# Pruebas funcionales: importar docs/postman_collection.json en Postman
# y ejecutar la colección contra http://localhost:3000
```
