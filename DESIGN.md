# DESIGN.md — Sistema de diseño "Huella" · Brújula Vocacional

> Fuente de verdad visual del proyecto (Fase 1.5, dirección elegida por el equipo).
> Toda pantalla de las fases 2–8 se deriva de este documento y de
> `client/src/styles/tokens.css`. **Ningún color, tamaño, radio ni duración se
> hardcodea fuera de tokens.css.** Si una pantalla necesita algo que no está acá,
> se agrega primero en la sección **Extensiones** (con una línea de justificación)
> y en tokens.css; nunca se improvisa en el código.
>
> Proceso que respaldó esta dirección: 3 direcciones propuestas
> (`docs/design/DIRECCIONES.md`), elección del equipo, `/impeccable critique`
> (snapshot en `.impeccable/critique/`), corrección de hallazgos y polish.

---

## 1. Concepto

**Nadie mezcla los seis intereses igual que vos: tu perfil vocacional es una huella
de color irrepetible.**

El dato central del producto (el vector RIASEC de 6 dimensiones) ES la identidad
visual. La franja de seis tintas proporcionales al puntaje — **la huella** — es a la
vez la visualización del perfil, la marca (el logo es una mini-huella), el avatar
del estudiante, el indicador de avance del cuestionario (la huella se va
construyendo al responder) y el argumento de cada recomendación (cada área muestra
su propia huella para comparar). Un solo motivo, cinco trabajos.

Personalidad: **orientador, luminoso, preciso** (ver `client/PRODUCT.md`). La base
es blanca y aireada; el carácter viene del jade, de Bricolage Grotesque y de la
huella. Nunca de fondos oscuros ni de decoración.

## 2. Paleta (tokens en `client/src/styles/tokens.css`)

### 2.1 Base e interfaz

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--color-fondo` | `#ffffff` | Fondo de toda la app | — |
| `--color-tinta` | `#1b211b` | Texto principal | 16.4:1 s/ fondo |
| `--color-musgo` | `#576157` | Texto secundario, labels | 6.5:1 s/ fondo |
| `--color-jade` | `#1d6835` | Primario: acciones, enlaces, foco, selección, énfasis | blanco s/ jade 6.8:1 |
| `--color-jade-oscuro` | `#145228` | Hover/active del primario | — |
| `--color-brote` | `#eef6ef` | Paneles suaves, fondos de estado | tinta s/ brote 14.9:1 |
| `--color-hairline` | `#d2dfd4` | Separadores, bordes decorativos | — |
| `--color-borde` | `#6f7a6f` | Bordes de componentes interactivos | 4.6:1 (≥3:1 UI) |
| `--color-error` | `#b3261e` | Texto/borde de error | 5.9:1 s/ fondo |
| `--color-error-suave` | `#fcedeb` | Fondo de mensajes de error | — |

Reglas: el jade es **el único** color de acción; nunca se usa decorativamente.
El texto sobre fondos de color usa blanco en rellenos saturados (jade, error) y
`--color-tinta` en rellenos pálidos (brote, error-suave). Gris sobre color: prohibido.

### 2.2 Las seis tintas RIASEC (solo datos)

Validadas para daltonismo (protan/deutan, ΔE adyacente mínimo 17.5 en el orden de
la franja) y ≥3:1 sobre blanco. **Solo** se usan en huellas y visualizaciones del
perfil; jamás en botones, enlaces o decoración. El color nunca va solo: siempre
acompañado de letra/nombre y valor en tinta de texto.

| Token | Hex | Dimensión |
|---|---|---|
| `--tinta-r` | `#c7692c` | Realista |
| `--tinta-i` | `#2e69b2` | Investigativo |
| `--tinta-a` | `#db509c` | Artístico |
| `--tinta-s` | `#3b9555` | Social |
| `--tinta-e` | `#c38300` | Emprendedor |
| `--tinta-c` | `#564692` | Convencional |

**Orden fijo R-I-A-S-E-C en toda huella** (es el orden del hexágono de Holland y el
que garantiza la separación CVD entre vecinos). El ranking se comunica con texto
(negrita + "●" en jade para las dominantes), no reordenando colores.

## 3. Tipografía

