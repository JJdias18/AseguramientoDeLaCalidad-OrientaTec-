# Matriz de trazabilidad

**Proyecto:** Brújula Vocacional — OrientaTec Costa Rica S.A.
**Documento:** trazabilidad caso de prueba ↔ criterio de aceptación ↔ historia de usuario

## Para qué sirve este documento

Cada criterio de aceptación de las historias de usuario tiene que poder rastrearse hasta
una prueba automatizada concreta, y al revés: si una prueba falla, tenemos que poder decir
de inmediato qué requisito quedó roto. Esa es la función de esta tabla.

Se actualiza al cerrar cada historia. Es uno de los seis puntos de la Definition of Done
(`EstandaresdeCodigo.md` §7.5), así que ninguna fase se da por terminada sin dejar acá la traza
correspondiente.

La meta que nos fijamos al inicio del proyecto fue de **25 casos documentados y trazados**
como mínimo (`EstandaresdeCodigo.md` §7.6).

## Convenciones

- **CP-XXX** — identificador correlativo del caso de prueba. No se reutilizan números
  aunque un caso se retire.
- Los casos se dividen en dos grupos por historia:
  - **De aceptación** — uno por cada escenario `Dado/Cuando/Entonces` del documento de
    historias de usuario. Son los que el cliente firmó.
  - **Complementarios** — seguridad, validaciones, casos borde y comportamiento de la
    interfaz que agregamos por criterio del equipo, aunque el escenario no los pidiera.
- La columna de resultado refleja el estado de la última corrida completa de `npm test`.

## Historial de revisiones

| Rev. | Fecha | Alcance agregado | Casos acumulados |
| --- | --- | --- | --- |
| 1 | 3/7/2026 | HU-01 (Fase 2) | 15 |
| 2 | 3/7/2026 | HU-02 (Fase 3) | 26 |
| 3 | 3/7/2026 | HU-03 (Fase 4) | 33 |
| 4 | 3/7/2026 | HU-04 (Fase 5) | 41 |
| 5 | 4/7/2026 | HU-05 (Fase 6) | 49 |
| 6 | 4/7/2026 | HU-06 (Fase 7) | 54 |
| 7 | 4/7/2026 | HU-07 (Fase 8) | 64 |

---

# HU-01 — Registro e inicio de sesión

*Fase 2 · Prioridad alta*

Escenarios de aceptación según el documento de historias:

1. **Registro exitoso.** Dado que el correo no está registrado, cuando el estudiante se
   registra con correo y contraseña válidos, entonces el sistema crea la cuenta y devuelve
   sesión iniciada.
2. **Correo ya registrado.** Dado que el correo ya tiene cuenta, cuando alguien intenta
   registrarse de nuevo con ese correo, entonces el sistema rechaza el registro y no crea
   una segunda cuenta.
3. **Contraseña débil.** Dado el formulario de registro, cuando el estudiante ingresa una
   contraseña que no cumple el mínimo, entonces el sistema la rechaza e indica el requisito
   (8+ caracteres, letras y números).
4. **Inicio de sesión correcto.** Dado que el estudiante ya tiene una cuenta, cuando inicia
   sesión con correo y contraseña correctos, entonces el sistema abre la sesión (token JWT)
   y devuelve sus datos.
5. **Credenciales incorrectas.** Dado que el estudiante tiene cuenta, cuando inicia sesión
   con una contraseña equivocada, entonces el sistema muestra "Correo o contraseña
   incorrectos" sin indicar cuál de los dos falló.

## Casos de aceptación

| Caso | Escenario | Prueba automatizada | Resultado |
| --- | --- | --- | --- |
| CP-001 | 1 · Registro exitoso | `server/tests/routes/authRoutes.test.js` → "escenario 1: registra un usuario nuevo con datos válidos" | Pasa |
| CP-002 | 2 · Correo ya registrado | `server/tests/routes/authRoutes.test.js` → "escenario 2: rechaza el registro con un correo ya usado" | Pasa |
| CP-003 | 3 · Contraseña débil | `server/tests/routes/authRoutes.test.js` → "escenario 3: rechaza una contraseña débil" | Pasa |
| CP-004 | 4 · Inicio de sesión correcto | `server/tests/routes/authRoutes.test.js` → "escenario 4: inicia sesión con credenciales correctas y devuelve un token" | Pasa |
| CP-005 | 5 · Credenciales incorrectas | `server/tests/routes/authRoutes.test.js` → "escenario 5: rechaza credenciales incorrectas con mensaje genérico" | Pasa |

