require('dotenv').config();

const bcrypt = require('bcrypt');
const { pool, query } = require('../src/config/db');

const QUESTIONS_BY_TYPE = {
  R: [
    'Disfruto reparar aparatos electrónicos o mecánicos.',
    'Me gusta trabajar con herramientas y máquinas.',
    'Prefiero actividades al aire libre a estar en una oficina.',
    'Me interesa construir o armar cosas con mis manos.',
    'Disfruto actividades físicas que requieren fuerza o destreza.',
  ],
  I: [
    'Me gusta investigar por qué ocurren los fenómenos naturales.',
    'Disfruto resolver problemas matemáticos complejos.',
    'Me interesa analizar datos para encontrar patrones.',
    'Prefiero leer sobre ciencia antes que sobre otros temas.',
    'Me gusta formular hipótesis y comprobarlas con experimentos.',
  ],
  A: [
    'Disfruto expresarme a través del arte, la música o la escritura.',
    'Me gusta imaginar soluciones creativas y poco convencionales.',
    'Prefiero actividades donde puedo improvisar y no seguir un guion.',
    'Me interesa el diseño visual y la estética de las cosas.',
    'Disfruto asistir a conciertos, exposiciones u obras de teatro.',
  ],
  S: [
    'Disfruto ayudar a otras personas a resolver sus problemas.',
    'Me gusta enseñar o explicar temas a otras personas.',
    'Prefiero trabajar en equipo antes que solo.',
    'Me interesa el bienestar y desarrollo de mi comunidad.',
    'Disfruto escuchar a otros y ofrecerles apoyo emocional.',
  ],
  E: [
    'Me gusta liderar proyectos y tomar decisiones.',
    'Disfruto convencer a otras personas de una idea o producto.',
    'Me interesa iniciar mis propios negocios o proyectos.',
    'Prefiero asumir riesgos calculados para lograr una meta.',
    'Me gusta competir y alcanzar objetivos ambiciosos.',
  ],
  C: [
    'Disfruto organizar información en tablas o sistemas ordenados.',
    'Me gusta seguir procedimientos claros y precisos.',
    'Prefiero trabajar con números, cuentas o registros.',
    'Me interesa mantener el orden y la exactitud en mis tareas.',
    'Disfruto planificar con detalle antes de actuar.',
  ],
};

const AREAS = [
  {
    name: 'Ingeniería y Tecnología',
    description: 'Diseño, construcción y mantenimiento de sistemas, máquinas y software.',
    riasecWeights: {
      R: 0.9,
      I: 0.8,
      A: 0.2,
      S: 0.1,
      E: 0.3,
      C: 0.4,
    },
  },
  {
    name: 'Ciencias Exactas y Naturales',
    description:
      'Estudio de fenómenos naturales, físicos y biológicos mediante el método científico.',
    riasecWeights: {
      R: 0.4,
      I: 0.95,
      A: 0.2,
      S: 0.2,
      E: 0.1,
      C: 0.3,
    },
  },
  {
    name: 'Artes y Diseño',
    description: 'Expresión creativa a través de la imagen, el espacio, el sonido y la forma.',
    riasecWeights: {
      R: 0.2,
      I: 0.3,
      A: 0.95,
      S: 0.3,
      E: 0.3,
      C: 0.1,
    },
  },
  {
    name: 'Ciencias Sociales y Educación',
    description: 'Comprensión de la sociedad, el comportamiento humano y la formación de personas.',
    riasecWeights: {
      R: 0.1,
      I: 0.4,
      A: 0.4,
      S: 0.95,
      E: 0.3,
      C: 0.2,
    },
  },
  {
    name: 'Administración y Negocios',
    description: 'Gestión de organizaciones, finanzas, mercados y emprendimientos.',
    riasecWeights: {
      R: 0.1,
      I: 0.2,
      A: 0.2,
      S: 0.4,
      E: 0.95,
      C: 0.8,
    },
  },
  {
    name: 'Salud y Ciencias Médicas',
    description: 'Cuidado, diagnóstico y tratamiento de la salud de las personas.',
    riasecWeights: {
      R: 0.5,
      I: 0.8,
      A: 0.2,
      S: 0.8,
      E: 0.3,
      C: 0.4,
    },
  },
];

