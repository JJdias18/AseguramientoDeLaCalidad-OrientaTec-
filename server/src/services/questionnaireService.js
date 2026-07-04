const questionRepository = require('../repositories/questionRepository');
const attemptRepository = require('../repositories/attemptRepository');
const answerRepository = require('../repositories/answerRepository');
const profileRepository = require('../repositories/profileRepository');
const areaRepository = require('../repositories/areaRepository');
const careerRepository = require('../repositories/careerRepository');
const scoringService = require('./scoringService');
const recommendationService = require('./recommendationService');
const AppError = require('../utils/AppError');

/**
 * Orquestación del cuestionario vocacional (HU-02). Coordina reactivos, intentos,
 * respuestas (autosave) y el cálculo del perfil mediante el motor puro
 * (`scoringService`). Toda la lógica de negocio vive acá; los repositorios solo
 * ejecutan SQL y `scoringService` no toca la base de datos.
 */

/** Reactivo de cara al cliente (camelCase, sin exponer detalles internos). */
const toPublicQuestion = (row, index) => ({
  id: row.id,
  position: index + 1,
  text: row.text,
  riasecType: row.riasec_type,
  scaleMin: row.scale_min,
  scaleMax: row.scale_max,
});

const toPublicAnswer = (row) => ({ questionId: row.question_id, value: row.value });

/** Carrera de cara al cliente (para el drill-down desde cada área recomendada). */
const toPublicCareer = (row) => ({
  id: row.id,
  name: row.name,
  fieldOfWork: row.field_of_work,
  duration: row.duration,
});

const toPublicProfile = (row) => ({
  id: row.id,
  attemptId: row.attempt_id,
  scores: row.scores,
  hollandCode: row.holland_code,
  dominant: scoringService.rankTypes(row.scores).slice(0, 2),
  createdAt: row.created_at,
});

/** Reactivos activos, en orden estable por id. */
const listActiveQuestions = async () => {
  const rows = await questionRepository.findActive();
  return rows.map(toPublicQuestion);
};

/**
 * Calcula el avance de un intento: total, respondidas, índice de la primera sin
 * responder (para "retomar") y si está completo.
 */
const buildProgress = (questions, answers) => {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const firstUnanswered = questions.findIndex((question) => !answeredIds.has(question.id));

  return {
    total: questions.length,
    answered: answeredIds.size,
    nextIndex: firstUnanswered === -1 ? questions.length : firstUnanswered,
    complete: firstUnanswered === -1 && questions.length > 0,
  };
};

/** Estado completo de un intento: reactivos, respuestas guardadas y avance. */
const buildAttemptState = async (attemptRow, { resumed = false } = {}) => {
  const questions = await listActiveQuestions();
  const answers = (await answerRepository.findByAttempt(attemptRow.id)).map(toPublicAnswer);

  return {
    attempt: { id: attemptRow.id, status: attemptRow.status, startedAt: attemptRow.started_at },
    questions,
    answers,
    progress: buildProgress(questions, answers),
    resumed,
  };
};

/** GET /attempts/current: intento en curso del usuario, o null si no hay. */
const getCurrentAttempt = async (userId) => {
  const attemptRow = await attemptRepository.findCurrentByUser(userId);
  if (!attemptRow) {
    return null;
  }
  return buildAttemptState(attemptRow, { resumed: true });
};

/**
 * POST /attempts: inicia un intento nuevo o retoma el que esté en curso. `resumed`
 * indica si se retomó un intento con respuestas previas (para el aviso de la UI).
 */
const startOrResumeAttempt = async (userId) => {
  const existing = await attemptRepository.findCurrentByUser(userId);
  if (existing) {
    const answers = await answerRepository.findByAttempt(existing.id);
    return buildAttemptState(existing, { resumed: answers.length > 0 });
  }

  const created = await attemptRepository.create(userId);
  return buildAttemptState(created, { resumed: false });
};

/** Carga un intento en curso que pertenezca al usuario, o lanza el error adecuado. */
const loadOwnedInProgressAttempt = async (userId, attemptId) => {
  const attemptRow = await attemptRepository.findById(attemptId);
  if (!attemptRow || attemptRow.user_id !== userId) {
    throw new AppError(404, 'ATTEMPT_NOT_FOUND', 'No encontramos ese intento de cuestionario.');
  }
  if (attemptRow.status !== 'in_progress') {
    throw new AppError(
      409,
      'ATTEMPT_ALREADY_COMPLETED',
      'Este cuestionario ya se envió. Empezá uno nuevo para responder otra vez.'
    );
  }
  return attemptRow;
};

/**
 * PATCH /attempts/:id/answers: guarda (autosave) la respuesta de un reactivo.
 * Valida propiedad del intento, que el reactivo esté activo y que el valor esté
 * dentro de la escala.
 */
