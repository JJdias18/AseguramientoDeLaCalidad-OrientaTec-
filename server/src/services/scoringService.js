/**
 * Motor de scoring RIASEC (HU-02 / HU-03, sección B de PLAN.md).
 *
 * Módulo PURO: no depende de Express ni de la base de datos. Recibe reactivos y
 * respuestas ya normalizados y devuelve el perfil vocacional. Toda la persistencia
 * y validación de sesión vive en la capa de orquestación (`questionnaireService`).
 *
 * Formas de entrada:
 *   questions: [{ id, riasecType: 'R'|'I'|'A'|'S'|'E'|'C', scaleMin, scaleMax }]
 *   answers:   [{ questionId, value }]
 */

/**
 * Orden fijo del hexágono de Holland. Es también el criterio de DESEMPATE estable:
 * ante puntajes iguales, el tipo que aparece antes en este orden rankea más alto.
 * Garantiza que un mismo perfil produzca siempre el mismo resultado (HU-03, esc. 4).
 */
const RIASEC_ORDER = ['R', 'I', 'A', 'S', 'E', 'C'];

const HOLLAND_CODE_LENGTH = 3;

/** Vector de puntajes en cero para las seis dimensiones. */
const emptyScores = () => RIASEC_ORDER.reduce((acc, type) => ({ ...acc, [type]: 0 }), {});

/**
 * Suma los valores de los reactivos de cada tipo RIASEC.
 * Valida que cada reactivo tenga respuesta y que el valor esté dentro de su escala.
 * Las respuestas de reactivos ajenos al conjunto (p. ej. desactivados) se ignoran.
 * @returns {{R:number,I:number,A:number,S:number,E:number,C:number}}
 */
const computeScores = (questions, answers) => {
  const valueByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  const scores = emptyScores();

  questions.forEach((question) => {
    if (!valueByQuestionId.has(question.id)) {
      throw new Error(`El reactivo ${question.id} quedó sin responder.`);
    }

    const value = valueByQuestionId.get(question.id);
    const min = question.scaleMin ?? 1;
    const max = question.scaleMax ?? 5;
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(
        `El valor ${value} del reactivo ${question.id} está fuera de la escala (${min}–${max}).`
      );
    }

    scores[question.riasecType] += value;
  });

  return scores;
};

/**
 * Ordena los seis tipos de mayor a menor puntaje, con desempate estable por el
 * orden fijo R-I-A-S-E-C.
 * @returns {string[]} los seis tipos ordenados
 */
const rankTypes = (scores) =>
  [...RIASEC_ORDER].sort((a, b) => {
    const byScore = scores[b] - scores[a];
    if (byScore !== 0) {
      return byScore;
    }
    return RIASEC_ORDER.indexOf(a) - RIASEC_ORDER.indexOf(b);
  });

/**
 * Código Holland: los `length` tipos con mayor puntaje, en orden (p. ej. "IAE").
 */
const computeHollandCode = (scores, length = HOLLAND_CODE_LENGTH) =>
  rankTypes(scores).slice(0, length).join('');

/**
 * Construye el perfil vocacional a partir de los reactivos y sus respuestas.
 * @returns {{ scores: object, hollandCode: string, dominant: string[] }}
 *   `dominant` son los dos tipos predominantes (para destacar en resultados).
 */
const buildProfile = (questions, answers) => {
  const scores = computeScores(questions, answers);
  const ranked = rankTypes(scores);

  return {
    scores,
    hollandCode: ranked.slice(0, HOLLAND_CODE_LENGTH).join(''),
    dominant: ranked.slice(0, 2),
  };
};

module.exports = {
  RIASEC_ORDER,
  computeScores,
  rankTypes,
  computeHollandCode,
  buildProfile,
};