| Rol | Familia (Google Fonts) | Pesos | Uso |
|---|---|---|---|
| Display | **Bricolage Grotesque** | 500–800 (variable, opsz 12–96) | h1–h3, cifras grandes (%, puntajes destacados), nombre de áreas/carreras |
| Cuerpo/UI | **Instrument Sans** | 400–700 | Todo lo demás: párrafos, labels, botones, inputs, tablas |

Escala fija en rem (registro producto, sin clamp salvo el h1 de resultados):
`--fs-xs` 0.78 · `--fs-sm` 0.85 · `--fs-base` 1 · `--fs-md` 1.2 · `--fs-lg` 1.5 ·
`--fs-xl` 2 · `--fs-display` clamp(2rem, 6.5vw, 3.2rem).

Reglas: line-height 1.6 en prosa, 1.05–1.2 en display; `letter-spacing` negativo
solo en display (−0.02 a −0.03em); `text-wrap: balance` en h1–h3; números tabulares
(`font-variant-numeric: tabular-nums`) en todo dato alineado; prosa ≤ 65ch
(`--medida-prosa`). Texto mínimo en móvil: 14px equivalente (0.875rem) — `--fs-xs`
solo para metadatos no esenciales.

## 4. El elemento firma: la huella

Componente central con cinco variantes. Todas usan las 6 tintas en orden R-I-A-S-E-C,
gap de 3px (2px en tamaños mini), esquinas redondeadas exteriores.

| Variante | Tamaño | Uso |
|---|---|---|
| **Hero** | 112px alto, ancho completo | Resultados: el momento de revelación. `role="img"` + aria-label con los 6 valores y el máximo |
| **Progreso** | 12px alto, ancho completo | Cuestionario: cada banda crece al responder preguntas de su dimensión (ver §7.3) |
| **Eco** | 16px alto, máx 240px, rótulo "La huella del área:" | Cards de área y fichas: la huella del área para comparar. `aria-hidden` (el porqué textual la acompaña) |
| **Mini** | 26×18px, radio 5px | Logo, avatar del estudiante, favicon |
| **Esqueleto / Vacía** | 40px alto | Cargando (segmentos `--color-hairline` pulsando) / estado sin perfil (celdas con borde punteado `--color-borde`) |

Momento de entrada (hero): animación `asentar` — opacity 0.35→1 + translateY(10px)→0,
0.7s, curva `--curva-salida`. **Visible desde el primer fotograma** (nunca gatear
visibilidad en una animación) y anulada bajo `prefers-reduced-motion`.

## 5. Componentes base

Todo componente interactivo define: default, hover, focus-visible, active, disabled
y (si aplica) loading y error. Foco visible global: `outline: 2.5px solid
var(--color-jade); outline-offset: 2px`.

- **Botón primario** — relleno jade, texto blanco, `border-radius: var(--radio-pill)`,
  padding 0.9rem 1.7rem, peso 600. Hover: jade-oscuro. Active: translateY(1px).
  Disabled: fondo brote + texto musgo + `cursor: not-allowed` (siempre con texto de
  ayuda al lado explicando el porqué). Full-width en móvil dentro de formularios.
- **Botón secundario** — transparente, texto jade, borde 1.5px `--color-borde`
  (hover: borde jade). Mismos radios y padding.
- **Enlace de acción** ("Ver N carreras del área →") — jade, peso 600, flecha con
  `margin-left`, área táctil `min-height: 44px`. Hover: subrayado offset 3px.
- **Input de texto** — borde 1.5px `--color-borde`, radio `--radio-s`, padding
  0.75rem 0.9rem, label real arriba (peso 600, `--fs-sm`), nunca placeholder como
  label. Error: borde y mensaje `--color-error` bajo el campo, con icono y texto que
  dice qué pasó y cómo resolverlo. Campo de contraseña con botón "Mostrar" integrado
  (accesible, `aria-pressed`).
- **Card de área/carrera** — borde 1.5px hairline, radio `--radio`, padding 1.25rem;
  la principal usa borde jade 2px. % de afinidad en Bricolage 1.5rem arriba a la
  derecha (grid `1fr auto`, nunca flex-wrap). Sin sombras: la dirección usa bordes.
- **Panel suave** — fondo brote, radio `--radio-s`, para el código Holland,
  avisos y ayudas contextuales.
