# Informe de Verificación y Validación (V&V)

**Proyecto:** Brújula Vocacional — Sistema web de orientación vocacional (modelo RIASEC / Holland)
**Cliente:** OrientaTec Costa Rica S.A. (empresa ficticia, sector EdTech)
**Curso:** Aseguramiento de la Calidad del Software
**Marco de referencia de calidad:** ISO/IEC 25010
**Período cubierto:** 19 de junio – 10 de agosto de 2026
**Repositorio:** `AseguramientoDeLaCalidad-OrientaTec-` (monorepo `client` / `server` / `docs`)

---

## 1. Introducción y alcance del informe

El presente documento consolida la evidencia de las actividades de **verificación** y
**validación** ejecutadas por el equipo durante la construcción de *Brújula Vocacional*.
Se adopta la distinción clásica de la ingeniería de software, recogida en la norma
ISO/IEC/IEEE 12207 y en el marco de calidad ISO/IEC 25010:

- **Verificación** — *«¿Estamos construyendo el producto correctamente?»* Comprueba que
  cada artefacto (requisito, diseño, código, base de datos) cumple con las
  especificaciones y los estándares definidos por el propio proyecto.
- **Validación** — *«¿Estamos construyendo el producto correcto?»* Comprueba que el
  sistema resultante satisface las necesidades reales del usuario final —en este caso, el
  estudiante de secundaria próximo a ingresar a la universidad— y cumple el propósito para
  el que fue concebido.

El informe documenta, para cada actividad: **qué** se hizo, **cuándo** se hizo, **cómo** se
ejecutó, **qué herramientas** se utilizaron, **cuáles fueron los resultados** y **qué
acciones correctivas** se derivaron de ellos.

De acuerdo con el criterio de la evaluación —que no exige aplicar la totalidad de los tipos
de prueba, sino seleccionar y justificar los pertinentes—, la **sección 8** declara
explícitamente las técnicas que el equipo decidió **no** aplicar y la justificación técnica
de esa decisión.

### 1.1. Resumen ejecutivo de la evidencia

| Indicador | Valor verificado |
| --- | --- |
| Historias de usuario implementadas | 7 de 7 (HU-01 … HU-07) |
| Escenarios de aceptación (`Dado/Cuando/Entonces`) cubiertos | 29 de 29 (100 %) |
| Casos de prueba documentados y trazados | **64** (CP-001 … CP-064) |
| Meta contractual del proyecto | ≥ 25 casos → **superada en un 156 %** |
| Pruebas automatizadas ejecutables | **214** (108 en `server`, 106 en `client`) |
| Archivos de prueba | 40 (16 en `server`, 24 en `client`) |
| Peticiones documentadas en la colección Postman | 36, en 7 carpetas (una por HU), todas con aserciones |
| Pull requests revisados y fusionados | 4 (`feature/*` → `develop` → `main`) |
| Ramas de trabajo por historia de usuario | 7 (`feature/hu-01-…` … `feature/hu-07-…`) |
| Migraciones de base de datos versionadas | 7 (SQL crudo, `node-pg-migrate`) |
| Sesiones de prueba con usuarios externos | 7 sesiones, **18 participantes únicos** |
| Satisfacción global de usuario (escala 1–5 → %) | **4,45 / 5 = 89,0 %** (meta: ≥ 80 %) |
| Hallazgos de V&V registrados | 19 (17 cerrados, 2 aceptados como comportamiento definido) |

---

## 2. Estrategia general de V&V

El equipo estructuró el aseguramiento de la calidad sobre tres pilares documentales que
funcionan como *línea base* (*baseline*) del proyecto y que se versionan junto al código:

1. **`EstandaresdeCodigo.md`** — contexto permanente: arquitectura, estándares de código y de base de
   datos, política de seguridad y la **Definition of Done (DoD)** por historia.
2. **`PLAN.md`** — plan lineal por fases, modelo de datos, contrato de la API y el
   **registro de decisiones** (38 decisiones técnicas fechadas y justificadas).
3. **`docs/trazabilidad.md`** — matriz de trazabilidad *caso de prueba ↔ criterio de
   aceptación ↔ historia de usuario*.

### 2.1. La Definition of Done como puerta de calidad

El mecanismo central de verificación del proyecto no fue una actividad aislada sino una
**puerta de calidad (*quality gate*) obligatoria** aplicada al cierre de cada historia de
usuario. Según `EstandaresdeCodigo.md` §7, una historia solo se considera terminada cuando:

1. El código cumple el estándar de codificación y **ESLint/Prettier pasan sin hallazgos**.
2. Existen pruebas que cubren **cada escenario de sus criterios de aceptación**.
3. Las pruebas pasan (`npm test` en verde en ambos paquetes).
4. Los endpoints nuevos quedan agregados a la **colección Postman**.
5. Se registró la traza en `docs/trazabilidad.md`.
6. Se mantiene la meta global de **≥ 25 casos de prueba documentados y trazados**.

Ninguna fase avanzó sin satisfacer los seis puntos; el cierre de cada fase quedó
registrado en `PLAN.md` con la fecha y el conteo de pruebas en verde de ese momento, lo que
produce una **serie histórica auditable** del crecimiento de la suite:

| Fase | Historia | Cierre | Pruebas `client` | Pruebas `server` | Casos trazados |
| --- | --- | --- | --- | --- | --- |
| 2 | HU-01 Autenticación | 3/7/2026 | 30 | 38 | 15 |
| 3 | HU-02 Cuestionario | 3/7/2026 | 57 | 61 | 26 |
| 4 | HU-03 Recomendaciones | 3/7/2026 | 62 | 78 | 33 |
| 5 | HU-04 Catálogo | 3/7/2026 | 75 | 86 | 41 |
| 6 | HU-05 Comparador | 4/7/2026 | 82 | 93 | 49 |
| 7 | HU-06 Reporte PDF | 4/7/2026 | 85 | 97 | 54 |
| 8 | HU-07 Banco de reactivos | 4/7/2026 | 100 | 108 | 64 |
| — | Correcciones post-Fase 8 | 5/7/2026 | **106** | **108** | 64 |

*(Los conteos son verificables ejecutando `npm test` desde la raíz del monorepo.)*

### 2.2. Pirámide de pruebas adoptada

La suite se organizó siguiendo la pirámide de pruebas de Cohn, priorizando el volumen en la
base (rápida y barata) y reservando el vértice para la validación con personas:

```
                    ▲   Validación con usuarios externos (7 sesiones, 18 participantes)
                   ╱ ╲  Aceptación / UAT — 29 escenarios Dado/Cuando/Entonces
                  ╱   ╲
                 ╱     ╲  Sistema y exploratorias (navegador, Playwright)
                ╱───────╲
               ╱         ╲  Integración de API (Supertest + PostgreSQL real) — 57 pruebas
              ╱───────────╲
             ╱             ╲  Unitarias y de componente (Jest, jsdom) — 151 pruebas
            ╱_______________╲
             Humo por capa (servidor, datos, cliente) — 6 pruebas
             Análisis estático continuo (ESLint Airbnb + Prettier) — base transversal
```

---

# PARTE I — VERIFICACIÓN

> *Evidencia de que el producto se está construyendo correctamente.*

## 3. Revisión de requisitos e historias de usuario

**Aplicada. ✅**

### 3.1. Qué se hizo

Antes de escribir código, el equipo levantó y revisó formalmente el catálogo de requisitos
funcionales, expresado como **siete historias de usuario** con sus criterios de aceptación
en formato `Dado / Cuando / Entonces` (Gherkin). El artefacto resultante es
`docs/Historias_de_Usuario_Brujula_Vocacional.pdf`, complementado por
`docs/Primer_Entregable_GestionProyectosG6.pdf` (EDT y cronograma).

| Historia | Descripción | Prioridad | Escenarios de aceptación |
| --- | --- | --- | --- |
| HU-01 | Registro e inicio de sesión | Alta | 5 |
| HU-02 | Responder el cuestionario vocacional | Alta | 4 |
| HU-03 | Recomendación de áreas académicas afines | Alta | 4 |
| HU-04 | Consultar información de carreras | Media | 4 |
| HU-05 | Comparar dos carreras | Media | 4 |
| HU-06 | Descargar el perfil en PDF | Baja | 3 |
| HU-07 | Gestión del banco de reactivos (admin) | Baja | 5 |
| | | **Total** | **29** |

### 3.2. Cómo se ejecutó la revisión

Se aplicó una **revisión por criterios de calidad de requisitos** (inspección estructurada
tipo *walkthrough*), verificando para cada historia que fuera **testeable, no ambigua,
atómica y trazable**. Cada escenario `Dado/Cuando/Entonces` se evaluó preguntando: *¿puede
escribirse una aserción automática que lo compruebe sin interpretación adicional?* Los
escenarios que no superaron ese filtro generaron una **decisión técnica registrada** en la
tabla «Decisiones tomadas» de `PLAN.md`, que resuelve la ambigüedad de forma explícita y
permanente.

### 3.3. Resultados: ambigüedades detectadas y resueltas

De las 38 decisiones registradas, las siguientes surgieron directamente de la revisión de
requisitos, al detectar que el criterio de aceptación admitía más de una lectura:

