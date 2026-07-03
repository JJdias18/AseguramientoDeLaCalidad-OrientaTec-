# DESIGN_BRIEF.md — Brief de diseño · Brújula Vocacional

> Vos (Claude Code) sos el diseñador del frontend. Las ideas visuales son tuyas.
> Este brief define el problema, la audiencia y las restricciones que no se pueden
> romper — no el resultado. Antes de diseñar cualquier cosa, **cargá y aplicá la
> skill `frontend-design`**.

---

## 1. El encargo

Diseñar desde cero la identidad visual y las pantallas de **Brújula Vocacional**,
un sistema web que ayuda a estudiantes costarricenses recién salidos del colegio
(17–19 años) a descubrir su perfil vocacional (modelo RIASEC/Holland) y explorar
carreras. El producto debe sentirse **confiable pero cercano**: lo van a usar
adolescentes en su celular, pero también lo van a evaluar colegios y un profesor
de aseguramiento de calidad.

El trabajo de diseño es un momento importante del proyecto: el equipo rechazó los
mockups originales por genéricos. Se espera un punto de vista propio.

## 2. Qué decidís vos (libertad creativa total)

- El **concepto** que articula la identidad (de dónde sale la personalidad visual).
- **Paleta** (4–6 colores con nombre y hex), **tipografías** (display, cuerpo y, si
  aporta, una de datos) y escala tipográfica.
- El **elemento firma**: la única cosa por la que la app se va a recordar.
- Layout de cada pantalla, uso de movimiento, tono de los microcopys.
- Cómo se visualiza el **perfil RIASEC** (6 dimensiones) y el avance del cuestionario.
  Son las dos mayores oportunidades de diseño del producto: no las resuelvas con una
  barra genérica y una lista.

## 3. Restricciones duras (no negociables)

**Proceso.** No empieces a codificar pantallas. Primero: (a) cargá la skill
`frontend-design`; (b) proponé **2–3 direcciones de arte** distintas — cada una con
concepto en una frase, paleta, par tipográfico y elemento firma, más una preview
HTML pequeña de una misma pantalla (la de resultados) en cada dirección para poder
compararlas; (c) **detenete** y esperá a que el equipo elija; (d) con la dirección
elegida, produci los entregables de la sección 4; (e) **detenete otra vez** para
aprobación antes de tocar React.

**Anti-genérico.** Prohibido reproducir la estética de los mockups del PDF
(fondo crema, display serif, verde oliva/oscuro) — fue rechazada. Evitá también los
defaults reconocibles de diseño generado por IA que la skill describe; si una
dirección tuya se parece a lo que propondrías para cualquier otra app, descartala
y explicá qué cambiaste.

**Sistema.** Todos los colores, tamaños y radios viven como custom properties en
`client/src/styles/tokens.css`. **Ningún valor visual hardcodeado** fuera de ese
archivo. Componentes reutilizables, no estilos por pantalla.

**Tipografías** de Google Fonts u otra fuente gratuita (restricción del proyecto:
solo herramientas gratuitas o de licencia académica).

**Accesibilidad WCAG AA**, parte del Definition of Done: contraste AA en todo
texto, foco visible, labels reales en formularios, componentes operables por
teclado, `prefers-reduced-motion` respetado. **Mobile-first**, usable a 360px.

**Idioma y tono.** Español de Costa Rica, voseo, registro cercano sin infantilizar.
Los errores dicen qué pasó y cómo resolverlo; no se disculpan ni son vagos.

## 4. Entregables de la fase de diseño

1. `DESIGN.md` — escrito por vos: concepto, tokens, tipografía, componentes base y
   especificación por pantalla. Queda como fuente de verdad para las fases de
   implementación (vos mismo la vas a obedecer después — escribila para eso).
2. `client/src/styles/tokens.css` — los tokens implementados.
3. `docs/prototipo.html` — preview navegable de las pantallas clave con la dirección
   aprobada (HTML/CSS estático, datos de muestra). Cubre el entregable **EDT 1.2.2.2
   (prototipos de interfaz)** del proyecto.

## 5. Requisitos funcionales que el diseño debe respetar (vienen de las HU)

- **HU-01:** contraseña enmascarada con opción de mostrar; error de login **genérico**
  (“Correo o contraseña incorrectos”); todos los campos obligatorios y marcados.
- **HU-02:** un flujo de cuestionario de ~30 reactivos con escala 1–5, indicador de
  avance (“Pregunta N de M”), autosave visible de forma discreta, y retomar donde
  se quedó. Si falta responder algo, señalar cuáles y llevar al primero.
- **HU-03:** ≥ 3 áreas afines con porcentaje y explicación del porqué; sin perfil,
  un estado vacío que invite al cuestionario.
- **HU-04:** búsqueda + filtros por área; ficha con descripción, campo laboral y
  duración; mensaje claro cuando no hay resultados.
- **HU-05:** comparación lado a lado de exactamente 2 carreras distintas; error si
  se elige la misma dos veces; actualización inmediata al cambiar una.
- **HU-06:** botón de descarga de PDF, deshabilitado con texto de ayuda si no hay
  perfil.
- **HU-07 (admin):** tabla de reactivos; la acción destructiva es **“Desactivar”**
  (soft delete) con modal de confirmación que explique consecuencias; aviso de que
  los cambios se reflejan de inmediato en el cuestionario.
- Todas las pantallas con estados vacío, de carga y de error explícitos.

## 6. Consistencia después de la aprobación

Aprobada la dirección, `DESIGN.md` manda. Cada pantalla nueva se deriva de los
tokens y componentes existentes. Si necesitás algo nuevo, agregalo a `DESIGN.md`
en una sección “Extensiones” con una línea de justificación — nunca lo improvises
solo en el código.
