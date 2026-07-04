const PDFDocument = require('pdfkit');

/**
 * Generación del PDF de perfil vocacional (HU-06). Módulo de presentación puro:
 * recibe los datos YA calculados (perfil + recomendaciones de `questionnaireService`,
 * que a su vez usa `recommendationService`) y solo los da formato. No recalcula
 * afinidad ni orden: el reporte debe coincidir siempre con lo que el estudiante ve
 * en "Mi huella".
 *
 * Colores tomados de `client/src/styles/tokens.css` (--color-jade, --color-tinta,
 * --color-musgo): el PDF no puede leer CSS, así que se repiten acá como constantes.
 */

const COLOR_JADE = '#1d6835';
const COLOR_TINTA = '#1b211b';
const COLOR_MUSGO = '#576157';
const COLOR_HAIRLINE = '#d2dfd4';

/** Cuántas áreas afines se destacan en el reporte (igual que "Mi huella"). */
const AREAS_DESTACADAS = 3;
/** Cuántas carreras sugeridas se listan como máximo. */
const MAX_CARRERAS = 6;

const fechaLarga = (fecha) =>
  fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Junta carreras sugeridas a partir de las áreas recomendadas (en su mismo orden
 * de afinidad), sin repetir carreras, hasta un tope. Reusa las carreras que
 * `recommendationService`/`questionnaireService` ya embebieron en cada área.
 */
const buildSuggestedCareers = (recommendations, max = MAX_CARRERAS) => {
  const seen = new Set();
  const careers = [];
  recommendations.forEach((area) => {
    area.careers.forEach((career) => {
      if (careers.length < max && !seen.has(career.id)) {
        seen.add(career.id);
        careers.push({ ...career, areaName: area.name });
      }
    });
  });
  return careers;
};

/**
 * Arma el PDF del reporte de perfil vocacional y lo devuelve como `PDFDocument`
 * de pdfkit (stream) listo para hacer `.pipe(res)`.
 *
 * @param {{ fullName: string }} user
 * @param {{ scores: object, hollandCode: string, createdAt: string }} profile
 * @param {Array} recommendations áreas afines ya ordenadas (de `getRecommendations`)
 * @returns {import('pdfkit')}
 */
const buildProfileReportPdf = ({ user, profile, recommendations }) => {
  // Sin compresión: permite verificar el contenido del PDF en las pruebas sin un
  // parser de PDF aparte; el documento es corto, así que no hay costo real de tamaño.
  const doc = new PDFDocument({ size: 'A4', margin: 50, compress: false });
  const destacadas = recommendations.slice(0, AREAS_DESTACADAS);
  const carreras = buildSuggestedCareers(recommendations);

  doc
    .fillColor(COLOR_JADE)
    .fontSize(22)
    .text('Brújula Vocacional', { continued: false })
    .fillColor(COLOR_TINTA)
    .fontSize(16)
    .text('Reporte de perfil vocacional', { paragraphGap: 12 });

  doc
    .fillColor(COLOR_MUSGO)
    .fontSize(11)
    .text(`Estudiante: ${user.fullName}`)
    .text(`Fecha del reporte: ${fechaLarga(new Date())}`)
    .moveDown(1);

  doc
    .strokeColor(COLOR_HAIRLINE)
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke()
    .moveDown(1);

  doc
    .fillColor(COLOR_JADE)
    .fontSize(14)
    .text(`Código Holland: ${profile.hollandCode}`)
    .moveDown(0.5);

  doc.fillColor(COLOR_TINTA).fontSize(11);
  const orden = ['R', 'I', 'A', 'S', 'E', 'C'];
  orden.forEach((tipo) => {
    doc.text(`${tipo}: ${profile.scores[tipo] ?? 0}`, { continued: false });
  });
  doc.moveDown(1);

  doc.fillColor(COLOR_JADE).fontSize(14).text('Áreas más afines').moveDown(0.5);
  destacadas.forEach((area) => {
    doc
      .fillColor(COLOR_TINTA)
      .fontSize(12)
      .text(`${area.name} — ${area.affinity}%`, { continued: false })
      .fillColor(COLOR_MUSGO)
      .fontSize(10)
      .text(area.explanation)
      .moveDown(0.5);
  });

  doc.moveDown(0.5);
  doc.fillColor(COLOR_JADE).fontSize(14).text('Carreras sugeridas').moveDown(0.5);
  carreras.forEach((career) => {
    doc
      .fillColor(COLOR_TINTA)
      .fontSize(12)
      .text(career.name, { continued: false })
      .fillColor(COLOR_MUSGO)
      .fontSize(10)
      .text(`${career.areaName} · ${career.fieldOfWork} · ${career.duration}`)
      .moveDown(0.5);
  });

  return doc;
};

module.exports = { buildProfileReportPdf, buildSuggestedCareers };
