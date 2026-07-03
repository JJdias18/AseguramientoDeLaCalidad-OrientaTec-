/**
 * Metadatos de las seis dimensiones RIASEC (dirección "Huella", DESIGN.md §2.2).
 * Orden FIJO R-I-A-S-E-C en toda huella (garantiza la separación para daltonismo).
 * `clase` mapea a las clases de tinta de components.css (.t-r … .t-c).
 */
export const DIMENSIONES = [
  { type: 'R', clase: 't-r', nombre: 'Realista', interes: 'práctico y manual' },
  { type: 'I', clase: 't-i', nombre: 'Investigativo', interes: 'investigativo' },
  { type: 'A', clase: 't-a', nombre: 'Artístico', interes: 'artístico' },
  { type: 'S', clase: 't-s', nombre: 'Social', interes: 'social' },
  { type: 'E', clase: 't-e', nombre: 'Emprendedor', interes: 'emprendedor' },
  { type: 'C', clase: 't-c', nombre: 'Convencional', interes: 'organizado' },
];

/** Puntaje máximo por dimensión (5 reactivos × valor máximo 5 = 25). */
export const PUNTAJE_MAXIMO = 25;

export const nombrePorTipo = (type) =>
  DIMENSIONES.find((dimension) => dimension.type === type)?.nombre ?? type;