- **Escala 1–5 (cuestionario)** — 5 segmentos tocables ≥48px de alto, radio
  `--radio-s`, borde `--color-borde`; seleccionado: relleno jade + texto blanco.
  Extremos rotulados: "1 · Nada que ver conmigo" / "5 · Totalmente yo". Operable
  con flechas del teclado (radiogroup).
- **Tab bar móvil** (<720px) — fija abajo, 4 destinos (Cuestionario, Mi huella,
  Carreras, Comparar), icono 22px + label 0.72rem, activo en jade,
  `env(safe-area-inset-bottom)`. En ≥720px la nav vive arriba (logo + enlaces +
  avatar-botón de 44px). El contenido reserva `padding-bottom` para no quedar tapado.
- **Modal de confirmación** (solo acciones destructivas/irreversibles, p. ej.
  desactivar reactivo) — `<dialog>` nativo, máx 28rem, título display, consecuencias
  en prosa, botón destructivo en `--color-error` + "Cancelar" secundario. Fondo
  `rgb(27 33 27 / 0.45)`.
- **Toast/indicador de autosave** — texto discreto "Guardado ✓" en musgo junto al
  progreso; en error de guardado pasa a `--color-error` con reintento.
- **Tabla admin** — encabezados `--fs-sm` peso 700, filas separadas por hairline,
  reactivos inactivos con texto musgo + chip "Inactivo"; acciones por fila como
  enlaces jade ("Editar", "Desactivar").

Capas (z-index semántico): contenido 0 · tab bar 10 · dropdown 20 · fondo de modal
30 · modal 40 · toast 50 (`--z-*`).

## 6. Movimiento

- Transiciones de estado: 150ms (`--dur-rapida`), propiedades de color únicamente.
- Entradas de contenido: 300–700ms con `--curva-salida`
  (cubic-bezier(0.16, 1, 0.3, 1)). Sin bounce, sin elastic, sin animar layout.
- La huella de progreso anima el ancho de la banda que acaba de crecer (transform
  scaleX en un wrapper, no width).
- **Todo** efecto envuelto en `@media (prefers-reduced-motion: no-preference)`;
  la alternativa es aparición instantánea. Nada de secuencias orquestadas de carga.

## 7. Especificación por pantalla

Toda pantalla tiene estados **vacío, cargando y de error** explícitos, usa la nav
del §5 y cumple: mobile-first 360px, AA, foco visible, labels reales, teclado.

### 7.1 Registro (HU-01)
Formulario de una columna (máx 26rem centrado): nombre completo, correo,
contraseña (con "Mostrar" y ayuda "mínimo 8 caracteres con letras y números").
Todos obligatorios y marcados. Validación inline al blur; al enviar, el primer
error recibe foco. Correo repetido: error bajo el campo de correo con enlace a
iniciar sesión. Éxito → directo al estado "Aún no tenés tu huella" (§7.4).

### 7.2 Inicio de sesión (HU-01)
Correo + contraseña + "Mostrar". Error **genérico** en panel error-suave sobre el
formulario: "Correo o contraseña incorrectos. Revisá los datos e intentá de nuevo."
(nunca dice cuál falló). Loading: botón con spinner y `aria-busy`.

### 7.3 Cuestionario (HU-02)
- **Intro**: qué es, 30 preguntas, ~8 minutos, escala 1–5, "podés salir y retomar
  cuando querás". CTA "Empezar".
- **Pregunta**: una por vista. Arriba: **huella de progreso** (las bandas crecen
  con cada respuesta de su dimensión — el estudiante ve su huella formándose) +
  "Pregunta 12 de 30" (`aria-live="polite"`). Centro: texto de la pregunta en
  display + escala 1–5. Abajo: "Anterior" (enlace) / "Siguiente" (primario);
  autosave discreto "Guardado ✓" tras cada respuesta.
- **Retomar**: al volver, panel brote "Retomaste donde quedaste: pregunta 12 de 30"
  y continúa en la primera sin responder.
- **Envío incompleto**: bloqueado; aviso con la lista de números pendientes como
  enlaces y foco en la primera sin responder.
- **Envío**: pantalla "Calculando tu huella…" con esqueleto (§4) y texto de espera;
  al terminar navega a resultados. Error de cálculo: mensaje con reintento, las
  respuestas nunca se pierden.

