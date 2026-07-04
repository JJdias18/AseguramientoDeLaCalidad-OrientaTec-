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

module.exports = { listCareers, getCareer };
