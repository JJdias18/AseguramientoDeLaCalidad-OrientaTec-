# Matriz de trazabilidad — Caso de prueba ↔ Criterio de aceptación ↔ HU

> Se actualiza al cerrar cada historia (Definition of Done, `CLAUDE.md` §7.5).
> Meta del proyecto: **≥ 25 casos de prueba documentados y trazados** (`CLAUDE.md` §7.6).

## HU-01 — Registro e inicio de sesión (Fase 2)

| Caso   | Escenario (criterio de aceptación)                                        | Dado / Cuando / Entonces                                                                                                                            | Caso de prueba automatizado                                                                       | Resultado |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------- |
| CP-001 | Escenario 1: Registro exitoso                                              | Dado que el correo no está registrado, cuando el estudiante se registra con correo y contraseña válidos, entonces el sistema crea la cuenta y devuelve sesión iniciada. | `server/tests/routes/authRoutes.test.js` → "escenario 1: registra un usuario nuevo con datos válidos" | ✅ Pasa   |
| CP-002 | Escenario 2: Correo ya registrado                                          | Dado que el correo ya tiene cuenta, cuando alguien intenta registrarse de nuevo con ese correo, entonces el sistema rechaza el registro y no crea una segunda cuenta.    | `server/tests/routes/authRoutes.test.js` → "escenario 2: rechaza el registro con un correo ya usado"  | ✅ Pasa   |
| CP-003 | Escenario 3: Contraseña débil                                              | Dado el formulario de registro, cuando el estudiante ingresa una contraseña que no cumple el mínimo, entonces el sistema la rechaza e indica el requisito (8+ caracteres, letras y números). | `server/tests/routes/authRoutes.test.js` → "escenario 3: rechaza una contraseña débil"                | ✅ Pasa   |
| CP-004 | Escenario 4: Inicio de sesión correcto                                     | Dado que el estudiante ya tiene una cuenta, cuando inicia sesión con correo y contraseña correctos, entonces el sistema abre la sesión (token JWT) y devuelve sus datos. | `server/tests/routes/authRoutes.test.js` → "escenario 4: inicia sesión con credenciales correctas y devuelve un token" | ✅ Pasa   |
| CP-005 | Escenario 5: Credenciales incorrectas                                      | Dado que el estudiante tiene cuenta, cuando inicia sesión con una contraseña equivocada, entonces el sistema muestra "Correo o contraseña incorrectos" sin indicar cuál de los dos falló. | `server/tests/routes/authRoutes.test.js` → "escenario 5: rechaza credenciales incorrectas con mensaje genérico" | ✅ Pasa   |

### Cobertura complementaria de HU-01 (no exigida por los 5 escenarios, refuerza la validación de "Validaciones u otras observaciones")

| Caso   | Qué cubre                                                        | Ubicación                                                                                     | Resultado |
| ------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------- |
| CP-006 | Registro rechaza si faltan campos obligatorios                    | `server/tests/routes/authRoutes.test.js`                                                        | ✅ Pasa   |
| CP-007 | `GET /auth/me` rechaza sin token / acepta con token válido        | `server/tests/routes/authRoutes.test.js`                                                        | ✅ Pasa   |
| CP-008 | Contraseña se persiste hasheada con bcrypt (nunca en texto plano) | `server/tests/services/authService.test.js`                                                     | ✅ Pasa   |
| CP-009 | Middleware de autenticación (`requireAuth`) y de rol (`requireRole`) | `server/tests/middlewares/authMiddleware.test.js`, `server/tests/middlewares/roleMiddleware.test.js` | ✅ Pasa   |
| CP-010 | Formato de correo y fuerza de contraseña (`isValidEmail`/`isValidPassword`) | `server/tests/utils/validators.test.js`, `client/src/__tests__/utils/validators.test.js`        | ✅ Pasa   |
| CP-011 | Contraseña enmascarada con toggle "Mostrar/Ocultar" (accesible, `aria-pressed`) | `client/src/__tests__/components/PasswordField.test.jsx`                                        | ✅ Pasa   |
| CP-012 | Formulario de registro: campos obligatorios, error de contraseña débil al blur, éxito navega a "/", error de correo repetido con enlace a inicio de sesión | `client/src/__tests__/pages/RegisterPage.test.jsx`                                               | ✅ Pasa   |
| CP-013 | Formulario de inicio de sesión: éxito navega a "/", mensaje de error genérico, estado de carga del botón | `client/src/__tests__/pages/LoginPage.test.jsx`                                                  | ✅ Pasa   |
| CP-014 | Contexto de autenticación: restaura sesión con token guardado, limpia token vencido/inválido, login/logout | `client/src/__tests__/context/AuthContext.test.jsx`                                              | ✅ Pasa   |
| CP-015 | Ruta protegida redirige a inicio de sesión sin sesión activa; ruta de invitado redirige a "/" con sesión activa | `client/src/__tests__/components/ProtectedRoute.test.jsx`, `client/src/__tests__/components/GuestRoute.test.jsx` | ✅ Pasa   |

