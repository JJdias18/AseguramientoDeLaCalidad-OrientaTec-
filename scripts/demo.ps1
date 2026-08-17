npm run test:hu01     # Registro e inicio de sesión
npm run test:hu02     # Cuestionario vocacional
npm run test:hu03     # Recomendación de áreas
npm run test:hu04     # Catálogo de carreras
npm run test:hu05     # Comparador
npm run test:hu06     # Reporte PDF
npm run test:hu07     # Banco de reactivos

Por tipo de prueba

npm run test:humo         # 6 pruebas, una por capa — arranca en 2 segundos
npm run test:unitarias    # 47 del servidor: motores RIASEC, validadores, middlewares
npm run test:api          # 53 de integración con Supertest contra Postgres real
npm run test:cobertura    # con reporte de cobertura

npm test --workspace client

npm run lint            # calidad del código: bugs potenciales, convenciones, accesibilidad
npm run format:check    # formato: comillas, punto y coma, ancho de línea, indentación

Admin de la aplicación: admin@orientatec.cr / Admin1234.
#-----------------------------------------------------------------------

Montar la base de datos (en orden)

docker compose up -d db                     # levanta Postgres en localhost:5432
npm run migrate --workspace server          # aplica las 7 migraciones
npm run db:seed --workspace server          # 6 áreas, 24 carreras, 30 reactivos, 1 admin

Después de correr las pruebas

npm run db:seed --workspace server          # resembrar: HU-07 deja el conteo en 29 o 31

Manejo del contenedor

docker compose ps                           # ver si está arriba
docker compose down                         # apagar, los datos se conservan
docker compose down -v                      # borrar todo y empezar de cero

Levantar la app (una terminal para cada uno)

npm run dev:server                          # http://localhost:3000
npm run dev:client                          # http://localhost:5173