## Casos complementarios

Los cinco escenarios no cubren el apartado "Validaciones u otras observaciones" de la
historia. Estos casos lo refuerzan.

| Caso | Qué cubre | Ubicación | Resultado |
| --- | --- | --- | --- |
| CP-006 | Registro rechaza si faltan campos obligatorios | `server/tests/routes/authRoutes.test.js` | Pasa |
| CP-007 | `GET /auth/me` rechaza sin token / acepta con token válido | `server/tests/routes/authRoutes.test.js` | Pasa |
| CP-008 | Contraseña se persiste hasheada con bcrypt (nunca en texto plano) | `server/tests/services/authService.test.js` | Pasa |
| CP-009 | Middleware de autenticación (`requireAuth`) y de rol (`requireRole`) | `server/tests/middlewares/authMiddleware.test.js`, `server/tests/middlewares/roleMiddleware.test.js` | Pasa |
| CP-010 | Formato de correo y fuerza de contraseña (`isValidEmail` / `isValidPassword`) | `server/tests/utils/validators.test.js`, `client/src/__tests__/utils/validators.test.js` | Pasa |
| CP-011 | Contraseña enmascarada con toggle "Mostrar/Ocultar" (accesible, `aria-pressed`) | `client/src/__tests__/components/PasswordField.test.jsx` | Pasa |
| CP-012 | Formulario de registro: campos obligatorios, error de contraseña débil al blur, éxito navega a "/", error de correo repetido con enlace a inicio de sesión | `client/src/__tests__/pages/RegisterPage.test.jsx` | Pasa |
| CP-013 | Formulario de inicio de sesión: éxito navega a "/", mensaje de error genérico, estado de carga del botón | `client/src/__tests__/pages/LoginPage.test.jsx` | Pasa |
| CP-014 | Contexto de autenticación: restaura sesión con token guardado, limpia token vencido/inválido, login/logout | `client/src/__tests__/context/AuthContext.test.jsx` | Pasa |
| CP-015 | Ruta protegida redirige a inicio de sesión sin sesión activa; ruta de invitado redirige a "/" con sesión activa | `client/src/__tests__/components/ProtectedRoute.test.jsx`, `client/src/__tests__/components/GuestRoute.test.jsx` | Pasa |

Van **15 casos**: 5 de aceptación y 10 complementarios.

---

# HU-02 — Responder el cuestionario vocacional

*Fase 3 · Prioridad alta*

Escenarios de aceptación:

1. **Cuestionario completo.** Dado un cuestionario de 30 reactivos, cuando el estudiante
   responde los 30 y presiona "Enviar", entonces el sistema genera el perfil y lo muestra.
2. **Cuestionario incompleto.** Dado que el estudiante dejó preguntas sin responder, cuando
   intenta enviar, entonces el sistema señala las faltantes y no permite enviarlo.
3. **Retomar el avance.** Dado que respondió 15 de 30 y cerró la sesión, cuando vuelve a
   entrar, entonces lo ubica en la pregunta 16 conservando sus respuestas.
4. **Cálculo del perfil.** Dado respuestas altas en reactivos investigativo y artístico,
   cuando el sistema calcula el perfil, entonces destaca esas dos áreas como predominantes.

## Casos de aceptación

Los cuatro se validan por partida doble: en la API y en la pantalla.

| Caso | Escenario | Prueba automatizada | Resultado |
| --- | --- | --- | --- |
| CP-016 | 1 · Cuestionario completo | `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 1: … genera el perfil vocacional" · `client/src/__tests__/pages/CuestionarioPage.test.jsx` → "escenario 1: … navega a /mi-huella" | Pasa |
| CP-017 | 2 · Cuestionario incompleto | `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 2: bloquea el envío…" · `client/src/__tests__/pages/CuestionarioPage.test.jsx` → "escenario 2: bloquea el envío incompleto" | Pasa |
| CP-018 | 3 · Retomar el avance | `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 3: … lo ubica en la pregunta 16" · `client/src/__tests__/pages/CuestionarioPage.test.jsx` → "escenario 3: al retomar…" | Pasa |
| CP-019 | 4 · Cálculo del perfil | `server/tests/services/scoringService.test.js` → "escenario 4 (HU-02)…" · `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 4: … destacan esas dos áreas" | Pasa |

