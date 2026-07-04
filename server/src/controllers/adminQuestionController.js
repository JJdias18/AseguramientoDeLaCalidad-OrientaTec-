const adminQuestionService = require('../services/adminQuestionService');

/** GET /admin/questions — banco completo de reactivos (HU-07). */
const listQuestions = async (req, res) => {
  const questions = await adminQuestionService.listAllQuestions();
  res.status(200).json({ questions });
};

/** POST /admin/questions — crea un reactivo (texto y tipo RIASEC obligatorios). */
const createQuestion = async (req, res) => {
  const { text, riasecType } = req.body;
  const question = await adminQuestionService.createQuestion({ text, riasecType });
  res.status(201).json({ question });
};

/** PUT /admin/questions/:id — edita un reactivo existente. */
const updateQuestion = async (req, res) => {
  const { text, riasecType } = req.body;
  const question = await adminQuestionService.updateQuestion(req.params.id, {
    text,
    riasecType,
  });
  res.status(200).json({ question });
};

/** DELETE /admin/questions/:id — soft delete (nunca borrado físico). */
const deactivateQuestion = async (req, res) => {
  const question = await adminQuestionService.deactivateQuestion(req.params.id);
  res.status(200).json({ question });
};

module.exports = { listQuestions, createQuestion, updateQuestion, deactivateQuestion };
