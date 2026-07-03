const questionnaireService = require('../services/questionnaireService');
const AppError = require('../utils/AppError');

/** Convierte un parámetro a entero positivo o lanza un 400 uniforme. */
const parseId = (raw, code, message) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, code, message);
  }
  return id;
};

/** GET /questions — reactivos activos del cuestionario. */
const getQuestions = async (req, res) => {
  const questions = await questionnaireService.listActiveQuestions();
  res.status(200).json({ questions });
};

/** POST /attempts — inicia o retoma el intento en curso del usuario. */
const startAttempt = async (req, res) => {
  const state = await questionnaireService.startOrResumeAttempt(req.user.id);
  res.status(200).json(state);
};

/** GET /attempts/current — intento en curso, o null si no hay ninguno. */
const getCurrentAttempt = async (req, res) => {
  const state = await questionnaireService.getCurrentAttempt(req.user.id);
  res.status(200).json(state || { attempt: null });
};

/** PATCH /attempts/:id/answers — autosave de la respuesta de un reactivo. */
const saveAnswer = async (req, res) => {
  const attemptId = parseId(
    req.params.id,
    'ATTEMPT_NOT_FOUND',
    'Intento de cuestionario inválido.'
  );
  const { questionId, value } = req.body;
  const parsedQuestionId = parseId(questionId, 'INVALID_ANSWER', 'Falta indicar la pregunta.');

  if (value === undefined || value === null) {
    throw new AppError(400, 'INVALID_ANSWER', 'Falta indicar la respuesta.');
  }

  const result = await questionnaireService.saveAnswer({
    userId: req.user.id,
    attemptId,
    questionId: parsedQuestionId,
    value: Number(value),
  });
  res.status(200).json(result);
};

/** POST /attempts/:id/submit — calcula y persiste el perfil (bloquea si falta responder). */
const submitAttempt = async (req, res) => {
  const attemptId = parseId(
    req.params.id,
    'ATTEMPT_NOT_FOUND',
    'Intento de cuestionario inválido.'
  );
  const result = await questionnaireService.submitAttempt({ userId: req.user.id, attemptId });
  res.status(201).json(result);
};

/** GET /profile — perfil vocacional más reciente del usuario. */
const getProfile = async (req, res) => {
  const profile = await questionnaireService.getLatestProfile(req.user.id);
  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Todavía no completaste el cuestionario.');
  }
  res.status(200).json({ profile });
};

module.exports = {
  getQuestions,
  startAttempt,
  getCurrentAttempt,
  saveAnswer,
  submitAttempt,
  getProfile,
};
