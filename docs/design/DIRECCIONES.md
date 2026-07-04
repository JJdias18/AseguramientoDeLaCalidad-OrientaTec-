# Fase 1.5 · Direcciones de arte — Brújula Vocacional

> **DECISIÓN (3 de julio de 2026): el equipo eligió la dirección 2 · "Huella".**
> Tras la elección se le corrió `/impeccable critique` (26/40, 3×P1 + 2×P2, detector
> limpio) y se corrigieron todos los hallazgos P1+P2+menores antes de congelarla:
> escala visible (`23 / 25`), tab bar móvil, leyenda en el orden de la franja con
> clave de dominantes accesible, ecos de 16px con rótulo, targets táctiles ≥44px,
> borde de botón secundario ≥3:1, jerga ("reactivos"→"preguntas") y muestra de
> estados (cargando / vacío / PDF deshabilitado). La fuente de verdad pasa a ser
> **`DESIGN.md`** (raíz). Las direcciones 1 y 3 quedan como registro del proceso.

> Tres direcciones distintas para la identidad visual, cada una con una preview HTML
> de la **pantalla de resultados** con los mismos datos de muestra (Valeria, código
> IAE, tres áreas afines). Abrí `docs/design/direcciones/index.html` para verlas
> lado a lado en vista móvil, o cada archivo en su pestaña para el layout de
> escritorio.
>
> **Restricciones aplicadas a las tres:** base blanca pura y luminosa (nada de
> interfaces oscuras; el color oscuro solo en texto y detalles), contraste WCAG AA
> verificado por cálculo, mobile-first usable a 360px, tipografías de Google Fonts,
> voseo costarricense, `prefers-reduced-motion` respetado, foco visible.

---

## Dirección 1 · Norte propio

**Concepto (una frase):** la orientación vocacional como cartografía personal — la
app es un instrumento de precisión que te ayuda a trazar tu propio norte.

**Preview:** `direcciones/01-norte-propio.html`

### Paleta

| Nombre | Hex | Uso | Contraste s/ blanco |
|---|---|---|---|
| Papel | `#ffffff` | Fondo | — |
| Tinta de carta | `#142234` | Texto principal | 16.1:1 |
| Gris carta | `#556272` | Texto secundario | 6.2:1 |
| Vermellón señal | `#b63613` | Acento: acciones, dominantes, la aguja | 6.0:1 (blanco s/ vermellón) |
| Azul meridiano | `#284e7d` | Enlaces, acento secundario | 8.5:1 |
| Milimetrado | `#f1f7fb` | Retícula de fondo, paneles | — |

### Tipografías

- **Display/UI:** Archivo (variable, se usa expandido en títulos — voz técnica y segura).
- **Datos:** IBM Plex Mono (puntajes, fechas, metadatos — el registro "instrumento").

### Elemento firma

**La rosa RIASEC**: el perfil de 6 dimensiones dibujado como rosa de los vientos
sobre graticulado fino, con una **aguja que apunta a tu tipo dominante**. El fondo
de papel milimetrado y los datos en mono extienden la metáfora cartográfica a toda
la app. En el cuestionario, el avance sería un trayecto punteado en el mapa que se
va recorriendo (misma gramática que el marcador ◆ de afinidad por área).

### Por qué no es genérica

El radar no es decorativo: el modelo de Holland **es** un hexágono (RIASEC es un
circumplex), así que la rosa usa la geometría real del instrumento. La personalidad
viene del vermellón + mono + retícula, no del fondo. Nada que ver con el mockup
rechazado (crema/serif/oliva).

---

## Dirección 2 · Huella

**Concepto (una frase):** nadie mezcla los seis intereses igual que vos — tu perfil
vocacional es una huella de color irrepetible.

**Preview:** `direcciones/02-huella.html`

### Paleta

| Nombre | Hex | Uso | Contraste s/ blanco |
|---|---|---|---|
| Blanco | `#ffffff` | Fondo | — |
| Carbón selva | `#1b211b` | Texto principal | 16.4:1 |
| Musgo | `#576157` | Texto secundario | 6.5:1 |
| Jade | `#1d6835` | Primario: acciones, énfasis | 6.8:1 (blanco s/ jade) |
| Brote | `#eef6ef` | Paneles suaves | — |
| + 6 tintas RIASEC | R `#c7692c` · I `#2e69b2` · A `#db509c` · S `#3b9555` · E `#c38300` · C `#564692` | Solo datos (la huella) | todas ≥ 3:1 |

Las 6 tintas RIASEC pasaron el validador de visualización de datos: banda de
luminosidad, croma, **separación para daltonismo** (peor par adyacente ΔE 17.5 bajo
protanopía; mínimo exigido 12) y contraste ≥ 3:1 sobre blanco. El color nunca va
solo: siempre acompañado de letra, nombre y valor en tinta de texto.

