# Hapi JS
## INSTALATION

### Install Nodejs

1. Install Nodejs 12 or activate using nvm
2. npm install
3. You can run local commands using npx
   or SHELL AUTO FALLBACK mention here https://www.npmjs.com/package/npx

```bash
source <(npx --shell-auto-fallback zsh)
```

## Install npm packages

```
npm install
```

## Update Environment configuration

```
cp .env.sample .env
```

## Install postgres & setup db

For mac use [postgres app](https://postgresapp.com/)

For ubuntu: `sudo apt install postgresql`

Setup all db

```
./setup_db.sh
```

For reseting db use:

```bash
psql -U postgres -f setup-db.sql
```

## Run database migration

```
npm run db:migrate
```

## Start Dev Server in watch mode

```
npm run start:dev
```

## Run test cases

```
npm run test
or
npm test -- --silent
```

## Create New DB Migration

```
npm run db:make-migrate <migration_name>
```

###

- To debug Knex queries: `export DEBUG=knex*`