const CAREERS_BY_AREA = {
  'Ingeniería y Tecnología': [
    {
      name: 'Ingeniería en Computación',
      description: 'Formación en desarrollo de software, algoritmos y arquitectura de sistemas.',
      fieldOfWork: 'Desarrollo de software y sistemas',
      duration: '5 años',
      profileDesc:
        'Perfil analítico, afinidad con la lógica y la resolución de problemas técnicos.',
    },
    {
      name: 'Ingeniería Industrial',
      description: 'Estudio de la optimización de procesos, recursos y sistemas productivos.',
      fieldOfWork: 'Optimización de procesos productivos',
      duration: '5 años',
      profileDesc: 'Perfil organizado, con visión de procesos y mejora continua.',
    },
    {
      name: 'Ingeniería Mecánica',
      description: 'Diseño, análisis y mantenimiento de máquinas y sistemas mecánicos.',
      fieldOfWork: 'Diseño y mantenimiento de sistemas mecánicos',
      duration: '5 años',
      profileDesc: 'Perfil práctico, interesado en el funcionamiento de máquinas.',
    },
    {
      name: 'Ingeniería Electrónica',
      description: 'Diseño de circuitos, sistemas embebidos y soluciones de automatización.',
      fieldOfWork: 'Diseño de circuitos y sistemas electrónicos',
      duration: '5 años',
      profileDesc: 'Perfil técnico, interesado en electrónica y automatización.',
    },
  ],
  'Ciencias Exactas y Naturales': [
    {
      name: 'Física',
      description: 'Estudio de las leyes que rigen la materia, la energía y el universo.',
      fieldOfWork: 'Investigación científica y docencia',
      duration: '4 años',
      profileDesc: 'Perfil investigativo, con gusto por modelar fenómenos naturales.',
    },
    {
      name: 'Química',
      description: 'Estudio de la composición, propiedades y transformación de la materia.',
      fieldOfWork: 'Laboratorios e industria química',
      duration: '4 años',
      profileDesc: 'Perfil analítico, meticuloso en la experimentación.',
    },
    {
      name: 'Matemática',
      description: 'Estudio de estructuras, patrones y modelos formales aplicados a la ciencia.',
      fieldOfWork: 'Investigación, docencia y análisis de datos',
      duration: '4 años',
      profileDesc: 'Perfil abstracto, con gusto por la lógica formal.',
    },
    {
      name: 'Biología',
      description: 'Estudio de los seres vivos, su estructura, función y evolución.',
      fieldOfWork: 'Investigación biológica y conservación',
      duration: '4 años',
      profileDesc: 'Perfil observador, interesado en los seres vivos.',
    },
  ],
  'Artes y Diseño': [
    {
      name: 'Diseño Gráfico',
      description: 'Comunicación de ideas a través de la imagen, la tipografía y el color.',
      fieldOfWork: 'Comunicación visual y branding',
      duration: '4 años',
      profileDesc: 'Perfil creativo, con sensibilidad estética y visual.',
    },
    {
      name: 'Arquitectura',
      description: 'Diseño y planificación de espacios habitables funcionales y estéticos.',
      fieldOfWork: 'Diseño y planificación de espacios',
      duration: '5 años',
      profileDesc: 'Perfil creativo con pensamiento espacial y técnico.',
    },
    {
      name: 'Música',
      description: 'Formación en interpretación, composición y teoría musical.',
      fieldOfWork: 'Interpretación, composición y docencia musical',
      duration: '4 años',
      profileDesc: 'Perfil artístico, con oído musical y expresividad.',
    },
    {
      name: 'Artes Plásticas',
      description: 'Exploración de técnicas de pintura, escultura y expresión visual.',
      fieldOfWork: 'Producción artística y galerías',
      duration: '4 años',
      profileDesc: 'Perfil expresivo, con interés en la creación visual.',
    },
  ],
  'Ciencias Sociales y Educación': [
    {
      name: 'Educación Primaria',
      description: 'Formación pedagógica para la enseñanza en los primeros años escolares.',
      fieldOfWork: 'Docencia en escuelas',
      duration: '4 años',
      profileDesc: 'Perfil paciente, con vocación de enseñanza.',
    },
    {
      name: 'Psicología',
      description: 'Estudio científico del comportamiento y los procesos mentales humanos.',
      fieldOfWork: 'Atención clínica, organizacional y educativa',
      duration: '5 años',
      profileDesc: 'Perfil empático, interesado en el comportamiento humano.',
    },
    {
      name: 'Trabajo Social',
      description: 'Intervención profesional para promover el bienestar de personas y comunidades.',
      fieldOfWork: 'Intervención social y comunitaria',
      duration: '4 años',
      profileDesc: 'Perfil solidario, orientado a ayudar a comunidades.',
    },
    {
      name: 'Sociología',
      description: 'Análisis de las estructuras sociales, instituciones y dinámicas colectivas.',
      fieldOfWork: 'Investigación social y políticas públicas',
      duration: '4 años',
      profileDesc: 'Perfil analítico sobre dinámicas sociales.',
    },
  ],
  'Administración y Negocios': [
    {
      name: 'Administración de Empresas',
      description: 'Formación en gestión, planificación estratégica y dirección organizacional.',
      fieldOfWork: 'Gestión y dirección de organizaciones',
      duration: '4 años',
      profileDesc: 'Perfil de liderazgo, orientado a resultados.',
    },
    {
      name: 'Contaduría Pública',
      description: 'Registro, análisis y auditoría de la información financiera de organizaciones.',
      fieldOfWork: 'Auditoría y gestión financiera',
      duration: '4 años',
      profileDesc: 'Perfil meticuloso, con orden y precisión numérica.',
    },
    {
      name: 'Mercadeo',
      description: 'Estrategias de posicionamiento de marca, producto y comunicación comercial.',
      fieldOfWork: 'Estrategia comercial y publicidad',
      duration: '4 años',
      profileDesc: 'Perfil persuasivo, creativo en estrategias comerciales.',
    },
    {
      name: 'Economía',
      description: 'Análisis de la producción, distribución y consumo de bienes y servicios.',
      fieldOfWork: 'Análisis económico y financiero',
      duration: '4 años',
      profileDesc: 'Perfil analítico, interesado en mercados y políticas económicas.',
    },
  ],
  'Salud y Ciencias Médicas': [
    {
      name: 'Medicina',
      description:
        'Formación clínica para el diagnóstico, tratamiento y prevención de enfermedades.',
      fieldOfWork: 'Diagnóstico y tratamiento clínico',
      duration: '6 años',
      profileDesc: 'Perfil resiliente, con vocación de servicio y rigor científico.',
    },
    {
      name: 'Enfermería',
      description: 'Cuidado integral de la salud de personas, familias y comunidades.',
      fieldOfWork: 'Cuidado directo de pacientes',
      duration: '4 años',
      profileDesc: 'Perfil empático, con capacidad de trabajo bajo presión.',
    },
    {
      name: 'Farmacia',
      description: 'Estudio de medicamentos, su elaboración, uso seguro y dispensación.',
      fieldOfWork: 'Elaboración y dispensación de medicamentos',
      duration: '5 años',
      profileDesc: 'Perfil meticuloso, con base científica sólida.',
    },
    {
      name: 'Nutrición',
      description: 'Estudio de la alimentación humana y su impacto en la salud.',
      fieldOfWork: 'Asesoría alimentaria y salud pública',
      duration: '4 años',
      profileDesc: 'Perfil orientado al bienestar y hábitos saludables.',
    },
  ],
};