> Nota sobre el jade: el verde del mockup rechazado era **oliva sobre crema**; este
> es un jade saturado sobre blanco puro, en un rol distinto (primario de acción, no
> atmósfera). Si el equipo prefiere alejarse de todo verde, el primario puede
> moverse al índigo `#564692` sin tocar el resto de la dirección.

### Tipografías

- **Display:** Bricolage Grotesque (con carácter propio — cercana sin ser infantil).
- **Cuerpo/UI:** Instrument Sans (neutral, muy legible en móvil).

### Elemento firma

**La huella vocacional**: la franja de 6 bandas de color proporcionales al puntaje.
Es a la vez la visualización del perfil, la marca del producto (el logo es una
mini-huella), el avatar del estudiante y el "porqué" de cada recomendación (cada
área muestra su propia mini-huella para comparar con la tuya). En el cuestionario,
el avance sería la huella **construyéndose** banda a banda conforme respondés.

### Por qué no es genérica

El sistema entero sale del dato central del producto (la mezcla de 6 dimensiones);
la franja funciona como identidad personal, no como gráfico decorativo. Es la
dirección más cálida y "joven" de las tres sin recurrir a gamificación.

---

## Dirección 3 · Constancia

**Concepto (una frase):** tu resultado merece el peso de un documento — una
constancia editorial que da orgullo imprimir, con tu código Holland como monograma.

**Preview:** `direcciones/03-constancia.html`

### Paleta

| Nombre | Hex | Uso | Contraste s/ blanco |
|---|---|---|---|
| Papel | `#ffffff` | Fondo | — |
| Tinta | `#1b1b1b` | Texto principal | 17.2:1 |
| Gris pluma | `#5b5b5b` | Texto secundario | 6.8:1 |
| Ciruela | `#871459` | Acento: monograma, acciones, dominantes | 9.2:1 (blanco s/ ciruela) |
| Señalador | `#fcea7f` | Resaltado tipo marcador (con texto en tinta) | 14.1:1 (tinta s/ señalador) |
| Ceniza | `#f5f5f5` | Paneles | — |

### Tipografías

- **Display:** Ibarra Real Nova — serif de la Imprenta Real española (s. XVIII),
  tradición tipográfica del español. Distintiva; no es ninguna de las serifs de
  moda en diseño generado por IA.
- **Cuerpo/UI:** Public Sans (registro cívico/documental, tabular para datos).

### Elemento firma

**El monograma Holland**: tu código (IAE) compuesto en cuerpo gigante como sello
personal — encabeza los resultados, la portada del PDF (HU-06) y tu perfil. Lo
acompañan dos gestos editoriales: la **matriz de puntos** (cada punto del puntaje
es un punto contable — no una barra) y los **puntos conductores** de índice para
las áreas afines. En el cuestionario, el avance sería el folio del documento
completándose ("reactivo 12 de 30" como paginación).

### Por qué no es genérica (y por qué la serif no es la del mockup)

La estética rechazada era crema + serif "artesanal" + oliva: atmósfera de plantilla
tibia. Acá la serif trabaja en un registro **documental** sobre blanco puro, con
ciruela y resaltador de texto — la referencia es el acta y el impreso editorial, no
la calidez genérica. Es también la dirección que mejor conversa con el entregable
PDF y con la evaluación académica del proyecto. Si el equipo prefiere eliminar toda
serif, esta dirección se descarta completa (su carácter depende de ella).

---

## Comparación rápida

| | 1 · Norte propio | 2 · Huella | 3 · Constancia |
|---|---|---|---|
| Personalidad | Instrumento preciso | Identidad viva | Documento con peso |
| Acento | Vermellón `#b63613` | Jade `#1d6835` + 6 tintas | Ciruela `#871459` + señalador |
| Par tipográfico | Archivo + IBM Plex Mono | Bricolage Grotesque + Instrument Sans | Ibarra Real Nova + Public Sans |
| Firma | Rosa RIASEC con aguja | Huella de 6 bandas | Monograma Holland |
| Perfil RIASEC | Radar hexagonal (geometría real del modelo) | Franja proporcional de color | Matriz de puntos contables |
| Riesgo a vigilar | Que el registro técnico se sienta frío | Gestionar 6 colores con disciplina | Serif ≈ ingrediente del mockup vetado |

**Siguiente paso (según PLAN.md):** el equipo elige una dirección (o pide ajustes).
Con la elegida se producen `DESIGN.md`, `client/src/styles/tokens.css` y
`docs/prototipo.html`, y se pausa de nuevo para aprobación.
