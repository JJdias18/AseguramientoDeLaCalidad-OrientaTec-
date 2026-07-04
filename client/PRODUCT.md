# Product

## Register

product

## Users

Estudiantes costarricenses de 17–19 años, recién salidos del colegio, que están
decidiendo qué estudiar. Usan el sistema principalmente desde el celular (mobile-first,
usable a 360px). Audiencia secundaria: colegios y un profesor de aseguramiento de
calidad que evalúan el producto — el diseño también tiene que proyectar seriedad y
rigor ante adultos.

El trabajo por hacer: responder un cuestionario RIASEC de ~30 reactivos sin
abandonarlo, entender su perfil vocacional, explorar y comparar carreras afines,
y llevarse el resultado (PDF).

## Product Purpose

Brújula Vocacional convierte un test psicométrico (modelo RIASEC/Holland) en una
experiencia clara y motivadora: perfil de 6 dimensiones, áreas académicas ordenadas
por afinidad con porcentaje y explicación, catálogo y comparador de carreras.
Éxito = el estudiante termina el cuestionario, entiende su resultado y confía en él
lo suficiente como para usarlo en una decisión real.

## Brand Personality

Confiable pero cercano. Tres palabras: **orientador, luminoso, preciso**.
Voz en español de Costa Rica, voseo, registro cercano sin infantilizar. Los errores
dicen qué pasó y cómo resolverlo; no se disculpan ni son vagos. El resultado del test
se presenta como un hallazgo personal valioso, nunca como una sentencia.

## Anti-references

- La estética de los mockups originales del PDF — **rechazada y prohibida**: fondo
  crema, display serif "artesanal", verde oliva/oscuro.
- Interfaces oscuras o "dark mode" como identidad: la base es clara y luminosa;
  el color oscuro se reserva para texto y detalles.
- El look "lavado": claridad sin carácter, gris sobre blanco sin acento ni firma.
- Defaults reconocibles de diseño generado por IA (eyebrows uppercase en cada
  sección, gradient text, grids de cards idénticas, hero-metric template).
- Estética infantil o gamificada tipo app de idiomas: los usuarios son casi adultos
  tomando una decisión seria.

## Design Principles

1. **La personalidad vive en el acento, la tipografía y el elemento firma** — nunca
   en el fondo. Base clara y aireada, carácter concentrado.
2. **El perfil RIASEC y el avance del cuestionario son los dos momentos de diseño
   del producto** — jamás resolverlos con una barra genérica y una lista.
3. **Precisión que se ve**: datos, porcentajes y estructura tratados con cuidado
   tipográfico; el rigor del instrumento se comunica visualmente.
4. **Una decisión por pantalla**: el estudiante siempre sabe qué sigue; estados
   vacío, de carga y de error explícitos en todas las pantallas.
5. **Sistema, no pantallas**: todos los valores visuales viven en
   `client/src/styles/tokens.css`; componentes reutilizables derivados de DESIGN.md.

## Accessibility & Inclusion

WCAG AA como parte del Definition of Done: contraste AA en todo texto (≥4.5:1 cuerpo,
≥3:1 texto grande), foco visible, labels reales en formularios, operable por teclado,
`prefers-reduced-motion` respetado. Mobile-first, usable a 360px. El color nunca es el
único canal de información (relevante para el perfil de 6 dimensiones).