const ADMIN_USER = {
  fullName: 'Administrador OrientaTec',
  email: 'admin@orientatec.cr',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin1234',
};

/** Vacía las tablas que este script puebla, en orden seguro para las FK. */
const resetTables = async () => {
  await query('TRUNCATE TABLE users, areas, questions RESTART IDENTITY CASCADE');
};

const seedAreas = async () => {
  const inserted = await Promise.all(
    AREAS.map((area) =>
      query(
        `INSERT INTO areas (name, description, riasec_weights)
         VALUES ($1, $2, $3)
         RETURNING id, name`,
        [area.name, area.description, JSON.stringify(area.riasecWeights)]
      )
    )
  );

  return inserted.reduce((areaIdsByName, result) => {
    const { id, name } = result.rows[0];
    return { ...areaIdsByName, [name]: id };
  }, {});
};

const seedCareers = async (areaIdsByName) => {
  const careerInserts = Object.entries(CAREERS_BY_AREA).flatMap(([areaName, careers]) =>
    careers.map((career) =>
      query(
        `INSERT INTO careers (area_id, name, description, field_of_work, duration, profile_desc)
           VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          areaIdsByName[areaName],
          career.name,
          career.description,
          career.fieldOfWork,
          career.duration,
          career.profileDesc,
        ]
      )
    )
  );

  await Promise.all(careerInserts);
};

const seedQuestions = async () => {
  const questionInserts = Object.entries(QUESTIONS_BY_TYPE).flatMap(([riasecType, texts]) =>
    texts.map((text) =>
      query('INSERT INTO questions (text, riasec_type) VALUES ($1, $2)', [text, riasecType])
    )
  );

  await Promise.all(questionInserts);
};

const seedAdmin = async () => {
  const passwordHash = await bcrypt.hash(ADMIN_USER.password, 10);

  await query(
    `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')`,
    [ADMIN_USER.fullName, ADMIN_USER.email, passwordHash]
  );
};

const run = async () => {
  try {
    await resetTables();
    const areaIdsByName = await seedAreas();
    await seedCareers(areaIdsByName);
    await seedQuestions();
    await seedAdmin();
    console.log('Seed completado: áreas, carreras, reactivos y usuario admin insertados.');
  } catch (error) {
    console.error('Error al ejecutar el seed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
