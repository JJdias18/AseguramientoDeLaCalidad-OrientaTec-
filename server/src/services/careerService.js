const careerRepository = require('../repositories/careerRepository');
const scoringService = require('./scoringService');
const AppError = require('../utils/AppError');

/**
 * Orquestación del catálogo de carreras (HU-04). El filtrado (búsqueda insensible a
 * acentos/mayúsculas + área) vive en SQL (`careerRepository`); acá solo se valida
 * la entrada y se da forma a la salida para el cliente.
 */

/** Área de cara al cliente: el punto de tinta usa la dimensión que más pesa en el área. */
const toAreaSummary = (row) => ({
  id: row.area_id,
  name: row.area_name,
  dominantType: scoringService.rankTypes(row.area_weights)[0],
});

const toListItem = (row) => ({
  id: row.id,
  name: row.name,
  fieldOfWork: row.field_of_work,
  duration: row.duration,
  area: toAreaSummary(row),
});

const toDetail = (row) => ({
  ...toListItem(row),
  description: row.description,
  profileDesc: row.profile_desc,
  area: { ...toAreaSummary(row), weights: row.area_weights },
});

/** `area` llega como string desde el query param; vacío/ausente = sin filtro. */
const parseAreaId = (area) => {
  if (area === undefined || area === null || area === '') {
    return undefined;
  }
  const areaId = Number(area);
  if (!Number.isInteger(areaId) || areaId <= 0) {
    throw new AppError(400, 'INVALID_AREA', 'El área indicada no es válida.');
  }
  return areaId;
};

/** GET /careers: catálogo con búsqueda por nombre y filtro por área, ambos opcionales. */
const listCareers = async ({ search, area } = {}) => {
  const areaId = parseAreaId(area);
  const term = typeof search === 'string' ? search.trim() : '';

  const rows = await careerRepository.search({ search: term || undefined, areaId });
  return rows.map(toListItem);
};

/** GET /careers/:id: ficha con descripción, campo laboral, duración y perfil. */
const getCareerById = async (id) => {
  const careerId = Number(id);
  if (!Number.isInteger(careerId) || careerId <= 0) {
    throw new AppError(400, 'INVALID_CAREER', 'La carrera indicada no es válida.');
  }

  const row = await careerRepository.findByIdWithArea(careerId);
  if (!row) {
    throw new AppError(404, 'CAREER_NOT_FOUND', 'No encontramos esa carrera.');
  }
  return toDetail(row);
};

module.exports = { listCareers, getCareerById };
