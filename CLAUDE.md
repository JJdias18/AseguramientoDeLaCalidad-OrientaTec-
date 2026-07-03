# CLAUDE.md — Brújula Vocacional

> Este archivo es el contexto permanente del proyecto. Claude Code lo lee en cada
> sesión. **Leé también `PLAN.md`** antes de escribir código: ahí está el plan
> lineal por fases, el modelo de datos y el contrato de API. No adelantes fases.

---

## 1. Qué es el proyecto

Sistema **web** de orientación vocacional para estudiantes próximos a ingresar a la
universidad. El estudiante se registra, responde un cuestionario de intereses y
habilidades basado en el modelo **RIASEC / Holland**, obtiene un perfil vocacional,
recibe **áreas académicas afines** ordenadas por afinidad, consulta y compara
carreras, y puede descargar su perfil en PDF. Hay un rol **administrador** que
gestiona el banco de reactivos.

Cliente: OrientaTec Costa Rica S.A. (empresa ficticia, EdTech). El proyecto es a la
vez un caso de **aseguramiento de la calidad de software** bajo **ISO/IEC 25010**:
la meta no es solo que funcione, sino tener pruebas documentadas y trazables.

## 2. Arquitectura

Web cliente-servidor en **tres capas**, en un monorepo con dos paquetes:

```
/client   → React (Vite). Capa de presentación.
/server   → Node.js + Express. Capa de lógica/servicios + acceso a datos.
/docs     → especificación, casos de prueba, trazabilidad, métricas, Postman.
PostgreSQL → capa de datos (local o en docker-compose).
```

El frontend consume el backend solo por la API REST (`/api/v1/...`). Nada de lógica
de negocio en el cliente que dependa de datos sensibles.

## 3. Stack (fijo — decisiones ya tomadas, no cambiar sin acordarlo con el equipo)

- **Frontend:** React 18, JavaScript ES6+, HTML5, CSS3, Vite.
- **Backend:** Node.js + Express. Driver **pg** (sin ORM: el estándar del proyecto es
  SQL estándar).
- **Base de datos:** PostgreSQL. Migraciones con **node-pg-migrate** escritas en SQL
  crudo. Búsqueda sin acentos con la extensión **unaccent** (se habilita por migración).
- **Auth:** JWT (expiración **24 h**, sin refresh tokens) + **bcrypt**.
- **PDF:** **pdfkit** (generación server-side; no usar navegador headless).
- **Pruebas:** Jest (unitarias) + Supertest (API). **Colección Postman** exportada y
  versionada en `/docs/postman_collection.json`, actualizada en cada fase de backend.
- **Lint/format:** ESLint (base Airbnb) + Prettier.
- **Control de versiones:** Git + GitHub.

## 4. Estándar de código (aplicar siempre)

- Indentación de **2 espacios**. Comillas **simples**. **Punto y coma** obligatorio.
- Longitud máxima de línea: **100 caracteres**.
- Variables y funciones: **camelCase**. Constantes: **UPPER_SNAKE_CASE**.
- Componentes y clases React: **PascalCase**. Archivos de componente: `PascalCase.jsx`.
- Utilidades y servicios: `camelCase.js`.
- **JSDoc** en funciones complejas; comentarios descriptivos donde ayuden.
- **try-catch obligatorio** en toda operación asíncrona; errores centralizados.
- ESLint y Prettier deben pasar limpio antes de cerrar cualquier tarea.

## 5. Estándar de base de datos

- Nombres de tabla en **snake_case y plural** (`users`, `questions`, `careers`).
- Columnas en **snake_case**. PK: `id`. FK: `<entidad>_id` (`user_id`, `area_id`).
- Toda tabla lleva `created_at` y, cuando aplique, `updated_at`.
- Enums documentados (p. ej. `users.role` ∈ {`student`, `admin`}).
- Cambios de esquema **solo por migración versionada**, nunca a mano en la BD.
- Datos de arranque (reactivos, áreas, carreras) por **seeds** reproducibles.
- **Borrado de reactivos = soft delete** (`questions.is_active = false`). Nunca DELETE
  físico: las respuestas históricas (`answers`) referencian reactivos y deben
  conservarse. El cuestionario solo sirve reactivos activos.

## 6. Git y flujo de trabajo

- Ramas: `main` (estable), `develop` (integración), `feature/*` (una por fase/historia).
- Una rama `feature/hu-0X-...` por historia de usuario. PR hacia `develop`.
- Commits pequeños y descriptivos (estilo Conventional Commits: `feat:`, `fix:`,
  `test:`, `chore:`, `docs:`).

## 7. Definition of Done (por historia)

Una historia se considera terminada cuando:

1. El código cumple el estándar (sección 4) y ESLint/Prettier pasan limpio.
2. Existen pruebas que cubren **cada escenario de sus criterios de aceptación**
   (los `Dado/Cuando/Entonces` del documento de historias).
3. Las pruebas pasan (`npm test`).
4. Los endpoints nuevos quedan agregados a la **colección Postman** de `/docs`.
5. Se registró la traza en `/docs/trazabilidad.md` (caso de prueba ↔ criterio ↔ HU).
6. Meta global del proyecto: **≥ 25 casos de prueba documentados y trazados**.

## 8. Frontend — importante

- **El diseño visual lo generás vos**, siguiendo **`DESIGN_BRIEF.md`** y la skill
  **frontend-design**. Los mockups del PDF de historias son referencia funcional,
  no visual: su estética fue rechazada y está prohibida.
- La dirección de arte se decide en la **Fase 1.5** de `PLAN.md` (propuestas →
  elección del equipo → entregables → aprobación). No implementes pantallas React
  antes de que exista un `DESIGN.md` aprobado.
- Después de la aprobación, `DESIGN.md` (escrito por vos) es la fuente de verdad.
  Tokens en `client/src/styles/tokens.css`; ningún color ni tamaño hardcodeado
  fuera de ese archivo.
- **Mobile-first y responsive.** Accesibilidad **WCAG AA** (contraste, foco visible,
  labels en formularios, navegación por teclado).
- Estados vacíos, de carga y de error explícitos en cada pantalla.

## 9. Seguridad (mínimos no negociables)

- Contraseñas con **bcrypt**; jamás en logs ni en respuestas de la API.
- **JWT** en header `Authorization: Bearer`, expiración 24 h. Middleware de rol para
  rutas de admin.
- **Validación de input** en todos los endpoints (formato de correo, longitud de
  contraseña ≥ 8 con letras y números, tipos de datos).
- **Login con mensaje genérico**: “Correo o contraseña incorrectos”, sin revelar cuál
  de los dos falló (criterio de HU-01).
- Secretos en `.env` (no se commitea). Incluir `.env.example`.

## 10. Cómo trabajás en este repo

- Seguí **`PLAN.md`** en orden. Una fase a la vez. No mezcles fases.
- Al terminar una fase: corré lint + pruebas, marcá el checklist de esa fase en
  `PLAN.md`, dejá un resumen corto de lo hecho, y **detenete para revisión** antes de
  empezar la siguiente.
- Si una decisión no está en `CLAUDE.md` ni en `PLAN.md`, proponé la opción más simple
  y consistente con el stack, dejala anotada en `PLAN.md` bajo “Decisiones tomadas”,
  y seguí.