**Total de casos documentados hasta la Fase 2: 15** (5 de aceptación + 10 complementarios).

## HU-02 — Responder el cuestionario vocacional (Fase 3)

| Caso   | Escenario (criterio de aceptación)        | Dado / Cuando / Entonces                                                                                                                     | Caso de prueba automatizado                                                                                            | Resultado |
| ------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| CP-016 | Escenario 1: Cuestionario completo         | Dado un cuestionario de 30 reactivos, cuando el estudiante responde los 30 y presiona "Enviar", entonces el sistema genera el perfil y lo muestra. | `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 1: … genera el perfil vocacional"; `client/src/__tests__/pages/CuestionarioPage.test.jsx` → "escenario 1: … navega a /mi-huella" | ✅ Pasa   |
| CP-017 | Escenario 2: Cuestionario incompleto       | Dado que el estudiante dejó preguntas sin responder, cuando intenta enviar, entonces el sistema señala las faltantes y no permite enviarlo.        | `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 2: bloquea el envío…"; `client/src/__tests__/pages/CuestionarioPage.test.jsx` → "escenario 2: bloquea el envío incompleto" | ✅ Pasa   |
| CP-018 | Escenario 3: Retomar el avance             | Dado que respondió 15 de 30 y cerró la sesión, cuando vuelve a entrar, entonces lo ubica en la pregunta 16 conservando sus respuestas.             | `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 3: … lo ubica en la pregunta 16"; `client/src/__tests__/pages/CuestionarioPage.test.jsx` → "escenario 3: al retomar…" | ✅ Pasa   |
| CP-019 | Escenario 4: Cálculo del perfil            | Dado respuestas altas en reactivos investigativo y artístico, cuando el sistema calcula el perfil, entonces destaca esas dos áreas como predominantes. | `server/tests/services/scoringService.test.js` → "escenario 4 (HU-02)…"; `server/tests/routes/questionnaireRoutes.test.js` → "Escenario 4: … destacan esas dos áreas" | ✅ Pasa   |

### Cobertura complementaria de HU-02 (motor de scoring y validaciones)

| Caso   | Qué cubre                                                                                          | Ubicación                                                                     | Resultado |
| ------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------- |
| CP-020 | Motor de scoring puro: suma por tipo, código Holland, determinismo y casos borde (todas iguales, empates, extremos de la escala) | `server/tests/services/scoringService.test.js` (17 pruebas)                    | ✅ Pasa   |
| CP-021 | `GET /questions` exige sesión y devuelve solo reactivos activos (30, 5 por tipo)                    | `server/tests/routes/questionnaireRoutes.test.js`                              | ✅ Pasa   |
| CP-022 | Autosave (`PATCH …/answers`): reemplaza la respuesta previa del mismo reactivo                      | `server/tests/routes/questionnaireRoutes.test.js`                              | ✅ Pasa   |
| CP-023 | Validaciones del intento: reactivo ajeno (404), valor fuera de la escala 1–5 (400), reenvío de intento ya completado (409) | `server/tests/routes/questionnaireRoutes.test.js`                              | ✅ Pasa   |
| CP-024 | Escala 1–5 accesible (radiogroup, extremos rotulados, selección por número)                        | `client/src/__tests__/components/EscalaRespuesta.test.jsx`                      | ✅ Pasa   |
| CP-025 | Cliente del cuestionario: contrato de los endpoints (`getQuestions`/`startAttempt`/`saveAnswer`/`submit`/`getProfile`) | `client/src/__tests__/services/questionnaireService.test.js`                   | ✅ Pasa   |
| CP-026 | Resultado ("Mi huella"): muestra huella hero, leyenda con valores y código Holland; estado vacío sin perfil | `client/src/__tests__/pages/ResultadoPage.test.jsx`                            | ✅ Pasa   |

**Total de casos documentados hasta la Fase 3: 26** (9 de aceptación + 17 complementarios) — se supera la meta global de ≥ 25 casos (`CLAUDE.md` §7.6).