## Casos complementarios

El motor de scoring es el corazón del sistema, así que se probó aparte y con más detalle
que el resto.

| Caso | Qué cubre | Ubicación | Resultado |
| --- | --- | --- | --- |
| CP-020 | Motor de scoring puro: suma por tipo, código Holland, determinismo y casos borde (todas iguales, empates, extremos de la escala) | `server/tests/services/scoringService.test.js` (17 pruebas) | Pasa |
| CP-021 | `GET /questions` exige sesión y devuelve solo reactivos activos (30, 5 por tipo) | `server/tests/routes/questionnaireRoutes.test.js` | Pasa |
| CP-022 | Autosave (`PATCH …/answers`): reemplaza la respuesta previa del mismo reactivo | `server/tests/routes/questionnaireRoutes.test.js` | Pasa |
| CP-023 | Validaciones del intento: reactivo ajeno (404), valor fuera de la escala 1–5 (400), reenvío de intento ya completado (409) | `server/tests/routes/questionnaireRoutes.test.js` | Pasa |
| CP-024 | Escala 1–5 accesible (radiogroup, extremos rotulados, selección por número) | `client/src/__tests__/components/EscalaRespuesta.test.jsx` | Pasa |
| CP-025 | Cliente del cuestionario: contrato de los endpoints (`getQuestions` / `startAttempt` / `saveAnswer` / `submit` / `getProfile`) | `client/src/__tests__/services/questionnaireService.test.js` | Pasa |
| CP-026 | Resultado ("Mi huella"): muestra huella hero, leyenda con valores y código Holland; estado vacío sin perfil | `client/src/__tests__/pages/ResultadoPage.test.jsx` | Pasa |

Acumulado: **26 casos** (9 de aceptación + 17 complementarios). Con esta fase ya se supera
la meta de 25 que fijamos al inicio.

---

# HU-03 — Recomendación de áreas académicas

*Fase 4 · Prioridad alta*

Escenarios de aceptación:

1. **Áreas recomendadas.** Dado un perfil calculado, cuando el estudiante consulta sus
   recomendaciones, entonces recibe al menos 3 áreas ordenadas por afinidad con su
   porcentaje.
2. **Sin perfil.** Dado que el estudiante aún no completó el cuestionario, cuando consulta
   recomendaciones, entonces la respuesta lo lleva al cuestionario (no un error de sesión).
3. **Explicación de afinidad.** Dado un perfil, cuando ve cada área recomendada, entonces
   cada una incluye una explicación breve derivada del tipo dominante de la coincidencia.
4. **Resultados consistentes.** Dado el mismo perfil, cuando consulta dos veces, entonces
   obtiene siempre el mismo orden y los mismos porcentajes (desempate estable por nombre).

## Casos de aceptación

| Caso | Escenario | Prueba automatizada | Resultado |
| --- | --- | --- | --- |
| CP-027 | 1 · Áreas recomendadas | `server/tests/routes/recommendationRoutes.test.js` → "Escenario 1: … en orden descendente" · `client/src/__tests__/pages/ResultadoPage.test.jsx` → "lista al menos 3 áreas afines…" | Pasa |
| CP-028 | 2 · Sin perfil | `server/tests/routes/recommendationRoutes.test.js` → "Escenario 2: … hasProfile=false" · `client/src/__tests__/pages/ResultadoPage.test.jsx` → "sin perfil muestra el estado vacío…" | Pasa |
| CP-029 | 3 · Explicación de afinidad | `server/tests/routes/recommendationRoutes.test.js` → "Escenario 3: … incluye una explicación" · `server/tests/services/recommendationService.test.js` → "explica cada área…" | Pasa |
| CP-030 | 4 · Resultados consistentes | `server/tests/routes/recommendationRoutes.test.js` → "Escenario 4: … mismo orden" · `server/tests/services/recommendationService.test.js` → "es consistente…" / "desempata … por nombre" | Pasa |

El escenario 4 es el más delicado de los cuatro: sin un desempate estable el orden puede
variar entre dos consultas idénticas y la prueba falla de forma intermitente. Por eso el
desempate por nombre se prueba explícitamente, y no solo la consistencia general.

