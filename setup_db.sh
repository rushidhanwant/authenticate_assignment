psql -U postgres -f setup-db.sql
npm run db:migrate
#npx knex seed:run
#NODE_ENV=Dev
