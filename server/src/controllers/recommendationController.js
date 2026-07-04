const questionnaireService = require('../services/questionnaireService');

/**
 * GET /recommendations — áreas afines al perfil del usuario (HU-03). Si no hay
 * perfil, responde 200 con `hasProfile: false` (la UI lo dirige al cuestionario);
 * nunca es un error de sesión.
 */
const getRecommendations = async (req, res) => {
  const result = await questionnaireService.getRecommendations(req.user.id);
  res.status(200).json(result);
};

module.exports = { getRecommendations };