## Casos complementarios

| Caso | Qué cubre | Ubicación | Resultado |
| --- | --- | --- | --- |
| CP-031 | Motor de recomendación puro: similitud coseno (magnitud no infla), % 0–100, orden desc, desempate por nombre, casos borde (perfil plano, vector nulo) y consistencia | `server/tests/services/recommendationService.test.js` (12 pruebas) | Pasa |
| CP-032 | Cliente de recomendaciones: contrato del endpoint (`getRecommendations` → `GET /recommendations`) | `client/src/__tests__/services/questionnaireService.test.js` | Pasa |
| CP-033 | Vista de recomendaciones: huella "eco" por área, % y explicación, drill-down a las carreras del área y estado vacío | `client/src/__tests__/pages/ResultadoPage.test.jsx` | Pasa |

Acumulado: **33 casos** (13 de aceptación + 20 complementarios).

---

# HU-04 — Consultar información de carreras

*Fase 5 · Prioridad media*

Escenarios de aceptación:

1. **Listar el catálogo.** Dado un catálogo con 20 carreras, cuando el estudiante entra a
   la sección "Carreras", entonces el sistema muestra las 20 carreras con su nombre y área.
2. **Búsqueda con resultados.** Dado el catálogo de carreras, cuando el estudiante busca
   "Ingeniería", entonces el sistema muestra únicamente las carreras cuyo nombre contiene
   esa palabra.
3. **Ficha de la carrera.** Dado la lista de carreras, cuando el estudiante abre una
   carrera, entonces el sistema muestra su descripción, campo laboral y duración.
4. **Búsqueda sin resultados.** Dado el catálogo de carreras, cuando el estudiante busca un
   término que no existe, entonces el sistema muestra el mensaje "No se encontraron
   carreras".

## Casos de aceptación

| Caso | Escenario | Prueba automatizada | Resultado |
| --- | --- | --- | --- |
| CP-034 | 1 · Listar el catálogo | `server/tests/routes/careerRoutes.test.js` → "Escenario 1: … con al menos 20 carreras con nombre y área" · `client/src/__tests__/pages/CarrerasPage.test.jsx` → "muestra cada carrera con su nombre y área" | Pasa |
| CP-035 | 2 · Búsqueda con resultados | `server/tests/routes/careerRoutes.test.js` → "muestra únicamente las carreras…" y "la búsqueda es insensible a mayúsculas y a acentos…" · `client/src/__tests__/pages/CarrerasPage.test.jsx` → "vuelve a consultar el catálogo con el término escrito" | Pasa |
| CP-036 | 3 · Ficha de la carrera | `server/tests/routes/careerRoutes.test.js` → "Escenario 3: … muestra su descripción, campo laboral y duración" · `client/src/__tests__/pages/CarreraDetallePage.test.jsx` → "muestra la descripción, el campo laboral, la duración y el perfil…" | Pasa |
| CP-037 | 4 · Búsqueda sin resultados | `server/tests/routes/careerRoutes.test.js` → "Escenario 4: … devuelve una lista vacía…" · `client/src/__tests__/pages/CarrerasPage.test.jsx` → "muestra el mensaje de «no se encontraron carreras»…" | Pasa |

Nota sobre CP-035: el escenario solo pide buscar "Ingeniería", pero agregamos la
verificación de búsqueda sin acentos en la misma traza, porque el filtrado se resuelve
íntegramente en SQL con `unaccent(lower(...))` y ese es el comportamiento que hay que
proteger de regresiones.

## Casos complementarios

