const careerService = require('../services/careerService');

/** GET /careers?search=&area= — catálogo de carreras (HU-04). */
const listCareers = async (req, res) => {
  const { search, area } = req.query;
  const careers = await careerService.listCareers({ search, area });
  res.status(200).json({ careers });
};

/** GET /careers/:id — ficha de una carrera (HU-04). */
const getCareer = async (req, res) => {
  const career = await careerService.getCareerById(req.params.id);
  res.status(200).json({ career });
};

/** GET /careers/compare?a=&b= — comparación de dos carreras distintas (HU-05). */
const compareCareers = async (req, res) => {
  const { a, b } = req.query;
  const careers = await careerService.compareCareers({ a, b });
  res.status(200).json({ careers });
};

module.exports = { listCareers, getCareer, compareCareers };
