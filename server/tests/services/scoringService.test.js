const scoringService = require('../../src/services/scoringService');

/**
 * Utilidades de prueba: el motor es puro (sin Express ni BD). Trabaja con
 * reactivos { id, riasecType, scaleMin, scaleMax } y respuestas { questionId, value }.
 * El seed real tiene 5 reactivos por tipo (30 en total); acá reproducimos esa forma.
 */
const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'];

/** Construye 5 reactivos por tipo (30) con ids 1..30 en el orden R,I,A,S,E,C. */
const buildQuestions = () => {
  const questions = [];
  let id = 1;
  RIASEC.forEach((riasecType) => {
    for (let i = 0; i < 5; i += 1) {
      questions.push({ id, riasecType, scaleMin: 1, scaleMax: 5 });
      id += 1;
    }
  });
  return questions;
};

/** Respuestas donde cada tipo recibe un valor constante (mapa tipo -> value). */
const answersByType = (questions, valuesByType) =>
  questions.map((q) => ({ questionId: q.id, value: valuesByType[q.riasecType] }));

/** Respuestas donde todos los reactivos reciben el mismo valor. */
const answersAll = (questions, value) => questions.map((q) => ({ questionId: q.id, value }));

describe('scoringService.computeScores', () => {
  it('suma los valores de los reactivos de cada tipo RIASEC', () => {
    const questions = buildQuestions();
    // R=1 (5*1=5), I=5 (25), A=4 (20), S=2 (10), E=3 (15), C=1 (5)
    const answers = answersByType(questions, { R: 1, I: 5, A: 4, S: 2, E: 3, C: 1 });

    const scores = scoringService.computeScores(questions, answers);

    expect(scores).toEqual({ R: 5, I: 25, A: 20, S: 10, E: 15, C: 5 });
  });

  it('devuelve las seis dimensiones aunque falten tipos en los reactivos', () => {
    const questions = [
      { id: 1, riasecType: 'I', scaleMin: 1, scaleMax: 5 },
      { id: 2, riasecType: 'I', scaleMin: 1, scaleMax: 5 },
    ];
    const answers = [
      { questionId: 1, value: 5 },
      { questionId: 2, value: 4 },
    ];

    const scores = scoringService.computeScores(questions, answers);

    expect(scores).toEqual({ R: 0, I: 9, A: 0, S: 0, E: 0, C: 0 });
  });

  it('ignora respuestas de reactivos que no están en el conjunto (p. ej. desactivados)', () => {
    const questions = [{ id: 1, riasecType: 'A', scaleMin: 1, scaleMax: 5 }];
    const answers = [
      { questionId: 1, value: 3 },
      { questionId: 999, value: 5 },
    ];

    const scores = scoringService.computeScores(questions, answers);

    expect(scores.A).toBe(3);
  });

  it('lanza error si un reactivo quedó sin responder', () => {
    const questions = buildQuestions();
    const answers = answersAll(questions, 3).slice(0, 29); // falta el reactivo 30

    expect(() => scoringService.computeScores(questions, answers)).toThrow(/sin responder/i);
  });

  it('lanza error si un valor está fuera de la escala del reactivo', () => {
    const questions = [{ id: 1, riasecType: 'R', scaleMin: 1, scaleMax: 5 }];

    expect(() => scoringService.computeScores(questions, [{ questionId: 1, value: 6 }])).toThrow(
      /escala/i
    );
    expect(() => scoringService.computeScores(questions, [{ questionId: 1, value: 0 }])).toThrow(
      /escala/i
    );
  });

  it('lanza error si un valor no es un entero', () => {
    const questions = [{ id: 1, riasecType: 'R', scaleMin: 1, scaleMax: 5 }];

    expect(() =>
      scoringService.computeScores(questions, [{ questionId: 1, value: 3.5 }])
    ).toThrow();
  });
});