| Caso | Qué cubre | Ubicación | Resultado |
| --- | --- | --- | --- |
| CP-038 | `GET /careers` y `GET /careers/:id` exigen sesión iniciada (401 sin token) | `server/tests/routes/careerRoutes.test.js` | Pasa |
| CP-039 | Filtro por área (`?area=`): el servidor devuelve solo las carreras de esa área; los chips del catálogo se arman a partir del catálogo completo (decisión #28) | `server/tests/routes/careerRoutes.test.js` → "Filtro por área" · `client/src/__tests__/pages/CarrerasPage.test.jsx` → "arma los chips…" / "al elegir un chip…" | Pasa |
| CP-040 | Ficha de una carrera inexistente responde 404; el frontend muestra "No encontramos esa carrera" con enlace de vuelta | `server/tests/routes/careerRoutes.test.js` · `client/src/__tests__/pages/CarreraDetallePage.test.jsx` → "si la carrera no existe…" | Pasa |
| CP-041 | Cliente del catálogo: contrato de los endpoints (`getCareers` / `getCareer` → `GET /careers`, `GET /careers/:id`) | `client/src/__tests__/services/careerService.test.js` | Pasa |

Acumulado: **41 casos** (17 de aceptación + 24 complementarios).

---

# HU-05 — Comparar dos carreras

*Fase 6 · Prioridad media*

Escenarios de aceptación:

1. **Comparación válida.** Dado que el estudiante seleccionó dos carreras distintas, cuando
   elige "Comparar", entonces el sistema muestra ambas carreras lado a lado con sus
   atributos.
2. **Una sola carrera seleccionada.** Dado que el estudiante solo eligió una carrera,
   cuando intenta comparar, entonces el sistema le pide seleccionar una segunda carrera.
3. **Misma carrera repetida.** Dado la pantalla de comparación, cuando el estudiante elige
   la misma carrera en ambos lados, entonces el sistema avisa que las carreras deben ser
   diferentes.
4. **Cambiar una carrera.** Dado una comparación ya hecha entre dos carreras, cuando el
   estudiante cambia la segunda carrera, entonces el sistema actualiza la comparación con
   la nueva carrera.

## Casos de aceptación

| Caso | Escenario | Prueba automatizada | Resultado |
| --- | --- | --- | --- |
| CP-042 | 1 · Comparación válida | `server/tests/routes/careerCompareRoutes.test.js` → "Escenario 1: … lado a lado con sus atributos" · `client/src/__tests__/pages/ComparadorPage.test.jsx` → "muestra ambas carreras lado a lado…" | Pasa |
| CP-043 | 2 · Una sola carrera seleccionada | `server/tests/routes/careerCompareRoutes.test.js` → "Escenario 2: … pide seleccionar una segunda carrera" · `client/src/__tests__/pages/ComparadorPage.test.jsx` → "deshabilita «Comparar»…" | Pasa |
| CP-044 | 3 · Misma carrera repetida | `server/tests/routes/careerCompareRoutes.test.js` → "Escenario 3: … avisa que las carreras deben ser distintas" · `client/src/__tests__/pages/ComparadorPage.test.jsx` → "avisa que las carreras deben ser distintas…" | Pasa |
| CP-045 | 4 · Cambiar una carrera | `server/tests/routes/careerCompareRoutes.test.js` → "Escenario 4: … actualiza la comparación al pedirla de nuevo" · `client/src/__tests__/pages/ComparadorPage.test.jsx` → "al cambiar la segunda carrera, actualiza la comparación de inmediato" | Pasa |

Los escenarios 1 y 4 piden cosas distintas y hubo que distinguirlas en la prueba: la
primera comparación exige el clic explícito en "Comparar", pero una vez mostrada, cambiar
un select debe recalcular solo (decisión #31).

## Casos complementarios

| Caso | Qué cubre | Ubicación | Resultado |
| --- | --- | --- | --- |
| CP-046 | `GET /careers/compare` exige sesión iniciada (401 sin token) y responde 404 si alguna carrera no existe | `server/tests/routes/careerCompareRoutes.test.js` | Pasa |
| CP-047 | Botón "Comparar esta carrera" en la ficha (HU-04, decisión #29): enlaza a `/comparar?a=<id>` y precarga la Carrera A | `client/src/__tests__/pages/CarreraDetallePage.test.jsx` · `client/src/__tests__/pages/ComparadorPage.test.jsx` → "precarga la Carrera A…" | Pasa |
| CP-048 | Cliente del comparador: contrato del endpoint (`compareCareers` → `GET /careers/compare?a=&b=`) | `client/src/__tests__/services/careerService.test.js` | Pasa |
| CP-049 | Nav superior enlaza a "Carreras" y "Comparar" con sesión iniciada | `client/src/__tests__/components/AppHeader.test.jsx` | Pasa |

Acumulado: **49 casos** (21 de aceptación + 28 complementarios).

---

# HU-06 — Descargar perfil en PDF

*Fase 7 · Prioridad baja*

Escenarios de aceptación:

1. **Descarga exitosa.** Dado un perfil calculado, cuando el estudiante pide su reporte,
   entonces el sistema genera un PDF descargable con su perfil.
2. **Sin perfil, deshabilitado.** Dado que el estudiante no completó el cuestionario,
   cuando entra a "Mi huella", entonces el botón "Descargar reporte (PDF)" aparece
   deshabilitado con un texto de ayuda.
3. **Contenido del reporte.** Dado un perfil con áreas afines, cuando se genera el PDF,
   entonces incluye nombre, fecha, código Holland, áreas afines y al menos 3 carreras
   sugeridas, coincidiendo con "Mi huella" (mismo `recommendationService`, sin recalcular).

## Casos de aceptación

| Caso | Escenario | Prueba automatizada | Resultado |
| --- | --- | --- | --- |
| CP-050 | 1 · Descarga exitosa | `server/tests/routes/profileReportRoutes.test.js` → "Escenario 1: … descarga el PDF" · `client/src/__tests__/pages/ResultadoPage.test.jsx` → "con perfil, descarga el PDF al hacer clic" | Pasa |
| CP-051 | 2 · Sin perfil, deshabilitado | `server/tests/routes/profileReportRoutes.test.js` → "Escenario 2: … 404 PROFILE_NOT_FOUND" · `client/src/__tests__/pages/ResultadoPage.test.jsx` → "sin perfil, el botón de descarga está deshabilitado con ayuda" | Pasa |
| CP-052 | 3 · Contenido del reporte | `server/tests/routes/profileReportRoutes.test.js` → "Escenario 3: … fecha, áreas, ≥3 carreras" | Pasa |

La parte del escenario 3 que dice "coincidiendo con Mi huella" no se prueba comparando dos
salidas, sino por construcción: el PDF reutiliza el mismo `recommendationService` de HU-03
en lugar de recalcular la afinidad por su cuenta, así que no puede divergir.

## Casos complementarios

| Caso | Qué cubre | Ubicación | Resultado |
| --- | --- | --- | --- |
| CP-053 | `GET /profile/report` exige sesión iniciada (401 sin token) | `server/tests/routes/profileReportRoutes.test.js` | Pasa |
| CP-054 | Si falla la generación del reporte, el frontend muestra un mensaje de error inline (sin romper la pantalla) | `client/src/__tests__/pages/ResultadoPage.test.jsx` → "si falla la generación, muestra un mensaje de error" | Pasa |

Acumulado: **54 casos** (24 de aceptación + 30 complementarios).

---

# HU-07 — Gestión del banco de reactivos

*Fase 8 · Prioridad baja · Rol administrador*

Escenarios de aceptación:

1. **Crear un reactivo.** Dado el panel de admin, cuando el admin crea un reactivo con
   texto y tipo RIASEC, entonces el sistema lo agrega al banco y al cuestionario de
   inmediato.
2. **Editar un reactivo.** Dado un reactivo existente, cuando el admin edita su texto o
   tipo RIASEC, entonces el sistema guarda los cambios y los refleja en el banco.
3. **Desactivar un reactivo (soft delete).** Dado un reactivo activo, cuando el admin
   confirma desactivarlo en el modal, entonces deja de aparecer en el cuestionario pero sus
   respuestas históricas se conservan (nunca DELETE físico).
4. **Acceso restringido a estudiantes.** Dado un estudiante autenticado, cuando intenta
   entrar al banco de reactivos (API o pantalla), entonces el sistema le niega el acceso.
5. **Validación de campos.** Dado el formulario de crear/editar, cuando falta el texto o el
   tipo RIASEC no es válido, entonces el sistema rechaza la operación e indica el campo.

## Casos de aceptación

| Caso | Escenario | Prueba automatizada | Resultado |
| --- | --- | --- | --- |
| CP-055 | 1 · Crear un reactivo | `server/tests/routes/adminQuestionRoutes.test.js` → "Escenario 1: crear un reactivo" · `client/src/__tests__/pages/AdminReactivosPage.test.jsx` → "crea un reactivo válido y refresca el banco" | Pasa |
| CP-056 | 2 · Editar un reactivo | `server/tests/routes/adminQuestionRoutes.test.js` → "Escenario 2: editar un reactivo" · `client/src/__tests__/pages/AdminReactivosPage.test.jsx` → "precarga el formulario y guarda los cambios" | Pasa |
| CP-057 | 3 · Desactivar un reactivo (soft delete) | `server/tests/routes/adminQuestionRoutes.test.js` → "Escenario 3: desactivar (soft delete) un reactivo" · `client/src/__tests__/pages/AdminReactivosPage.test.jsx` → "Escenario 3: desactivar un reactivo" (pide confirmación, cancela, confirma) | Pasa |
| CP-058 | 4 · Acceso restringido a estudiantes | `server/tests/routes/adminQuestionRoutes.test.js` → "Escenario 4: acceso restringido a estudiantes" (403 en los 4 endpoints) · `client/src/__tests__/components/AdminRoute.test.jsx` → "Acceso denegado…" · `client/src/__tests__/components/AppHeader.test.jsx` → "un estudiante NO ve el enlace…" | Pasa |
| CP-059 | 5 · Validación de campos | `server/tests/routes/adminQuestionRoutes.test.js` → "Escenario 5: validación de campos" (texto vacío, tipo inválido, edición inválida) · `client/src/__tests__/pages/AdminReactivosPage.test.jsx` → "muestra errores si se intenta guardar sin texto ni tipo" | Pasa |

CP-057 es el caso que justifica toda la decisión de soft delete (#3): las respuestas
históricas de `answers` tienen FK a `questions`, así que un DELETE físico las destruiría.
La prueba verifica las dos mitades: que el reactivo desaparece del cuestionario y que sus
respuestas siguen ahí.

## Casos complementarios

| Caso | Qué cubre | Ubicación | Resultado |
| --- | --- | --- | --- |
| CP-060 | `PUT` / `DELETE /admin/questions/:id` responden 404 `QUESTION_NOT_FOUND` sobre un reactivo inexistente | `server/tests/routes/adminQuestionRoutes.test.js` | Pasa |
| CP-061 | `GET /admin/questions` exige sesión iniciada (401 sin token) | `server/tests/routes/adminQuestionRoutes.test.js` | Pasa |
| CP-062 | El enlace "Gestión de reactivos" del nav aparece únicamente para `user.role === 'admin'` (UX; la seguridad real es el `roleMiddleware` del servidor) | `client/src/__tests__/components/AppHeader.test.jsx` | Pasa |
| CP-063 | Cliente del banco de reactivos: contrato de los endpoints (`getQuestions` / `createQuestion` / `updateQuestion` / `deactivateQuestion`) | `client/src/__tests__/services/adminQuestionService.test.js` | Pasa |
| CP-064 | El listado del banco distingue reactivos activos e inactivos (chip "Inactivo") sin ocultarlos | `client/src/__tests__/pages/AdminReactivosPage.test.jsx` → "lista los reactivos…" | Pasa |

---

# Resumen al cierre del desarrollo

| Historia | De aceptación | Complementarios | Total | Rango |
| --- | --- | --- | --- | --- |
| HU-01 Registro e inicio de sesión | 5 | 10 | 15 | CP-001 … CP-015 |
| HU-02 Cuestionario vocacional | 4 | 7 | 11 | CP-016 … CP-026 |
| HU-03 Recomendación de áreas | 4 | 3 | 7 | CP-027 … CP-033 |
| HU-04 Catálogo de carreras | 4 | 4 | 8 | CP-034 … CP-041 |
| HU-05 Comparar dos carreras | 4 | 4 | 8 | CP-042 … CP-049 |
| HU-06 Descargar perfil en PDF | 3 | 2 | 5 | CP-050 … CP-054 |
| HU-07 Banco de reactivos | 5 | 5 | 10 | CP-055 … CP-064 |
| **Total** | **29** | **35** | **64** | |

Cierre del desarrollo con **64 casos** documentados y trazados, contra una meta inicial de
25. Los 29 escenarios de aceptación de las siete historias tienen prueba automatizada, o
sea que la cobertura de lo que el cliente firmó es completa. Los 35 complementarios son
decisión nuestra y cubren sobre todo seguridad (401/403 en todos los endpoints), casos
borde de los dos motores de cálculo y los estados vacío, de carga y de error de cada
pantalla.

Los 64 casos están en estado **Pasa** en la última corrida de `npm test`.