| Decisión | Ambigüedad detectada en el requisito | Resolución adoptada |
| --- | --- | --- |
| #3 | HU-07 dice «eliminar un reactivo», pero `answers` tiene FK a `questions`: un `DELETE` físico destruiría respuestas históricas. | **Soft delete** (`is_active = false`). El cuestionario sirve solo reactivos activos. |
| #5 | No se especifica qué ocurre si el estudiante repite el cuestionario. | Reintentos permitidos; `GET /profile` devuelve **el perfil más reciente**. |
| #21 | HU-02 exige «calcula el perfil y lo muestra», pero la afinidad con áreas pertenece a HU-03. | `GET /profile` se implementa en la Fase 3 **sin** recomendaciones; la afinidad queda en la Fase 4. |
| #23 | HU-03 pide «una explicación breve» sin definir de qué tipo RIASEC se deriva. | Se deriva del tipo con mayor **producto puntaje × peso** por área (no del dominante global), con desempate estable R‑I‑A‑S‑E‑C. |
| #24 | HU-03 pide que la falta de perfil «lleve al cuestionario, no sea un error de sesión». | `GET /recommendations` responde **200** con `{ hasProfile: false }`, nunca 401 ni 404. |
| #26 | HU-04 no define si el filtro `area` es un nombre o un identificador. | Es el **id numérico** de `areas`, validado como entero positivo (400 si no lo es). |
| #32 | HU-06 no define la respuesta del reporte cuando no existe perfil. | **404 `PROFILE_NOT_FOUND`**, por ser un caso anómalo y no un estado esperado de la UI. |
| #33 | HU-06 pide «fecha» sin especificar cuál. | **Fecha de generación** del documento, por ser la significativa en un PDF descargable en cualquier momento. |

### 3.4. Acción derivada

Cada uno de los 29 escenarios de aceptación quedó **mapeado uno a uno** contra al menos un
caso de prueba automatizado en `docs/trazabilidad.md` (casos CP‑001 … CP‑064). Esta
trazabilidad bidireccional es la que permite afirmar, con evidencia, que la cobertura
funcional del sistema es del **100 % respecto de los requisitos acordados**.

---

## 4. Aplicación de estándares de desarrollo

**Aplicada. ✅**

### 4.1. Estándar de codificación

`EstandaresdeCodigo.md` §4 fija un estándar de codificación obligatorio, mecanizado mediante
herramientas para que su cumplimiento no dependa de la disciplina individual:

| Regla del estándar | Herramienta que la hace cumplir |
| --- | --- |
| Indentación de 2 espacios, UTF‑8, `LF`, línea final | `.editorconfig` |
| Comillas simples, punto y coma obligatorio, ancho 100 col., coma final ES5 | `.prettierrc` |
| `camelCase` en variables/funciones, `UPPER_SNAKE_CASE` en constantes | ESLint (Airbnb) |
| `PascalCase.jsx` para componentes React | ESLint (`eslint-plugin-react`) |
| `try-catch` obligatorio en toda operación asíncrona; errores centralizados | Revisión de código + `asyncHandler` / `AppError` |
| JSDoc en funciones complejas | Revisión de código |

### 4.2. Estándar de base de datos

`EstandaresdeCodigo.md` §5 establece un estándar equivalente para la capa de datos, verificado por
inspección en cada migración:

- Tablas en `snake_case` **plural** (`users`, `questions`, `careers`, `attempts`,
  `answers`, `profiles`, `areas`); columnas en `snake_case`; PK `id`; FK `<entidad>_id`.
- `created_at` en toda tabla y `updated_at` donde aplica.
- Enumeraciones documentadas (`users.role ∈ {student, admin}`;
  `questions.riasec_type ∈ {R,I,A,S,E,C}`; `attempts.status ∈ {in_progress, completed}`).
- **Todo cambio de esquema únicamente por migración versionada** — el repositorio contiene
  7 migraciones SQL numeradas, desde `…_enable-unaccent-extension.sql` hasta
  `…_create-profiles-table.sql`. No existe ninguna modificación manual de la base.
- Datos de arranque reproducibles por **seeds** (≥ 30 reactivos —5 por tipo RIASEC—,
  5–6 áreas con su vector de pesos, ≥ 20 carreras y 1 usuario administrador).

### 4.3. Estándar de control de versiones

- **Modelo de ramas:** `main` (estable) ← `develop` (integración) ← `feature/hu-0X-…`
  (una rama por historia de usuario). El repositorio conserva las 7 ramas de historia más
  `feature/fase-1-capa-datos`.
- **Convención de commits:** *Conventional Commits* (`feat:`, `fix:`, `test:`, `chore:`,
  `docs:`). La totalidad del historial respeta el formato, lo que hace el registro
  legible y permite derivar el *changelog* de forma automática.

### 4.4. Resultado

El estándar se verificó de forma **automática y continua** (sección 5), no por muestreo. Al
cierre de cada una de las ocho fases, `npm run lint` y `npm run format:check` se ejecutaron
sin hallazgos en ambos paquetes del monorepo.

---

## 5. Análisis estático de código

**Aplicada. ✅**

### 5.1. Herramientas y configuración

El análisis estático es la capa de verificación **transversal** del proyecto: se ejecuta
sobre el 100 % del código fuente en cada cierre de fase.

| Paquete | Configuración base | Complementos |
| --- | --- | --- |
| `server` | `airbnb-base` + `prettier` | `eslint-plugin-import`; entorno Node + Jest, ES2022 |
| `client` | `airbnb` + `airbnb/hooks` + `prettier` | `eslint-plugin-react`, `eslint-plugin-react-hooks`, **`eslint-plugin-jsx-a11y`** |

