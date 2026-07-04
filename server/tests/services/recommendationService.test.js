const recommendationService = require('../../src/services/recommendationService');

/**
 * El motor de recomendación es PURO (sin Express ni BD). Trabaja con el vector de
 * puntajes del perfil ({ R, I, A, S, E, C }) y una lista de áreas
 * ({ id, name, weights: { R..C } }). Devuelve las áreas ordenadas por afinidad
 * (similitud coseno) con su porcentaje 0–100 y una explicación breve.
 */

const area = (id, name, weights) => ({ id, name, weights });

describe('recommendationService.cosineSimilarity', () => {
  it('vectores en la misma dirección tienen similitud 1', () => {
    expect(recommendationService.cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
    // Escalar el vector no cambia la dirección: sigue siendo 1.
    expect(recommendationService.cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 10);
  });

  it('vectores ortogonales tienen similitud 0', () => {
    expect(recommendationService.cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it('devuelve 0 (no NaN) si alguno de los vectores es nulo', () => {
    expect(recommendationService.cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    expect(recommendationService.cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
  });
});

describe('recommendationService.affinityPercent', () => {
  it('es un entero entre 0 y 100', () => {
    const scores = { R: 5, I: 10, A: 15, S: 5, E: 5, C: 10 };
    const weights = { R: 0.1, I: 0.2, A: 0.3, S: 0.1, E: 0.1, C: 0.2 };

    const percent = recommendationService.affinityPercent(scores, weights);

    expect(Number.isInteger(percent)).toBe(true);
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
  });

  it('perfil idéntico en dirección a los pesos da 100 %', () => {
    const scores = { R: 2, I: 4, A: 6, S: 2, E: 2, C: 4 };
    const weights = { R: 0.1, I: 0.2, A: 0.3, S: 0.1, E: 0.1, C: 0.2 }; // misma dirección

    expect(recommendationService.affinityPercent(scores, weights)).toBe(100);
  });

  it('usa COSENO: la magnitud de los pesos no infla la afinidad', () => {
    const scores = { R: 5, I: 10, A: 15, S: 5, E: 5, C: 10 };
    const weights = { R: 0.1, I: 0.2, A: 0.3, S: 0.1, E: 0.1, C: 0.2 };
    // Mismos pesos multiplicados por 10 (magnitud 10x, misma dirección).
    const weightsInflados = { R: 1, I: 2, A: 3, S: 1, E: 1, C: 2 };

    expect(recommendationService.affinityPercent(scores, weightsInflados)).toBe(
      recommendationService.affinityPercent(scores, weights)
    );
  });
});

describe('recommendationService.recommendAreas', () => {
  const scores = { R: 5, I: 10, A: 15, S: 5, E: 5, C: 10 };

  it('devuelve al menos 3 áreas, cada una con % y explicación, ordenadas por afinidad desc', () => {
    const areas = [
      area(1, 'Alfa', { R: 0.9, I: 0.1, A: 0.1, S: 0.1, E: 0.1, C: 0.1 }),
      area(2, 'Beta', { R: 0.1, I: 0.2, A: 0.3, S: 0.1, E: 0.1, C: 0.2 }),
      area(3, 'Gamma', { R: 0.1, I: 0.1, A: 0.1, S: 0.9, E: 0.1, C: 0.1 }),
    ];

    const result = recommendationService.recommendAreas(scores, areas);

    expect(result.length).toBeGreaterThanOrEqual(3);
    result.forEach((item) => {
      expect(Number.isInteger(item.affinity)).toBe(true);
      expect(typeof item.explanation).toBe('string');
      expect(item.explanation.length).toBeGreaterThan(0);
    });
    // Orden descendente por afinidad.
    for (let i = 1; i < result.length; i += 1) {
      expect(result[i - 1].affinity).toBeGreaterThanOrEqual(result[i].affinity);
    }
    // Beta (misma dirección que el perfil) es la más afín.
    expect(result[0].name).toBe('Beta');
    expect(result[0].affinity).toBe(100);
  });

  it('explica cada área a partir del tipo que más impulsa la afinidad', () => {
    const perfilInvestigativo = { R: 1, I: 20, A: 1, S: 1, E: 1, C: 1 };
    const areas = [
      area(1, 'Ciencias', { R: 0.1, I: 0.9, A: 0.1, S: 0.1, E: 0.1, C: 0.1 }),
      area(2, 'Sociales', { R: 0.1, I: 0.1, A: 0.1, S: 0.9, E: 0.1, C: 0.1 }),
    ];

    const [ciencias] = recommendationService.recommendAreas(perfilInvestigativo, areas);

    expect(ciencias.name).toBe('Ciencias');
    expect(ciencias.dominantType).toBe('I');
    expect(ciencias.explanation.toLowerCase()).toContain('investigativo');
  });

  it('desempata de forma estable por nombre ascendente ante afinidades iguales', () => {
    // Beta = Alfa × 2: misma dirección, misma afinidad exacta. Debe ganar Alfa (nombre).
    const alfa = area(1, 'Alfa', { R: 0.1, I: 0.2, A: 0.3, S: 0.1, E: 0.1, C: 0.2 });
    const beta = area(2, 'Beta', { R: 0.2, I: 0.4, A: 0.6, S: 0.2, E: 0.2, C: 0.4 });

    // Se pasan en orden inverso para probar que el orden de entrada no manda.
    const result = recommendationService.recommendAreas(scores, [beta, alfa]);

    expect(result[0].affinity).toBe(result[1].affinity);
    expect(result.map((r) => r.name)).toEqual(['Alfa', 'Beta']);
  });

  it('perfil sin dominante claro (todo igual) produce un orden determinista y ≥3 áreas', () => {
    const perfilPlano = { R: 10, I: 10, A: 10, S: 10, E: 10, C: 10 };
    const areas = [
      area(3, 'Gamma', { R: 0.2, I: 0.2, A: 0.2, S: 0.2, E: 0.2, C: 0.2 }),
      area(1, 'Alfa', { R: 0.9, I: 0.1, A: 0.1, S: 0.1, E: 0.1, C: 0.1 }),
      area(2, 'Beta', { R: 0.1, I: 0.5, A: 0.5, S: 0.1, E: 0.1, C: 0.1 }),
    ];

    const result = recommendationService.recommendAreas(perfilPlano, areas);

    expect(result).toHaveLength(3);
    // Gamma apunta en la misma dirección que el perfil plano → afinidad 100.
    expect(result[0].name).toBe('Gamma');
    expect(result[0].affinity).toBe(100);
  });

  it('es consistente: el mismo perfil produce SIEMPRE el mismo orden en dos llamadas', () => {
    const areas = [
      area(1, 'Alfa', { R: 0.5, I: 0.5, A: 0.1, S: 0.1, E: 0.1, C: 0.1 }),
      area(2, 'Beta', { R: 0.1, I: 0.2, A: 0.3, S: 0.1, E: 0.1, C: 0.2 }),
      area(3, 'Gamma', { R: 0.1, I: 0.1, A: 0.1, S: 0.5, E: 0.5, C: 0.1 }),
    ];

    const primera = recommendationService.recommendAreas(scores, areas);
    const segunda = recommendationService.recommendAreas(scores, areas);

    expect(primera).toEqual(segunda);
    expect(primera.map((r) => r.name)).toEqual(segunda.map((r) => r.name));
  });

  it('con la opción limit devuelve solo las N más afines (mínimo respetado por el caller)', () => {
    const areas = [
      area(1, 'Alfa', { R: 0.9, I: 0.1, A: 0.1, S: 0.1, E: 0.1, C: 0.1 }),
      area(2, 'Beta', { R: 0.1, I: 0.2, A: 0.3, S: 0.1, E: 0.1, C: 0.2 }),
      area(3, 'Gamma', { R: 0.1, I: 0.1, A: 0.1, S: 0.9, E: 0.1, C: 0.1 }),
      area(4, 'Delta', { R: 0.1, I: 0.1, A: 0.1, S: 0.1, E: 0.9, C: 0.1 }),
    ];

    const result = recommendationService.recommendAreas(scores, areas, { limit: 3 });

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Beta');
  });
});