### 7.4 Mi huella / Resultados (HU-03 + HU-06)
Implementada como la preview congelada `docs/design/direcciones/02-huella.html`:
saludo con fecha, h1 "Esta huella es solo tuya", huella hero, leyenda en orden
R-I-A-S-E-C con `valor / 25` y clave de dominantes, panel del código Holland
traducido a narrativa, ≥3 cards de área (%, eco rotulado, porqué, "Ver N carreras
del área →"), acciones: "Descargá tu huella en PDF" (primario; deshabilitado con
ayuda si no hay perfil), "Repetir el cuestionario" (secundario; al confirmar avisa
que el perfil anterior se conserva en el historial y el nuevo lo reemplaza como
vigente), nota metodológica con "¿Cómo se calcula?".
**Vacío (sin perfil)**: huella vacía punteada + "Aún no tenés tu huella" + CTA al
cuestionario. **Cargando**: esqueleto. **Error**: panel con reintento.

### 7.5 Carreras — catálogo (HU-04)
Búsqueda (input con label "Buscá una carrera", insensible a acentos/mayúsculas) +
filtro por área (chips u select según ancho). Resultados como lista de cards:
nombre (display), área con punto de su tinta dominante, duración y una línea de
campo laboral. **Sin resultados**: "No se encontraron carreras para «panaderia».
Probá con otro nombre o quitá el filtro." + acción para limpiar. Cargando: 3 cards
esqueleto.

### 7.6 Carreras — ficha (HU-04)
Nombre en display, área, duración; secciones: Descripción, Campo laboral, Perfil
del estudiante; eco del área; acciones "Comparar esta carrera" (secundario) y
volver al catálogo (enlace).

### 7.7 Comparador (HU-05)
Dos selects A/B con label. Elegir la misma dos veces: error inline bajo el segundo
select ("Elegiste la misma carrera dos veces. Cambiá una para poder comparar.");
falta una: botón deshabilitado con ayuda. Resultado: tabla lado a lado (Área,
Duración, Campo laboral, Perfil) con las dos columnas encabezadas por el nombre en
display; en <720px las filas se apilan por atributo manteniendo los dos valores
juntos. Cambiar un select recalcula de inmediato.

### 7.8 Admin — banco de reactivos (HU-07)
Solo rol admin (ruta protegida; estudiante recibe "Acceso denegado" con enlace a
inicio). Tabla (§5) con texto, dimensión RIASEC (letra + nombre), estado
activo/inactivo y acciones. Crear/editar en formulario (texto y dimensión
obligatorios). **Desactivar** (nunca "eliminar"): modal de confirmación que explica
consecuencias — "El reactivo deja de aparecer en el cuestionario de inmediato. Las
respuestas ya registradas se conservan." Aviso post-acción en toast.

### 7.9 PDF (HU-06)
La constancia impresa hereda el sistema: mini-huella como membrete, huella hero,
leyenda con valores, código Holland, ≥3 áreas con % y ≥3 carreras sugeridas,
nombre y fecha. Tipografías embebidas por pdfkit (mismas familias).

## 8. Voz y microcopy

Español de Costa Rica, **voseo**, cercano sin infantilizar. Los errores dicen qué
pasó y cómo resolverlo; no se disculpan ni son vagos ("Necesitás completar el
cuestionario para poder descargar tu huella", nunca "¡Ups! Algo salió mal").
El resultado se presenta como hallazgo personal ("Esta huella es solo tuya"),
jamás como sentencia; los puntajes bajos no se describen como carencias.
Vocabulario fijo: "preguntas" (no "reactivos" de cara al estudiante — "reactivos"
solo en el admin), "Mi huella" (no "Mi perfil"), "dimensiones" o "tintas" (no
"factores"), "Desactivar" (no "Eliminar").

## 9. Accesibilidad (parte del DoD)

Contraste AA verificado por cálculo (tablas §2); tintas RIASEC validadas CVD con el
orden fijo como mecanismo de seguridad; el color nunca es el único canal (letras,
nombres, valores, ●+negrita); foco visible en todo; labels reales; radiogroup
navegable en la escala 1–5; `role="img"` + aria-label en huellas informativas y
`aria-hidden` en las decorativas; targets táctiles ≥44px; `prefers-reduced-motion`;
zoom 200% sin pérdida (la tab bar cubre la nav cuando el breakpoint colapsa).

## 10. Extensiones

*(Vacía. Todo lo nuevo se anota acá con una línea de justificación antes de usarse.)*