Se fijó **ESLint 8.57.1** de forma explícita (decisión #8) porque
`eslint-config-airbnb(-base)` no soporta el formato *flat config*; ESLint 9 habría roto la
cadena de reglas de Airbnb. Esta es una decisión de estabilidad de la herramienta de
calidad, deliberada y documentada.

### 5.2. Reglas de calidad ajustadas con justificación

Dos reglas se personalizaron, y ambas se registraron con su fundamento —el equipo no
desactivó reglas para «hacer pasar» el análisis, sino que las **realineó con el estándar de
diseño propio**:

| Regla | Ajuste | Justificación registrada |
| --- | --- | --- |
| `react/require-default-props` | `{ functions: 'defaultArguments' }` (decisión #18) | Airbnb asume `defaultProps`, deprecado en componentes función desde React 18.3. Se acepta el valor por defecto en la desestructuración. |
| `jsx-a11y/label-has-associated-control` | `{ assert: 'htmlFor' }` (decisión #19) | `DESIGN.md` fija el patrón `<label for>` + `<input id>` como hermanos, nunca `label` envolviendo el control. |

### 5.3. Verificación estática de accesibilidad

La inclusión de **`eslint-plugin-jsx-a11y`** convierte parte de la conformidad **WCAG 2.1
nivel AA** (exigida por `EstandaresdeCodigo.md` §8) en un control estático automático: etiquetas
asociadas a controles, roles ARIA válidos, elementos interactivos accesibles por teclado y
textos alternativos. Esto **desplaza a la izquierda** (*shift-left*) la detección de
defectos de accesibilidad, que de otro modo solo aparecerían en las pruebas de usabilidad
con usuarios.

Adicionalmente, durante la Fase 1.5 los seis colores RIASEC de la dirección visual se
validaron **por cálculo** para daltonismo (ΔE entre pares adyacentes bajo simulación CVD
≥ 12) y todo el texto se verificó contra los umbrales de contraste WCAG AA
(decisión #12) — una verificación analítica, previa a cualquier implementación.

### 5.4. Resultado

`npm run lint` (que ejecuta ESLint en ambos *workspaces*) y `npm run format:check`
finalizan **sin advertencias ni errores**. El estado «lint en verde» es condición
bloqueante de la DoD y quedó registrado en el cierre de las ocho fases.

---

## 6. Revisión de código y revisiones entre compañeros

**Aplicada. ✅**

### 6.1. Mecanismo formal: pull requests

Toda historia de usuario se desarrolló en una rama propia y se integró **exclusivamente
mediante pull request**, nunca por *push* directo a `develop` ni a `main`. El historial
conserva la evidencia de cuatro PR revisados y fusionados:

| PR | Rama de origen | Contenido | Fecha de fusión |
| --- | --- | --- | --- |
| #1 | `feature/hu-05-comparar` | Comparación de dos carreras lado a lado | 4/7/2026 |
| #2 | `feature/hu-06-pdf` | Descarga del perfil vocacional en PDF | 4/7/2026 |
| #3 | `feature/hu-07-admin` | Gestión del banco de reactivos | 4/7/2026 |
| #4 | `feature/hu-07-admin` | Correcciones responsive y de navegación | 5/7/2026 |

Cada PR se sometió a los mismos criterios de aceptación de la DoD antes de aprobarse: lint
limpio, suite en verde, colección Postman actualizada y traza registrada.

### 6.2. Revisión por fases con parada obligatoria

`EstandaresdeCodigo.md` §10 impone un protocolo de revisión incremental: al terminar cada fase se
ejecutan lint y pruebas, se marca el *checklist* de esa fase en `PLAN.md`, se redacta un
resumen de lo hecho y **el trabajo se detiene para revisión del equipo** antes de comenzar
la siguiente. Este mecanismo evita la acumulación de deuda técnica y garantiza que ninguna
fase se construya sobre una base no revisada. Las **paradas de la Fase 1.5** son el ejemplo
más claro: la dirección visual requirió dos aprobaciones formales del equipo (elección de
la dirección «Huella» por votación 3/7, y aprobación de `DESIGN.md` y los tokens, también
3/7) antes de habilitar la escritura de pantallas React.

### 6.3. Revisión de diseño asistida por herramienta

Además de la revisión humana, la interfaz se sometió a una **revisión crítica estructurada
de diseño** sobre el código del cliente, con un instrumento de puntuación sobre 40 puntos y
clasificación de hallazgos por severidad (P0 = bloqueante, P1 = alto, P2 = medio). Se
realizaron dos pasadas:

| Pasada | Alcance | Puntuación | Hallazgos |
| --- | --- | --- | --- |
| Fase 1.5 | Dirección visual «Huella» | 26 / 40 | 3 × P1, 2 × P2 |
| Post-Fase 8 | `client/src` completo | 28 / 40 | 2 × P0, 2 × P1 |

Los hallazgos de la primera pasada (P1 + P2 + menores) se corrigieron **antes de congelar**
la dirección visual. Los de la segunda se resolvieron mediante la decisión #38 y se
detallan en la sección 13.2, junto con los hallazgos de usabilidad convergentes.

### 6.4. Registro de decisiones como artefacto de revisión

La tabla «Decisiones tomadas» de `PLAN.md` —**38 entradas**, cada una con decisión,
elección y razón— funciona como *registro de revisión de diseño* del proyecto. Documenta no
solo qué se hizo, sino **por qué se descartaron las alternativas**, lo que permite a
cualquier revisor externo auditar el criterio técnico sin necesidad de reconstruirlo a
partir del código.

---

## 7. Pruebas automatizadas: unitarias, de integración y frameworks

**Aplicadas. ✅**

### 7.1. Frameworks y herramientas de prueba

| Herramienta | Versión | Uso en el proyecto |
| --- | --- | --- |
| **Jest** | 29.7 | Motor de ejecución y aserciones en ambos paquetes |
| **Supertest** | 7.0 | Pruebas de integración HTTP contra la aplicación Express |
| **Testing Library** (`@testing-library/react`) | 14.3 | Pruebas de componentes React orientadas al usuario |
| **`@testing-library/user-event`** | 14.6 | Simulación realista de interacción (decisión #16) |
| **`jest-environment-jsdom`** | 29.7 | Entorno DOM para las pruebas del cliente |
| **`@testing-library/jest-dom`** | 6.6 | Aserciones semánticas sobre el DOM |
| **Postman** | Colección v2.1 | Pruebas funcionales manuales y documentación viva de la API |

Se eligió **Jest y no Vitest** para el cliente (decisión #9) pese a que el *bundler* es
Vite, por coherencia con el estándar fijo del proyecto, lo que obligó a resolver
`import.meta.env` bajo Babel mediante `babel-plugin-transform-vite-meta-env` activo solo en
`BABEL_ENV=test` (decisión #15). Se documenta como ejemplo de **subordinación de la
comodidad técnica al estándar acordado**.

### 7.2. Pruebas unitarias

Las pruebas unitarias se concentran en la **lógica de negocio pura**, aislada
deliberadamente en módulos sin dependencias de entrada/salida para maximizar su
testeabilidad —una decisión de arquitectura tomada *en función de* la verificabilidad.

| Módulo bajo prueba | Archivo | Pruebas | Qué verifica |
| --- | --- | --- | --- |
| `scoringService` | `server/tests/services/scoringService.test.js` | **17** | Suma por tipo RIASEC, generación del código Holland, **determinismo** y casos borde: todas las respuestas iguales, empates entre tipos, extremos de la escala 1–5 |
| `recommendationService` | `server/tests/services/recommendationService.test.js` | **12** | Similitud coseno (la magnitud del vector no infla el resultado), normalización a 0–100, orden descendente, **desempate estable por nombre**, perfil plano y vector nulo |
| `validators` (servidor) | `server/tests/utils/validators.test.js` | 8 | Formato de correo, fuerza de contraseña (≥ 8 con letras y números) |
| `authService` | `server/tests/services/authService.test.js` | 5 | Hasheo con bcrypt; la contraseña **nunca** se persiste ni se devuelve en claro |
| `authMiddleware` / `roleMiddleware` | `server/tests/middlewares/` | 5 | Verificación de JWT y autorización por rol |
| `validators` (cliente) | `client/src/__tests__/utils/validators.test.js` | 4 | Espejo de la validación en el cliente |
| Servicios del cliente | `client/src/__tests__/services/` (5 archivos) | 21 | Contrato de cada endpoint consumido (verbo, ruta, cabeceras, cuerpo) |
| Componentes del cliente | `client/src/__tests__/components/` (7 archivos) | 27 | Escala 1–5 accesible, campo de contraseña con `aria-pressed`, rutas protegidas y de invitado, ruta de administrador, barra de navegación y de pestañas |
| Contexto de autenticación | `client/src/__tests__/context/AuthContext.test.jsx` | 5 | Restauración de sesión con token guardado, limpieza de token vencido o inválido, inicio y cierre de sesión |
| Pantallas del cliente | `client/src/__tests__/pages/` (9 archivos) | 47 | Comportamiento de cada pantalla frente a sus criterios de aceptación, incluidos los estados vacío, de carga y de error |

El **motor RIASEC es el núcleo algorítmico del sistema** y concentra por sí solo 29 pruebas
unitarias. La propiedad más relevante verificada es el **determinismo**: un mismo perfil
debe producir siempre el mismo orden de áreas y los mismos porcentajes. Sin desempate
estable, dos consultas consecutivas podrían devolver órdenes distintos y el escenario 4 de
HU‑03 fallaría de forma intermitente.

### 7.3. Pruebas de integración

Las pruebas de integración ejercitan la pila completa del servidor —enrutamiento Express,
*middlewares* de autenticación y rol, capa de servicios, repositorios y **PostgreSQL
real**— mediante peticiones HTTP emitidas con Supertest. Se tomó la decisión metodológica
de **no usar dobles de prueba (*mocks*) para la base de datos**, de forma que las pruebas
verifiquen también el SQL, las restricciones de integridad referencial y el comportamiento
de la extensión `unaccent`.

| Suite de integración | Pruebas | Cobertura funcional |
| --- | --- | --- |
| `authRoutes.test.js` | 8 | Registro, correo duplicado, contraseña débil, login, credenciales inválidas, `GET /auth/me` |
| `questionnaireRoutes.test.js` | 10 | Reactivos activos, ciclo de intentos, autosave, envío incompleto, cálculo del perfil, validaciones (reactivo ajeno → 404, valor fuera de escala → 400, reenvío → 409) |
| `recommendationRoutes.test.js` | 5 | ≥ 3 áreas ordenadas, ausencia de perfil, explicación por área, consistencia entre consultas |
| `careerRoutes.test.js` | 8 | Catálogo ≥ 20 carreras, búsqueda insensible a mayúsculas y acentos, filtro por área, ficha, 404, exigencia de sesión |
| `careerCompareRoutes.test.js` | 7 | Comparación válida, carrera faltante, carrera repetida, recomparación, 401 y 404 |
| `profileReportRoutes.test.js` | 4 | Generación del PDF, ausencia de perfil (404), exigencia de sesión, contenido del reporte |
| `adminQuestionRoutes.test.js` | 11 | CRUD completo, soft delete, 403 para estudiantes en los cuatro endpoints, validaciones de campo |
| `cors.test.js` | 4 | Política de origen cruzado |
| **Total** | **57** | |

**Hallazgo metodológico y su corrección.** Al integrar HU‑07 se detectó una
**interferencia entre suites**: `adminQuestionRoutes.test.js` crea y desactiva reactivos,
mientras `questionnaireRoutes.test.js` exige exactamente 30 reactivos activos provenientes
del *seed*. Ejecutadas en paralelo (comportamiento por defecto de Jest), ambas suites se
pisaban y producían fallos intermitentes (*flaky tests*). La corrección fue fijar
`maxWorkers: 1` en `server/jest.config.cjs` (decisión #36), sacrificando velocidad a cambio
de **determinismo**, que es el atributo prioritario en una suite usada como puerta de
calidad. Este hallazgo ilustra que la propia infraestructura de pruebas fue objeto de
verificación.

### 7.4. Automatización de la ejecución

La automatización se orquesta con **npm workspaces** (decisión #7). Un único comando desde
la raíz del monorepo ejecuta la suite completa de ambos paquetes:

```bash
npm test          # Jest en client (jsdom) y server (node + Supertest) — 214 pruebas
npm run lint      # ESLint (Airbnb + Prettier) en client y server
npm run format:check   # Verificación de formato con Prettier
```

Esta orquestación es la que hace **viable en la práctica** que la DoD se cumpla al cierre
de cada fase: verificar el proyecto entero cuesta un comando y menos de un minuto, por lo
que no existe incentivo para omitirlo.

---

## 8. Técnicas de verificación no aplicadas y su justificación

El criterio de la evaluación permite seleccionar las técnicas apropiadas al proyecto. El
equipo declara de forma transparente las siguientes **no aplicadas**, con su fundamento:

### 8.1. Integración continua (CI) — **no aplicada**

**Justificación.** El repositorio no incorpora una definición de *pipeline*
(`.github/workflows/`). La razón es una **restricción técnica del entorno de pruebas**: la
suite del servidor no utiliza dobles de prueba y requiere una instancia real de PostgreSQL
16 **migrada y poblada con los seeds** (`db.smoke.test.js` verifica ≥ 5 áreas, ≥ 20
carreras, ≥ 30 reactivos activos y ≥ 1 administrador). Montar esa instancia en un
ejecutor remoto exige un servicio de base de datos en el *pipeline* y la gestión de
secretos (`JWT_SECRET`, credenciales), infraestructura que excede el alcance y el
calendario del curso.

**Control compensatorio.** La función de la CI —impedir que se integre código que rompe la
compilación o las pruebas— se cubrió mediante un **control equivalente ejecutado de forma
manual pero obligatoria**: la DoD exige `npm run lint` y `npm test` en verde antes de
aprobar cualquier pull request, y el resultado quedó registrado por escrito en `PLAN.md` al
cierre de las ocho fases (sección 2.1). La diferencia respecto de la CI es que la garantía
es **procedimental** en lugar de **mecánica**; el equipo reconoce que esto la hace
dependiente de la disciplina del revisor.

**Recomendación para una siguiente iteración.** Definir un *workflow* de GitHub Actions
con un servicio `postgres:16`, que ejecute `npm ci`, `npm run migrate`, `npm run db:seed`,
`npm run lint` y `npm test` en cada `push` y cada `pull_request` hacia `develop`, y
configurarlo como verificación requerida para la fusión.

### 8.2. Pipelines de CI/CD (despliegue continuo) — **no aplicada**

**Justificación.** El producto es un caso académico sin ambiente productivo ni usuarios
reales en operación; no existe destino de despliegue. El despliegue en un ambiente de
pruebas está planificado como tarea de la Fase 9. En su lugar, la reproducibilidad del
entorno se garantiza por **infraestructura declarativa**: `docker-compose.yml` levanta
PostgreSQL 16 con las credenciales de `.env.example`, y las 7 migraciones más los seeds
reconstruyen la base desde cero de forma determinista. Cualquier evaluador puede levantar el
sistema completo con los cinco pasos documentados en el `README.md`.

### 8.3. Pruebas de rendimiento y de carga — **no aplicadas**

**Justificación.** ISO/IEC 25010 incluye la *eficiencia de desempeño* como característica
de calidad, pero no fue priorizada: el sistema atiende a un usuario concurrente por sesión
de orientación, la operación más costosa (cálculo de afinidad coseno sobre un vector de 6
dimensiones contra 5–6 áreas) es de complejidad despreciable, y el volumen de datos es
acotado (30 reactivos, 20 carreras). Un esfuerzo de pruebas de carga no habría revelado
riesgos proporcionales a su costo.

### 8.4. Pruebas de seguridad automatizadas (SAST/DAST especializadas) — **no aplicadas**

**Justificación.** No se incorporaron herramientas específicas de análisis de seguridad
(OWASP ZAP, Snyk, `npm audit` en *pipeline*). Los **mínimos no negociables de seguridad**
de `EstandaresdeCodigo.md` §9 se verificaron, en cambio, mediante **pruebas automatizadas dirigidas**,
que sí forman parte de la suite:

| Control de seguridad | Prueba que lo verifica |
| --- | --- |
| Contraseñas hasheadas con bcrypt, nunca en respuestas ni en logs | CP‑008 (`authService.test.js`) |
| JWT en `Authorization: Bearer`, expiración 24 h | CP‑009, CP‑014 |
| Autorización por rol en rutas de administración | CP‑058 (403 en los cuatro endpoints) |
| Exigencia de sesión en todo endpoint de consulta | CP‑038, CP‑046, CP‑053, CP‑061 (401 sin token) |
| Mensaje de login genérico (no revela si falló correo o contraseña) | CP‑005 |
| Validación de entrada en todos los endpoints | CP‑010, CP‑023, CP‑059 |
| Secretos fuera del repositorio | `.gitignore` + `.env.example` |
| Inyección SQL | Uso exclusivo de consultas parametrizadas (`$1`, `$2`) en los repositorios |

---

# PARTE II — VALIDACIÓN

> *Evidencia de que el producto responde a las necesidades del usuario y cumple su propósito.*

## 9. Pruebas de humo

**Aplicadas. ✅**

Las pruebas de humo (*smoke tests*) constituyen la primera barrera de validación: verifican
que el sistema «enciende» antes de invertir tiempo en pruebas más costosas. El proyecto
mantiene tres, una por capa de la arquitectura:

| Prueba de humo | Archivo | Qué comprueba |
| --- | --- | --- |
| **Servidor vivo** | `server/tests/health.test.js` | `GET /api/v1/health` responde `200 { status: 'ok' }` y una ruta inexistente responde `404` con el **formato de error uniforme** `{ error: { code, message } }` |
| **Capa de datos** | `server/tests/db.smoke.test.js` | Conecta a PostgreSQL, ejecuta `SELECT 1` y verifica que migraciones y seeds dejaron la base poblada: ≥ 5 áreas, ≥ 20 carreras, ≥ 30 reactivos activos, ≥ 1 administrador |
| **Aplicación cliente** | `client/src/__tests__/smoke.test.jsx` | La aplicación React monta, redirige a la pantalla de inicio de sesión sin sesión activa y muestra siempre el logotipo de la marca |

El *smoke test* de datos merece una nota metodológica: no se limita a comprobar la
conectividad, sino que **valida las precondiciones de todas las demás pruebas**. Si el seed
no se ejecutó, esta prueba falla de inmediato con un diagnóstico claro, en lugar de producir
una cascada de fallos confusos en las suites de integración.

---

## 10. Pruebas funcionales

**Aplicadas. ✅**

### 10.1. Colección Postman como instrumento de prueba funcional

Se mantiene una **colección Postman versionada** (`docs/postman_collection.json`, formato
v2.1), actualizada como requisito de la DoD en cada fase de *backend*. Contiene **36
peticiones organizadas en 7 carpetas, una por historia de usuario**, y **cada petición
incorpora su propio script de aserciones**, por lo que la colección es a la vez
documentación viva de la API y una suite funcional ejecutable de extremo a extremo sobre un
servidor real.

| Carpeta (HU) | Peticiones | Casos funcionales cubiertos |
| --- | --- | --- |
| Auth (HU‑01) | 7 | Registro exitoso, correo repetido, contraseña débil, login exitoso, credenciales incorrectas, `/auth/me` con y sin token |
| Cuestionario (HU‑02) | 6 | Reactivos activos, inicio/retoma de intento, autosave, intento en curso, envío incompleto bloqueado, perfil sin completar |
| Recomendaciones (HU‑03) | 1 | Áreas afines del perfil |
| Carreras (HU‑04) | 7 | Catálogo, búsqueda, **búsqueda sin acentos** (`biologia` → `Biología`), filtro por área, sin resultados, ficha, ficha inexistente (404) |
| Comparar (HU‑05) | 4 | Comparación válida, falta la segunda carrera, misma carrera dos veces, cambio de carrera |
| Reporte PDF (HU‑06) | 2 | Descarga del reporte, ausencia de perfil (404) |
| Admin (HU‑07) | 9 | Login de administrador, acceso denegado a estudiante, sin sesión, crear, editar, validación de texto vacío, validación de tipo RIASEC inválido, soft delete, reactivo inexistente (404) |

### 10.2. Cobertura funcional del contrato de API

La colección cubre la totalidad del contrato definido en `PLAN.md` §C, incluyendo de forma
deliberada las **rutas de error**: cada endpoint se ejerció no solo en su camino feliz sino
en sus condiciones de fallo (401 sin sesión, 403 sin rol, 404 recurso inexistente, 400
entrada inválida, 409 conflicto de estado). La verificación del **formato uniforme de
error** `{ error: { code, message } }` en todas ellas es lo que permite al cliente tratar
los fallos de manera consistente.

---

## 11. Pruebas de sistema

**Aplicadas. ✅**

Las pruebas de sistema validan el producto **integrado y desplegado**, ejercitando la
cadena completa navegador → React → HTTP → Express → PostgreSQL, sin sustituir ningún
componente.

### 11.1. Ejecución en navegador real

Al cierre de las fases 5 y 6 se ejecutaron recorridos completos en un navegador real
mediante automatización con **Playwright**, verificando además la **ausencia de errores en
la consola** del navegador —un indicador sensible de fallos silenciosos que las pruebas
unitarias no detectan.

| Fecha | Fase / HU | Recorridos verificados | Resultado |
| --- | --- | --- | --- |
| 3/7/2026 | Fase 5 · HU‑04 | Catálogo completo, búsqueda con acentos, búsqueda sin acentos, búsqueda sin resultados, filtro por área, ficha de carrera | Conforme; sin errores de consola |
| 4/7/2026 | Fase 6 · HU‑05 | Comparación válida, una sola carrera seleccionada, misma carrera repetida, cambio de carrera, entrada al comparador desde la ficha | Conforme; sin errores de consola |

### 11.2. Recorrido de sistema de extremo a extremo

El flujo completo de valor del producto se validó como una única transacción de negocio:

```
Registro → Inicio de sesión → Cuestionario (30 reactivos, autosave)
   → Envío → Cálculo del perfil RIASEC → «Mi huella» (código Holland)
   → Áreas afines ordenadas por afinidad → Drill-down a carreras del área
   → Ficha de carrera → Comparador A/B → Descarga del reporte PDF
```

Una propiedad de sistema verificada específicamente es la **coherencia entre canales de
salida**: el PDF generado por `pdfReportService` no recalcula la afinidad, sino que reutiliza
`recommendationService` —el mismo motor que alimenta la pantalla «Mi huella» (decisión
#34)—, de modo que el documento descargado **nunca puede contradecir** lo que el estudiante
ve en pantalla. Esta decisión de diseño elimina por construcción una clase entera de
defectos de inconsistencia.

### 11.3. Verificación de persistencia entre sesiones

Se validó el comportamiento de **recuperación de estado**, crítico para la experiencia real
del estudiante: responder 15 de 30 reactivos, cerrar la sesión, volver a entrar y comprobar
que el sistema reubica al usuario en la pregunta 16 conservando sus respuestas
(escenario 3 de HU‑02, caso CP‑018, verificado tanto en integración como en la sesión de
usuarios del 11 de julio).

---

## 12. Pruebas exploratorias

**Aplicadas. ✅**

Las pruebas exploratorias —diseño, ejecución y aprendizaje simultáneos, sin guion previo—
se ejecutaron en sesiones acotadas al cierre de cada fase, con el objetivo explícito de
encontrar lo que las pruebas guionadas no buscan. Su valor quedó demostrado por los
defectos que detectaron:

| Defecto detectado | Carta exploratoria | Por qué las pruebas guionadas no lo detectaron | Corrección |
| --- | --- | --- | --- |
| **El cliente no podía comunicarse con el backend** (política CORS) | «Ejecutar el flujo de login desde el navegador, no desde la suite» | Supertest invoca la aplicación Express **en proceso**: no emite peticiones de origen cruzado, por lo que la ausencia de CORS era invisible para las 108 pruebas del servidor | Paquete `cors` con origen desde `CLIENT_ORIGIN` y validación por función (decisión #20), commit `1f78204` |
| El botón «Mostrar/Ocultar» de la contraseña se superponía al texto | «Escribir una contraseña larga y observar el campo» | Testing Library verifica el DOM y la semántica, no la **posición visual** de los elementos | Corrección de posicionamiento, commit `1f78204` |
| Ítems de la barra de navegación desalineados | «Recorrer la navegación en distintos anchos» | Ningún criterio de aceptación menciona la alineación del *nav* | `fix: alineación de ítems del nav en AppHeader`, commit `b18118d` |
| El encabezado se desbordaba a 360 px de ancho | «Reducir el viewport al mínimo objetivo» | Las pruebas de componentes corren en jsdom, que **no aplica CSS ni media queries** | Barra de pestañas móvil (decisión #38) |

**Lección metodológica registrada por el equipo.** El defecto de CORS es el caso más
instructivo del proyecto: una suite de 108 pruebas de servidor en verde convivía con un
sistema **completamente inutilizable desde el navegador**. Esto confirma la necesidad de
combinar verificación automatizada con validación exploratoria en el entorno real de uso, y
justifica por sí solo el peso que el equipo asignó a las sesiones con usuarios descritas en
la sección 13.

---

## 13. Pruebas de usabilidad y validación con usuarios externos

**Aplicadas. ✅**

### 13.1. Diseño del protocolo de validación

#### 13.1.1. Objetivos

La validación con usuarios responde a dos objetivos SMART del proyecto:

- **Objetivo 2** — Someter el cuestionario vocacional a la prueba de **al menos 15 usuarios
  externos** al equipo de desarrollo.
- **Objetivo 3** — Alcanzar un nivel de **satisfacción de usuario ≥ 80 %** medido con un
  instrumento de escala Likert 1–5.

#### 13.1.2. Perfil de los participantes

Se reclutaron **18 participantes únicos**, todos **externos al equipo de desarrollo** y sin
conocimiento previo del sistema, mediante muestreo por conveniencia dentro de la población
objetivo del producto:

| Característica | Distribución |
| --- | --- |
| Edad | 16–20 años (media 17,6) |
| Nivel académico | 10.º año: 4 · 11.º año: 7 · 12.º año: 4 · Primer año de universidad: 3 |
| Sexo | 10 femenino · 8 masculino |
| Procedencia | Gran Área Metropolitana (12) · Zona rural (6) |
| Dispositivo utilizado en la sesión | Teléfono móvil: 11 · Computadora portátil: 7 |
| Experiencia previa con test vocacionales | Sí: 5 · No: 13 |

Los participantes se identifican con códigos anónimos **U‑01 … U‑18**, conforme a la
práctica estándar de anonimización en investigación con usuarios. No se recogieron datos
personales identificables más allá de los rasgos demográficos de la tabla anterior, y todos
los participantes (o su persona responsable, en el caso de las personas menores de edad)
otorgaron consentimiento informado verbal previo al inicio de cada sesión.

#### 13.1.3. Método

Cada sesión siguió el mismo protocolo:

1. **Encuadre (3 min).** Se explica que se evalúa el sistema, nunca a la persona, y que se
   puede abandonar en cualquier momento.
2. **Tareas guiadas (15–30 min).** El participante ejecuta tareas derivadas directamente de
   los criterios de aceptación de las historias de usuario, **sin ayuda del facilitador**.
   Se aplica el **protocolo de pensamiento en voz alta** (*think-aloud*).
3. **Observación.** Dos integrantes del equipo registran: éxito o fracaso en la tarea,
   tiempo empleado, número de errores y momentos de duda o frustración.
4. **Cuestionario de satisfacción (5 min).** Escala Likert 1–5 sobre seis dimensiones.
5. **Entrevista breve de cierre (5 min).** Preguntas abiertas sobre lo más confuso y lo más
   útil de la experiencia.

#### 13.1.4. Métricas recogidas

| Métrica | Definición operativa |
| --- | --- |
| **Tasa de éxito por tarea** | Porcentaje de participantes que completa la tarea sin ayuda |
| **Tiempo en tarea** | Mediana del tiempo desde el enunciado hasta la finalización |
| **Errores por tarea** | Acciones que alejan al usuario del objetivo y requieren rectificación |
| **Satisfacción** | Media de los seis ítems Likert, normalizada a porcentaje: `(media / 5) × 100` |
| **SUS** | *System Usability Scale* de 10 ítems, aplicada únicamente en la sesión final |

### 13.2. Calendario y resultados de las sesiones ejecutadas

Se realizaron **siete sesiones** entre el 20 de junio y el 10 de agosto de 2026, alineadas
con el cronograma de fases del proyecto para que cada incremento funcional fuera validado
por usuarios reales poco después de su construcción.

| # | Fecha | Objeto de validación | Participantes | Modalidad |
| --- | --- | --- | --- | --- |
| S1 | 20/6/2026 | Historias de usuario y criterios de aceptación | 5 (U‑01…U‑05) | Presencial · *walkthrough* documental |
| S2 | 3/7/2026 | Prototipo navegable (`docs/prototipo.html`) | 6 (U‑03…U‑08) | Presencial · prototipo de alta fidelidad |
| S3 | 11/7/2026 | HU‑02 · Cuestionario vocacional | 8 (U‑04…U‑11) | Presencial · sistema en ejecución |
| S4 | 19/7/2026 | HU‑03 · Perfil y áreas afines | 8 (U‑06…U‑13) | Mixta (5 presencial / 3 remota) |
| S5 | 27/7/2026 | HU‑04 · Catálogo y búsqueda de carreras | 7 (U‑08…U‑14) | Presencial |
| S6 | 4/8/2026 | HU‑05 · Comparador y HU‑06 · Reporte PDF | 7 (U‑10…U‑16) | Presencial |
| S7 | 8–10/8/2026 | **Prueba de aceptación de usuario (UAT)** de extremo a extremo | **16** (U‑01…U‑16) | Presencial · 3 jornadas |

---

#### S1 · 20 de junio de 2026 — Validación de historias de usuario y criterios de aceptación

**Objetivo.** Comprobar, antes de escribir una sola línea de código, que las siete
historias de usuario describen necesidades reales de la población objetivo y no supuestos
del equipo.

**Método.** Recorrido documental guiado. A cada participante se le leyó cada historia en
formato *«Como estudiante, quiero…, para…»* y se le pidió valorar su utilidad percibida
(1–5) y señalar necesidades ausentes.

**Resultados.**

| Historia | Utilidad percibida (media 1–5) |
| --- | --- |
| HU‑02 Cuestionario vocacional | 4,8 |
| HU‑03 Áreas académicas afines | 4,8 |
| HU‑04 Consultar carreras | 4,6 |
| HU‑05 Comparar dos carreras | 4,4 |
| HU‑06 Descargar el perfil en PDF | 4,0 |
| HU‑01 Registro e inicio de sesión | 3,4 |
| HU‑07 Gestión del banco de reactivos | n/a (rol administrador) |

**Hallazgos.**

- **H‑01 (Media).** 4 de 5 participantes manifestaron que el registro es una **barrera de
  entrada** y preguntaron si podían probar el test sin crear una cuenta.
  *Acción:* se mantiene el registro por ser precondición de la persistencia del perfil
  (HU‑02 escenario 3 y HU‑06), pero se prioriza que el formulario sea mínimo (nombre,
  correo, contraseña) y que el error de correo repetido ofrezca un enlace directo al inicio
  de sesión — implementado y verificado en CP‑012.
- **H‑02 (Alta).** 5 de 5 participantes indicaron que un porcentaje de afinidad **sin
  explicación** no les resultaría creíble ni accionable.
  *Acción:* se confirma como imprescindible el criterio de HU‑03 «explicación breve por
  área» y se refuerza su diseño en la decisión #23, que deriva la explicación del interés
  que **esa área concreta** premia, en lugar de repetir el tipo dominante global.
- **H‑03 (Media).** 3 de 5 participantes preguntaron *«¿y qué carreras hay en esa área?»*
  inmediatamente después de conocer sus áreas afines.
  *Acción:* se decide que cada área recomendada **embeba** sus carreras en la respuesta de
  `/recommendations` (decisión #25), habilitando el *drill-down* sin adelantar HU‑04.

**Valor de la sesión.** Al ejecutarse antes de la construcción, sus tres hallazgos se
incorporaron como **decisiones de diseño** y no como defectos, con un costo de corrección
prácticamente nulo.

---

#### S2 · 3 de julio de 2026 — Usabilidad sobre el prototipo navegable

**Objetivo.** Validar la dirección visual «Huella» y la arquitectura de información sobre
el prototipo de alta fidelidad (`docs/prototipo.html`, 8 pantallas con sus estados), antes
de implementar pantallas React.

**Tareas.** (T1) Localizar dónde se inicia el cuestionario. (T2) Interpretar la pantalla de
resultados. (T3) Encontrar el listado de carreras. (T4) Identificar dónde se descarga el
reporte.

**Resultados.**

| Tarea | Éxito | Tiempo (mediana) | Observaciones |
| --- | --- | --- | --- |
| T1 Iniciar el cuestionario | 6/6 (100 %) | 8 s | Sin dificultad |
| T2 Interpretar los resultados | 4/6 (67 %) | 41 s | Dos participantes no relacionaron el título «Mi huella» con «mis resultados» |
| T3 Encontrar carreras | 6/6 (100 %) | 12 s | — |
| T4 Localizar la descarga | 5/6 (83 %) | 25 s | — |

**Hallazgos.**

- **H‑04 (Media).** 2 de 6 participantes no asociaron la metáfora *«Mi huella»* con la
  pantalla de resultados.
  *Acción:* se conserva el nombre por su valor de identidad de marca, pero se acompaña de
  un subtítulo descriptivo y de una **leyenda con los valores numéricos por tipo RIASEC**,
  verificada en CP‑026.
- **H‑05 (Baja).** 3 de 6 participantes dudaron sobre el significado de los extremos de la
  escala de respuesta 1–5.
  *Acción:* los extremos se rotulan explícitamente y la escala se implementa como
  `radiogroup` accesible, seleccionable también por número — verificado en CP‑024.

---

#### S3 · 11 de julio de 2026 — Usabilidad del cuestionario (HU‑02)

**Objetivo.** Validar el flujo completo de respuesta de los 30 reactivos sobre el sistema
en ejecución, con especial atención al autosave y a la recuperación del avance.

**Tareas.** (T1) Registrarse e iniciar sesión. (T2) Responder los 30 reactivos. (T3)
Interrumpir en el reactivo 15, cerrar sesión y retomar. (T4) Enviar el cuestionario
incompleto a propósito y comprender el mensaje resultante.

**Resultados.**

| Tarea | Éxito | Tiempo (mediana) | Errores |
| --- | --- | --- | --- |
| T1 Registro e inicio de sesión | 8/8 (100 %) | 1 min 10 s | 0 |
| T2 Responder los 30 reactivos | 8/8 (100 %) | 6 min 45 s | 0 |
| T3 Interrumpir y retomar | 7/8 (88 %) | 55 s | 1 |
| T4 Comprender el bloqueo por envío incompleto | 8/8 (100 %) | 18 s | 0 |

**Hallazgos.**

- **H‑06 (Crítica).** La sesión debió **suspenderse 20 minutos al inicio**: el cliente no
  lograba comunicarse con el servidor desde el navegador. El diagnóstico en caliente
  identificó la ausencia de política **CORS** — el mismo defecto documentado en la sección
  12. Ninguna de las 108 pruebas del servidor lo detectaba, porque Supertest invoca la
  aplicación Express en proceso y no emite peticiones de origen cruzado.
  *Acción:* corrección inmediata mediante el paquete `cors` con origen configurable
  (`CLIENT_ORIGIN`) y validación por función, de modo que ante un origen no permitido la
  cabecera simplemente no se emite (decisión #20, commit `1f78204`). Se añadió
  `server/tests/cors.test.js` (4 pruebas) para prevenir la regresión.
- **H‑07 (Alta).** 5 de 8 participantes expresaron temor explícito a **perder el avance**
  si cerraban la pestaña; uno de ellos evitó tocar el botón de retroceso durante toda la
  sesión.
  *Acción:* aunque el autosave por reactivo ya estaba implementado (`PATCH
  /attempts/:id/answers`, CP‑022), era **invisible para el usuario**. Se añadió un aviso
  permanente de guardado automático en la pantalla del cuestionario. El caso de retomar el
  avance quedó cubierto por CP‑018.
- **H‑08 (Media).** 3 de 8 participantes preguntaron cuántas preguntas faltaban.
  *Acción:* se refuerza la visibilidad de la huella de progreso con el contador explícito
  «pregunta N de 30».

---

#### S4 · 19 de julio de 2026 — Comprensión del perfil y de las áreas afines (HU‑03)

**Objetivo.** Validar la dimensión más delicada del producto: que el estudiante
**comprenda y confíe** en el resultado que el sistema le entrega.

**Tareas.** (T1) Explicar con las propias palabras qué significa el resultado. (T2)
Identificar el área con mayor afinidad. (T3) Explicar por qué el sistema recomienda esa
área. (T4) Consultar las carreras de un área recomendada.

**Resultados.**

| Tarea | Éxito | Observaciones |
| --- | --- | --- |
| T1 Explicar el resultado | 6/8 (75 %) | El código Holland resultó opaco sin leyenda |
| T2 Identificar la mayor afinidad | 8/8 (100 %) | El orden descendente y el porcentaje resultaron claros |
| T3 Explicar el porqué de la recomendación | 8/8 (100 %) | La explicación por área cumplió su función |
| T4 Consultar carreras del área | 8/8 (100 %) | *Drill-down* localizado sin ayuda |

**Hallazgos.**

- **H‑09 (Media).** 2 de 8 participantes no comprendieron el código Holland (p. ej.
  `«IAE»`) presentado de forma aislada.
  *Acción:* se acompaña el código de la leyenda completa con el nombre y el valor de cada
  tipo RIASEC — verificado en CP‑026.
- **H‑10 (Baja).** Se observaron ítems desalineados en la barra de navegación superior,
  señalado espontáneamente por un participante.
  *Acción:* corrección de alineación (commit `b18118d`).
- **Observación de confianza.** 7 de 8 participantes calificaron el resultado como
  *«coherente con lo que ya sabía de mí»* (4 o 5 en escala 1–5), lo que constituye
  evidencia de **validez aparente** del motor RIASEC. Un participante señaló discrepancia,
  atribuida en la entrevista de cierre a haber respondido «lo que debería gustarme» en
  lugar de sus preferencias reales — una limitación inherente al instrumento
  autoadministrado, no un defecto del sistema.

---

#### S5 · 27 de julio de 2026 — Catálogo y búsqueda de carreras (HU‑04)

**Objetivo.** Validar la búsqueda y el filtrado del catálogo en condiciones de uso real,
con especial atención al comportamiento del teclado en dispositivos móviles.

**Tareas.** (T1) Encontrar una carrera concreta por nombre. (T2) Ver todas las carreras de
un área. (T3) Buscar algo que no existe en el catálogo. (T4) Consultar la ficha completa de
una carrera.

**Resultados.**

| Tarea | Éxito | Tiempo (mediana) |
| --- | --- | --- |
| T1 Buscar por nombre | 7/7 (100 %) | 14 s |
| T2 Filtrar por área | 7/7 (100 %) | 9 s |
| T3 Búsqueda sin resultados | 6/7 (86 %) | 20 s |
| T4 Consultar la ficha | 7/7 (100 %) | 7 s |

**Hallazgos.**

- **H‑11 (Alta) — hallazgo de mayor impacto de la sesión.** 5 de 7 participantes escribieron
  los términos de búsqueda **sin tildes** (`biologia`, `psicologia`, `ingenieria`), en
  buena medida por el uso de teclado móvil. Una implementación con `LIKE` convencional no
  habría devuelto ningún resultado.
  *Acción:* se confirma la pertinencia de la decisión #2 —extensión **`unaccent`** de
  PostgreSQL, habilitada por migración, con el filtrado ejecutado **íntegramente en SQL**
  mediante `unaccent(lower(...))` y nunca en JavaScript—. El comportamiento quedó blindado
  por CP‑035 («la búsqueda es insensible a mayúsculas y a acentos») y por una petición
  dedicada en la colección Postman.
- **H‑12 (Media).** Un participante interpretó la pantalla vacía de una búsqueda sin
  resultados como un fallo de carga.
  *Acción:* se refuerza el estado vacío explícito «No se encontraron carreras» acompañado
  de una acción para limpiar los filtros — verificado en CP‑037.
- **H‑13 (Baja).** 4 de 7 participantes intentaron comparar dos carreras **desde la ficha**,
  antes de que la funcionalidad existiera.
  *Acción:* la decisión #29 había pospuesto deliberadamente el botón «Comparar esta
  carrera» hasta la Fase 6, para no ofrecer un control sin destino funcional. El hallazgo
  confirmó la demanda: el botón se integró en la Fase 6 precargando la Carrera A vía
  `?a=<id>` — verificado en CP‑047.

---

#### S6 · 4 de agosto de 2026 — Comparador (HU‑05) y reporte PDF (HU‑06)

**Objetivo.** Validar las dos últimas funcionalidades de estudiante y, de forma
transversal, el comportamiento **responsive** en móvil, dado que 11 de los 18 participantes
utilizaron teléfono.

**Tareas.** (T1) Comparar dos carreras. (T2) Cambiar una de las dos carreras comparadas.
(T3) Descargar el reporte en PDF. (T4) Volver a la pantalla de inicio desde cualquier punto.

**Resultados.**

| Tarea | Éxito | Observaciones |
| --- | --- | --- |
| T1 Comparar dos carreras | 7/7 (100 %) | — |
| T2 Cambiar una carrera | 4/7 (57 %) | Se esperaba actualización inmediata |
| T3 Descargar el PDF | 7/7 (100 %) | — |
| T4 Navegar de vuelta al inicio | 3/7 (43 %) | **Encabezado desbordado en pantallas estrechas** |

**Hallazgos.** Esta sesión fue la más productiva del proyecto y **convergió** con la
revisión crítica de diseño ejecutada sobre `client/src` (28/40, sección 6.3), que había
identificado de forma independiente los mismos dos defectos bloqueantes. Todos se
resolvieron mediante la decisión #38:

- **H‑14 (Crítica · P0).** En pantallas de 360 px el **encabezado se desbordaba** y los
  enlaces de navegación quedaban inaccesibles: 4 de 7 participantes no pudieron volver al
  inicio.
  *Acción:* implementación de la **barra de pestañas móvil** especificada en `DESIGN.md`
  §5, que sustituye a la barra de navegación simple (superseding de la decisión #30). El
  administrador dispone de un quinto destino, «Reactivos». Verificado en `TabBar.test.jsx`
  (4 pruebas).
- **H‑15 (Crítica · P0).** La pantalla de inicio **negaba que el usuario tuviera un
  perfil** aun teniéndolo calculado, invitándolo a repetir el cuestionario. Dos
  participantes lo iniciaron de nuevo innecesariamente.
  *Acción:* `HomePage` pasa a consultar el estado real reutilizando `GET /recommendations`
  y su bandera `hasProfile` (decisión #24). Verificado en `HomePage.test.jsx`.
- **H‑16 (Alta · P1).** El modal de confirmación de desactivación de reactivos aparecía en
  la esquina de la pantalla en lugar de centrado.
  *Acción:* se restituye `margin: auto` —lo pisaba el *reset* global de CSS— y se añade
  `aria-labelledby` para lectores de pantalla.
- **H‑17 (Alta · P1).** La tabla del panel de administración resultaba inutilizable por
  debajo de 720 px.
  *Acción:* la tabla se apila verticalmente en pantallas estrechas, con el formato
  «letra · nombre» para el tipo RIASEC y un distintivo de estado «Activo/Inactivo».
- **H‑18 (Media).** 3 de 7 participantes esperaban que la comparación se actualizara
  **sola** al cambiar una de las dos carreras, sin volver a pulsar «Comparar».
  *Acción:* se implementa el comportamiento diferenciado de la decisión #31 — la primera
  comparación exige la acción explícita del botón (escenario 1 de HU‑05), pero una vez
  mostrada, cambiar cualquiera de los dos selectores vuelve a consultar el endpoint de
  inmediato (escenario 4). Verificado en CP‑045.

---

#### S7 · 8, 9 y 10 de agosto de 2026 — Prueba de aceptación de usuario (UAT)

**Objetivo.** Validar el sistema **completo y corregido** de extremo a extremo con la
totalidad de los participantes, y medir formalmente los objetivos SMART 2 y 3.

**Participantes.** 16 (U‑01 … U‑16), distribuidos en tres jornadas: 5 el 8/8, 6 el 9/8 y
5 el 10/8. Diez de ellos habían participado en sesiones anteriores y seis se enfrentaron al
sistema por primera vez, lo que permite contrastar la **curva de aprendizaje**.

**Tareas.** Siete tareas encadenadas que reproducen el recorrido completo de valor del
producto, ejecutadas sin ayuda del facilitador.

**Resultados de eficacia y eficiencia.**

| # | Tarea (HU) | Éxito | Tasa | Tiempo (mediana) | Errores |
| --- | --- | --- | --- | --- | --- |
| T1 | Registrarse (HU‑01) | 16/16 | 100 % | 48 s | 0 |
| T2 | Iniciar sesión (HU‑01) | 16/16 | 100 % | 19 s | 0 |
| T3 | Completar los 30 reactivos (HU‑02) | 15/16 | 93,8 % | 6 min 20 s | 1 |
| T4 | Interpretar «Mi huella» y las áreas afines (HU‑02, HU‑03) | 14/16 | 87,5 % | 1 min 05 s | 2 |
| T5 | Encontrar una carrera por búsqueda (HU‑04) | 16/16 | 100 % | 15 s | 0 |
| T6 | Comparar dos carreras (HU‑05) | 15/16 | 93,8 % | 52 s | 1 |
| T7 | Descargar el reporte en PDF (HU‑06) | 16/16 | 100 % | 22 s | 0 |
| | **Global** | **108/112** | **96,4 %** | — | **4** |

*Nota sobre T3:* el único caso de no finalización correspondió a un participante que agotó
el tiempo asignado a la jornada; al retomar la sesión el sistema restauró su avance
correctamente, lo que constituye una **validación no planificada** del escenario 3 de
HU‑02.

**Resultados de satisfacción (escala Likert 1–5, n = 16).**

| Dimensión evaluada | Media | Desviación | Normalizado |
| --- | --- | --- | --- |
| Facilidad de uso general | 4,5 | 0,52 | 90,0 % |
| Claridad del cuestionario | 4,4 | 0,63 | 88,0 % |
| Comprensión del resultado | 4,2 | 0,68 | 84,0 % |
| Utilidad de las recomendaciones | 4,4 | 0,51 | 88,0 % |
| Apariencia y agrado visual | 4,7 | 0,48 | 94,0 % |
| Satisfacción general con el sistema | 4,5 | 0,52 | 90,0 % |
| **Media global** | **4,45** | — | **89,0 %** |

> **Objetivo SMART 3 alcanzado.** Satisfacción del **89,0 %** frente a la meta de ≥ 80 %,
> con un margen de 9 puntos porcentuales.

> **Objetivo SMART 2 alcanzado.** **18 participantes únicos** externos al equipo, y 16 en
> la prueba de aceptación formal, frente a la meta de ≥ 15.

**System Usability Scale (SUS).** Se aplicó adicionalmente el instrumento SUS de 10 ítems,
obteniendo una puntuación de **84,2 / 100**, correspondiente al grado **A** en la escala de
Sauro y Lewis (percentil ≈ 95) y a la calificación adjetiva de *«excelente»*.

**Hallazgos residuales.** La sesión no produjo hallazgos críticos ni altos, lo que confirma
la eficacia de las correcciones derivadas de S6. Se registraron dos observaciones menores,
documentadas y **conscientemente no corregidas**:

- **H‑19 (Baja · aceptado).** 2 de 16 participantes buscaron un botón explícito para
  **repetir el cuestionario** desde la pantalla «Mi huella». La funcionalidad existe
  (decisión #5: los reintentos están permitidos y `GET /profile` devuelve el perfil más
  reciente), pero no cuenta con un punto de entrada dedicado en esa pantalla.
  *Decisión:* se traslada al *backlog*; no compromete ningún criterio de aceptación.
- **H‑20 (Baja · aceptado como comportamiento definido).** Un participante esperaba que el
  PDF mostrara la fecha en que respondió el cuestionario, y no la de descarga.
  *Decisión:* se conserva la fecha de generación conforme a la decisión #33, por ser la
  significativa en un documento descargable en cualquier momento posterior. El criterio de
  HU‑06 solo exige «fecha», sin especificar cuál.

### 13.3. Consolidado de hallazgos de validación

| Severidad | Detectados | Cerrados | Aceptados / diferidos |
| --- | --- | --- | --- |
| Crítica | 3 | 3 | 0 |
| Alta | 5 | 5 | 0 |
| Media | 7 | 7 | 0 |
| Baja | 5 | 3 | 2 |
| **Total** | **20** | **18 (90 %)** | **2 (10 %)** |

**Distribución temporal.** El 65 % de los hallazgos se concentró en las sesiones S1–S3
(fase temprana) y en S6 (primera exposición intensiva a móvil). La sesión de aceptación
final no produjo hallazgos por encima de severidad baja, lo que sugiere que el ciclo
*construir → validar con usuarios → corregir* alcanzó convergencia antes del cierre.

---

## 14. Pruebas de aceptación y validación de criterios

**Aplicadas. ✅**

### 14.1. La matriz de trazabilidad como instrumento de aceptación

El artefacto central de la validación formal es `docs/trazabilidad.md`, que vincula de
forma explícita **cada caso de prueba con el criterio de aceptación que valida y con la
historia de usuario a la que pertenece**. La matriz contiene **64 casos** (CP‑001 …
CP‑064), organizados en dos categorías por historia:

- **Casos de aceptación (29).** Uno por cada escenario `Dado/Cuando/Entonces` del documento
  de historias de usuario. Su cobertura es del **100 %**: no existe escenario acordado con
  el cliente que carezca de prueba automatizada.
- **Casos complementarios (35).** Verifican seguridad, validaciones, casos borde y
  comportamiento de la interfaz que el equipo consideró necesarios aunque los criterios de
  aceptación no los exigieran explícitamente.

| Historia | Casos de aceptación | Casos complementarios | Total | Rango |
| --- | --- | --- | --- | --- |
| HU‑01 Autenticación | 5 | 10 | 15 | CP‑001 … CP‑015 |
| HU‑02 Cuestionario | 4 | 7 | 11 | CP‑016 … CP‑026 |
| HU‑03 Recomendaciones | 4 | 3 | 7 | CP‑027 … CP‑033 |
| HU‑04 Catálogo | 4 | 4 | 8 | CP‑034 … CP‑041 |
| HU‑05 Comparador | 4 | 4 | 8 | CP‑042 … CP‑049 |
| HU‑06 Reporte PDF | 3 | 2 | 5 | CP‑050 … CP‑054 |
| HU‑07 Banco de reactivos | 5 | 5 | 10 | CP‑055 … CP‑064 |
| **Total** | **29** | **35** | **64** | |

### 14.2. Doble validación cliente–servidor

Un rasgo metodológico distintivo de la matriz es que la mayoría de los casos de aceptación
se validan **simultáneamente en las dos capas**. Por ejemplo, el caso CP‑017 (envío
incompleto del cuestionario) referencia tanto `server/tests/routes/questionnaireRoutes.test.js`
—que verifica que la API rechaza el envío e informa **cuáles** reactivos faltan mediante el
campo `details.missing` (decisión #22)— como
`client/src/__tests__/pages/CuestionarioPage.test.jsx`, que verifica que la interfaz señala
las preguntas pendientes y no permite el envío. Esto valida el criterio de aceptación tanto
en la **regla de negocio** como en la **experiencia del usuario**, que es donde el criterio
realmente se cumple o se incumple.

### 14.3. Estado de aceptación

**Los 64 casos de prueba se encuentran en estado «✅ Pasa».** La meta contractual del
proyecto (≥ 25 casos documentados y trazados, `EstandaresdeCodigo.md` §7.6) quedó superada desde el
cierre de la Fase 3, y se mantuvo por encima del umbral en todas las fases posteriores.

---

## 15. Mapeo de la evidencia a ISO/IEC 25010

La norma ISO/IEC 25010 define el modelo de calidad del producto software en ocho
características. La tabla siguiente vincula cada una con las actividades de V&V que la
evidencian en este proyecto:

| Característica ISO/IEC 25010 | Evidencia de V&V aportada | Estado |
| --- | --- | --- |
| **Adecuación funcional** | 29/29 escenarios de aceptación cubiertos; 64 casos trazados; 36 peticiones Postman con aserciones; UAT con 96,4 % de éxito por tarea | **Verificada** |
| **Fiabilidad** | 214 pruebas automatizadas en verde; determinismo del motor RIASEC (29 unitarias, incluidas las de consistencia entre consultas); pruebas de humo por capa; manejo centralizado de errores con formato uniforme; corrección de la interferencia entre suites (decisión #36) | **Verificada** |
| **Usabilidad** | 7 sesiones con 18 usuarios externos; SUS = 84,2 (grado A); satisfacción 89 %; conformidad WCAG 2.1 AA verificada por `eslint-plugin-jsx-a11y` y por cálculo de contraste; validación de paleta para daltonismo; estados vacíos, de carga y de error explícitos en cada pantalla | **Verificada** |
| **Seguridad** | bcrypt para contraseñas (CP‑008); JWT con expiración de 24 h (CP‑009, CP‑014); autorización por rol (CP‑058); 401 sin sesión en todo endpoint de consulta; mensaje de login genérico (CP‑005); validación de entrada; consultas SQL parametrizadas; secretos fuera del repositorio | **Verificada** |
| **Mantenibilidad** | Análisis estático continuo (ESLint Airbnb + Prettier); arquitectura en tres capas con separación estricta rutas/controladores/servicios/repositorios; motores de negocio puros y aislados; 38 decisiones documentadas con su fundamento; esquema evolucionado solo por migración versionada | **Verificada** |
| **Portabilidad** | Entorno reproducible con `docker-compose` + migraciones + seeds; configuración externalizada en `.env` con `.env.example`; requisitos declarados (Node ≥ 20, PostgreSQL 16) | **Verificada** |
| **Compatibilidad** | API REST con contrato versionado (`/api/v1`) y colección Postman como documentación viva; política CORS explícita y probada (`cors.test.js`) | **Parcial** — no se ejecutó una matriz formal de compatibilidad entre navegadores |
| **Eficiencia de desempeño** | — | **No evaluada** — justificación en la sección 8.3 |

---

## 16. Conclusiones

1. **La verificación fue continua y mecanizada, no un evento final.** El proyecto no
   reservó la calidad para una fase de pruebas al cierre: la incorporó como **puerta
   bloqueante en la Definition of Done** de cada una de las ocho fases. La serie histórica
   de la sección 2.1 —de 68 a 214 pruebas en verde, y de 15 a 64 casos trazados— documenta
   ese crecimiento de forma auditable.

2. **La cobertura de los requisitos acordados es total.** Los 29 escenarios de aceptación
   de las 7 historias de usuario cuentan con al menos una prueba automatizada, y la mayoría
   se validan por partida doble (API y interfaz). La meta contractual de 25 casos
   documentados se superó en un 156 %.

3. **La validación con usuarios reales aportó lo que la automatización no podía aportar.**
   El caso de CORS es concluyente: 108 pruebas de servidor en verde convivían con un
   sistema inutilizable desde el navegador, y solo el uso real lo reveló. De forma análoga,
   los dos defectos bloqueantes de la sesión del 4 de agosto (encabezado desbordado en
   móvil y pantalla de inicio negando un perfil existente) eran invisibles para una suite
   ejecutada en jsdom, que no aplica CSS. **La verificación y la validación no son
   sustitutivas: son complementarias**, y cada una detecta la clase de defectos que a la
   otra se le escapa.

4. **Los objetivos de calidad medibles se alcanzaron.** Satisfacción de usuario del 89,0 %
   frente a una meta del 80 %; 18 participantes externos frente a una meta de 15; tasa
   global de éxito por tarea del 96,4 %; y una puntuación SUS de 84,2, en el grado A de la
   escala de referencia.

5. **La validación temprana resultó ser la intervención más rentable.** Los tres hallazgos
   de la sesión del 20 de junio —anterior a la primera línea de código— se incorporaron
   como decisiones de diseño (#23, #25 y el criterio de registro mínimo) a costo
   prácticamente nulo. En contraste, los hallazgos de la sesión del 4 de agosto exigieron
   reconstruir la navegación completa. La distribución de esfuerzo confirma el principio de
   que **el costo de corrección de un defecto crece con la fase en que se detecta**.

6. **La principal deuda de calidad identificada es la ausencia de integración continua.**
   El equipo la reconoce de forma explícita (sección 8.1). El control compensatorio
   —ejecución obligatoria de lint y pruebas antes de cada fusión, registrada por escrito—
   cumplió su función en este proyecto, pero es de naturaleza procedimental y por tanto
   dependiente de la disciplina del equipo. Su mecanización mediante un *workflow* de
   GitHub Actions con servicio PostgreSQL es la recomendación prioritaria para la siguiente
   iteración.

---

## Anexo A — Índice de la evidencia en el repositorio

| Evidencia | Ubicación |
| --- | --- |
| Estándares, DoD y política de seguridad | `EstandaresdeCodigo.md` |
| Plan por fases, modelo de datos, contrato de API y registro de 38 decisiones | `PLAN.md` |
| Matriz de trazabilidad (64 casos) | `docs/trazabilidad.md` |
| Historias de usuario y criterios de aceptación | `docs/Historias_de_Usuario_Brujula_Vocacional.pdf` |
| EDT y cronograma | `docs/Primer_Entregable_GestionProyectosG6.pdf` |
| Colección de pruebas funcionales (36 peticiones con aserciones) | `docs/postman_collection.json` |
| Especificación de diseño y direcciones de arte evaluadas | `DESIGN.md`, `DESIGN_BRIEF.md`, `docs/design/DIRECCIONES.md` |
| Prototipo navegable usado en la sesión del 3/7 | `docs/prototipo.html` |
| Suite de pruebas del servidor (16 archivos, 108 pruebas) | `server/tests/` |
| Suite de pruebas del cliente (24 archivos, 106 pruebas) | `client/src/__tests__/` |
| Configuración de análisis estático | `server/.eslintrc.cjs`, `client/.eslintrc.cjs`, `.prettierrc`, `.editorconfig` |
| Migraciones versionadas (7) y datos de arranque | `server/migrations/`, `server/seeds/` |
| Entorno reproducible | `docker-compose.yml`, `.env.example`, `README.md` |

## Anexo B — Comandos de reproducción de la evidencia

```bash
# Preparar el entorno
npm install
cp .env.example server/.env
docker compose up -d db
npm run migrate --workspace server
npm run db:seed --workspace server

# Verificación: análisis estático y formato
npm run lint
npm run format:check

# Verificación: suite completa (214 pruebas)
npm test

# Validación funcional: importar docs/postman_collection.json en Postman
# y ejecutar la colección contra http://localhost:3000
```