const saveAnswer = async ({ userId, attemptId, questionId, value }) => {
  await loadOwnedInProgressAttempt(userId, attemptId);

  const question = await questionRepository.findById(questionId);
  if (!question || !question.is_active) {
    throw new AppError(400, 'INVALID_ANSWER', 'La pregunta indicada no está disponible.');
  }
  if (!Number.isInteger(value) || value < question.scale_min || value > question.scale_max) {
    throw new AppError(
      400,
      'INVALID_ANSWER',
      `La respuesta debe ser un número entre ${question.scale_min} y ${question.scale_max}.`
    );
  }

  const saved = await answerRepository.upsert({ attemptId, questionId, value });
  const questions = await listActiveQuestions();
  const answers = (await answerRepository.findByAttempt(attemptId)).map(toPublicAnswer);

  return { answer: toPublicAnswer(saved), progress: buildProgress(questions, answers) };
};

/**
 * POST /attempts/:id/submit: valida que no queden reactivos sin responder, calcula
 * el perfil con el motor de scoring, lo persiste y marca el intento como completado.
 * Bloquea el envío incompleto (HU-02, escenario 2).
 */
const submitAttempt = async ({ userId, attemptId }) => {
  await loadOwnedInProgressAttempt(userId, attemptId);

  const questionRows = await questionRepository.findActive();
  const answerRows = await answerRepository.findByAttempt(attemptId);
  const answeredIds = new Set(answerRows.map((answer) => answer.question_id));

  const missing = questionRows
    .map((row, index) => ({ id: row.id, position: index + 1 }))
    .filter((question) => !answeredIds.has(question.id));

  if (missing.length > 0) {
    throw new AppError(
      409,
      'INCOMPLETE_QUESTIONNAIRE',
      `Faltan ${missing.length} preguntas por responder antes de enviar.`,
      {
        missing: missing.map((question) => question.id),
        missingPositions: missing.map((question) => question.position),
      }
    );
  }

  const questions = questionRows.map((row) => ({
    id: row.id,
    riasecType: row.riasec_type,
    scaleMin: row.scale_min,
    scaleMax: row.scale_max,
  }));
  const answers = answerRows.map(toPublicAnswer);
  const profile = scoringService.buildProfile(questions, answers);

  const saved = await profileRepository.create({
    userId,
    attemptId,
    scores: JSON.stringify(profile.scores),
    hollandCode: profile.hollandCode,
  });
  await attemptRepository.complete(attemptId);

  return { profile: toPublicProfile(saved) };
};

/** GET /profile: perfil más reciente del usuario (o null si no hay). */
const getLatestProfile = async (userId) => {
  const row = await profileRepository.findLatestByUser(userId);
  return row ? toPublicProfile(row) : null;
};

/**
 * GET /recommendations (HU-03): áreas académicas ordenadas por afinidad con el
 * perfil más reciente del usuario. Si el usuario todavía no tiene perfil, NO es un
 * error: devuelve `hasProfile: false` para que la UI lo lleve al cuestionario.
 * El ranking (coseno + orden determinista) lo hace el motor puro `recommendationService`.
 */
const getRecommendations = async (userId) => {
  const profileRow = await profileRepository.findLatestByUser(userId);
  if (!profileRow) {
    return { hasProfile: false, recommendations: [] };
  }

  const profile = toPublicProfile(profileRow);
  const [areaRows, careerRows] = await Promise.all([
    areaRepository.findAll(),
    careerRepository.findAll(),
  ]);

  const careersByArea = careerRows.reduce((acc, row) => {
    (acc[row.area_id] = acc[row.area_id] || []).push(row);
    return acc;
  }, {});

  const areas = areaRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    weights: row.riasec_weights,
    careers: (careersByArea[row.id] || []).map(toPublicCareer),
  }));

  const recommendations = recommendationService
    .recommendAreas(profile.scores, areas)
    .map((area) => ({
      id: area.id,
      name: area.name,
      description: area.description,
      affinity: area.affinity,
      dominantType: area.dominantType,
      explanation: area.explanation,
      weights: area.weights,
      careerCount: area.careers.length,
      careers: area.careers,
    }));

  return { hasProfile: true, profile, recommendations };
};

/**
 * GET /profile/report (HU-06): datos para el PDF del perfil vocacional. Reusa
 * `getRecommendations` (mismo perfil + mismas áreas afines que "Mi huella"); si el
 * usuario no tiene perfil todavía, es un error explícito (el botón de descarga ya
 * está deshabilitado en ese caso, así que llegar acá sin perfil es un caso anómalo).
 */
const getProfileReportData = async (userId) => {
  const result = await getRecommendations(userId);
  if (!result.hasProfile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Todavía no completaste el cuestionario.');
  }
  return { profile: result.profile, recommendations: result.recommendations };
};

module.exports = {
  listActiveQuestions,
  getCurrentAttempt,
  startOrResumeAttempt,
  saveAnswer,
  submitAttempt,
  getLatestProfile,
  getRecommendations,
  getProfileReportData,
};