describe('scoringService.rankTypes (orden y desempate)', () => {
  it('ordena los tipos de mayor a menor puntaje', () => {
    const scores = { R: 5, I: 25, A: 20, S: 10, E: 15, C: 8 };

    expect(scoringService.rankTypes(scores)).toEqual(['I', 'A', 'E', 'S', 'C', 'R']);
  });

  it('desempata de forma estable por el orden fijo R-I-A-S-E-C', () => {
    // A y S empatan en el máximo; A va antes que S (orden RIASEC).
    const scores = { R: 0, I: 0, A: 10, S: 10, E: 0, C: 0 };

    expect(scoringService.rankTypes(scores)).toEqual(['A', 'S', 'R', 'I', 'E', 'C']);
  });

  it('con todos los puntajes iguales devuelve el orden fijo R-I-A-S-E-C', () => {
    const scores = { R: 15, I: 15, A: 15, S: 15, E: 15, C: 15 };

    expect(scoringService.rankTypes(scores)).toEqual(['R', 'I', 'A', 'S', 'E', 'C']);
  });
});

describe('scoringService.buildProfile', () => {
  it('escenario 4 (HU-02): puntajes altos en Investigativo y Artístico destacan esas dos áreas', () => {
    const questions = buildQuestions();
    // I y A altos (5), el resto bajo (1 o 2).
    const answers = answersByType(questions, { R: 1, I: 5, A: 5, S: 2, E: 1, C: 2 });

    const profile = scoringService.buildProfile(questions, answers);

    expect(profile.scores).toEqual({ R: 5, I: 25, A: 25, S: 10, E: 5, C: 10 });
    // Las dos dimensiones predominantes son I y A (en ese orden por desempate RIASEC).
    expect(profile.hollandCode.slice(0, 2)).toBe('IA');
    expect(profile.dominant).toEqual(['I', 'A']);
  });

  it('produce un código Holland de 3 letras de mayor a menor puntaje', () => {
    const questions = buildQuestions();
    const answers = answersByType(questions, { R: 3, I: 5, A: 1, S: 4, E: 2, C: 1 });
    // Suma: R15 I25 A5 S20 E10 C5 -> orden I, S, R, E, (A=C empatan -> A antes que C)
    const profile = scoringService.buildProfile(questions, answers);

    expect(profile.hollandCode).toBe('ISR');
  });

  it('es determinista: el mismo set de respuestas produce siempre el mismo perfil', () => {
    const questions = buildQuestions();
    const answers = answersByType(questions, { R: 4, I: 4, A: 2, S: 5, E: 3, C: 1 });

    const a = scoringService.buildProfile(questions, answers);
    const b = scoringService.buildProfile(questions, answers);

    expect(a).toEqual(b);
  });

  describe('casos borde', () => {
    it('todas las respuestas iguales: perfil plano y código Holland R-I-A-S-E-C', () => {
      const questions = buildQuestions();
      const profile = scoringService.buildProfile(questions, answersAll(questions, 3));

      expect(profile.scores).toEqual({ R: 15, I: 15, A: 15, S: 15, E: 15, C: 15 });
      expect(profile.hollandCode).toBe('RIA');
      expect(profile.dominant).toEqual(['R', 'I']);
    });

    it('extremo inferior de la escala: todas en 1 -> cada dimensión suma su mínimo (5)', () => {
      const questions = buildQuestions();
      const profile = scoringService.buildProfile(questions, answersAll(questions, 1));

      expect(profile.scores).toEqual({ R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 });
      expect(profile.hollandCode).toBe('RIA');
    });

    it('extremo superior de la escala: todas en 5 -> cada dimensión suma su máximo (25)', () => {
      const questions = buildQuestions();
      const profile = scoringService.buildProfile(questions, answersAll(questions, 5));

      expect(profile.scores).toEqual({ R: 25, I: 25, A: 25, S: 25, E: 25, C: 25 });
      expect(profile.hollandCode).toBe('RIA');
    });

    it('una sola dimensión en el máximo y el resto en el mínimo la deja como dominante', () => {
      const questions = buildQuestions();
      const answers = answersByType(questions, { R: 1, I: 1, A: 1, S: 1, E: 5, C: 1 });

      const profile = scoringService.buildProfile(questions, answers);

      expect(profile.hollandCode[0]).toBe('E');
      expect(profile.dominant[0]).toBe('E');
    });

    it('empate de tres tipos en el máximo respeta el orden fijo para el código', () => {
      const questions = buildQuestions();
      // R, A y E empatan alto (5); I, S, C bajos (1).
      const answers = answersByType(questions, { R: 5, I: 1, A: 5, S: 1, E: 5, C: 1 });

      const profile = scoringService.buildProfile(questions, answers);

      expect(profile.hollandCode).toBe('RAE');
    });
  });
});
