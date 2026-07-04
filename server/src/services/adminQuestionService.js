const questionRepository = require('../repositories/questionRepository');
const { RIASEC_ORDER } = require('./scoringService');
const AppError = require('../utils/AppError');

/**
 * Orquestación del banco de reactivos para el admin (HU-07). Valida entrada y da
 * forma a la salida; la persistencia (incluido el soft delete) vive en
 * `questionRepository`.
 */

const toAdminQuestion = (row) => ({
  id: row.id,
  text: row.text,
  riasecType: row.riasec_type,
  scaleMin: row.scale_min,
  scaleMax: row.scale_max,
  isActive: row.is_active,
});

const parseId = (raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'INVALID_QUESTION', 'El reactivo indicado no es válido.');
  }
  return id;
};

/** Texto y tipo RIASEC son obligatorios para crear o editar un reactivo (HU-07). */
const validateFields = ({ text, riasecType }) => {
  if (typeof text !== 'string' || !text.trim()) {
    throw new AppError(400, 'INVALID_QUESTION_TEXT', 'El texto del reactivo es obligatorio.');
  }
  if (!RIASEC_ORDER.includes(riasecType)) {
    throw new AppError(
      400,
      'INVALID_RIASEC_TYPE',
      'Elegí un tipo RIASEC válido (R, I, A, S, E o C).'
    );
  }
};

const findExistingOrFail = async (id) => {
  const existing = await questionRepository.findById(id);
  if (!existing) {
    throw new AppError(404, 'QUESTION_NOT_FOUND', 'No encontramos ese reactivo.');
  }
  return existing;
};

/** GET /admin/questions — banco completo (activos e inactivos). */
const listAllQuestions = async () => {
  const rows = await questionRepository.findAll();
  return rows.map(toAdminQuestion);
};

/** POST /admin/questions — crea un reactivo nuevo, activo por defecto. */
const createQuestion = async ({ text, riasecType }) => {
  validateFields({ text, riasecType });
  const row = await questionRepository.create({ text: text.trim(), riasecType });
  return toAdminQuestion(row);
};

/** PUT /admin/questions/:id — edita texto y/o tipo RIASEC de un reactivo existente. */
const updateQuestion = async (rawId, { text, riasecType }) => {
  const id = parseId(rawId);
  validateFields({ text, riasecType });
  await findExistingOrFail(id);

  const row = await questionRepository.update(id, { text: text.trim(), riasecType });
  return toAdminQuestion(row);
};

/**
 * DELETE /admin/questions/:id — soft delete (`is_active = false`). El reactivo
 * deja de servirse en el cuestionario pero `answers` sigue referenciándolo.
 */
const deactivateQuestion = async (rawId) => {
  const id = parseId(rawId);
  await findExistingOrFail(id);

  const row = await questionRepository.deactivate(id);
  return toAdminQuestion(row);
};

module.exports = { listAllQuestions, createQuestion, updateQuestion, deactivateQuestion };
