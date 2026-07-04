/**
 * Motor de recomendación de áreas (HU-03, sección B de PLAN.md).
 *
 * Módulo PURO: no depende de Express ni de la base de datos. Recibe el vector de
 * puntajes del perfil y la lista de áreas con sus pesos RIASEC, y devuelve las
 * áreas ordenadas por afinidad. La persistencia y la lectura de la BD viven en la
 * capa de orquestación (`questionnaireService`).
 *
 * Formas de entrada:
 *   scores: { R, I, A, S, E, C }  — puntaje del estudiante por dimensión
 *   areas:  [{ id, name, weights: { R..C }, ... }] — pesos 0–1 de cada área
 *
 * Afinidad = **similitud coseno** entre el vector del perfil y el de los pesos del
 * área. Se usa coseno (no producto punto) a propósito: al normalizar por la
 * magnitud de ambos vectores, un área con pesos "más grandes" no obtiene ventaja;
 * solo cuenta cuánto coinciden las DIRECCIONES (la forma del perfil).
 */

const { RIASEC_ORDER } = require('./scoringService');

/** Frase de interés por dimensión, para la explicación de cada área. */
const INTERES_POR_TIPO = {
  R: 'realista',
  I: 'investigativo',
  A: 'artístico',
  S: 'social',
  E: 'emprendedor',
  C: 'convencional',
};

/** Proyecta un mapa por tipo al vector fijo en orden R-I-A-S-E-C. */
const toVector = (byType) => RIASEC_ORDER.map((type) => Number(byType?.[type]) || 0);

const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);

const magnitude = (vector) => Math.sqrt(dot(vector, vector));

/**
 * Similitud coseno de dos vectores numéricos. Si alguno es nulo (magnitud 0)
 * devuelve 0 en lugar de NaN, para no romper el ranking ante un perfil vacío.
 * @returns {number} valor en [-1, 1] (en la práctica [0, 1]: pesos y puntajes ≥ 0)
 */
const cosineSimilarity = (a, b) => {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dot(a, b) / (magA * magB);
};

/** Afinidad perfil↔área como porcentaje entero 0–100 (coseno redondeado). */
const affinityPercent = (scores, weights) =>
  Math.round(cosineSimilarity(toVector(scores), toVector(weights)) * 100);

/**
 * Dimensión que MÁS impulsa la afinidad con un área: el tipo con mayor producto
 * puntaje×peso. Es el que mejor explica el parecido (el estudiante puntúa alto y el
 * área también lo valora). Desempate estable por el orden fijo R-I-A-S-E-C.
 */
const drivingType = (scores, weights) => {
  let best = RIASEC_ORDER[0];
  let bestValue = -Infinity;
  RIASEC_ORDER.forEach((type) => {
    const contribution = (Number(scores?.[type]) || 0) * (Number(weights?.[type]) || 0);
    if (contribution > bestValue) {
      bestValue = contribution;
      best = type;
    }
  });
  return best;
};

/** Explicación breve derivada del tipo dominante de la coincidencia. */
const explainType = (type) => `Coincide con tu interés ${INTERES_POR_TIPO[type]}.`;

/**
 * Ordena las áreas por afinidad coseno con el perfil, de mayor a menor. El
 * DESEMPATE es estable por `name` ascendente, de modo que un mismo perfil produzca
 * SIEMPRE el mismo orden (HU-03, escenario 4), sin depender del orden de entrada.
 *
 * @param {object} scores  vector de puntajes del estudiante
 * @param {Array}  areas   áreas con `{ id, name, weights }`
 * @param {{ limit?: number }} [options]  recorta a las N más afines (opcional)
 * @returns {Array} áreas enriquecidas con `{ affinity, dominantType, explanation }`
 */
const recommendAreas = (scores, areas, { limit } = {}) => {
  const ranked = areas
    .map((areaItem) => {
      const dominantType = drivingType(scores, areaItem.weights);
      return {
        ...areaItem,
        affinity: affinityPercent(scores, areaItem.weights),
        dominantType,
        explanation: explainType(dominantType),
      };
    })
    .sort((a, b) => b.affinity - a.affinity || a.name.localeCompare(b.name, 'es'));

  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
};

module.exports = {
  INTERES_POR_TIPO,
  cosineSimilarity,
  affinityPercent,
  drivingType,
  recommendAreas,
};
