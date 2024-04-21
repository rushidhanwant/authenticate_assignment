# Authenticate Assignment

## INSTALATION

### Install Nodejs

1. Install Nodejs 12 or activate using nvm
2. npm install

## Install npm packages

```
npm install
```

## Update Environment configuration

```
cp .env.sample .env
```

## Install postgres & setup db

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
## Test Coverage
```
npm run test:cov
```
85% test coverage
![85% test coverage](https://github.com/rushidhanwant/authenticate_assignment/assets/54628056/7fa2457d-4285-407b-9e49-5f2da74c6d86)

## Create New DB Migration

```
npm run db:make-migrate <migration_name>
```
## Directory structure

    .
    ├── src
    │   ├── authentication
    │   │   ├── handler.ts
    │   │   ├── repo.ts
    │   │   ├── router.ts
    │   │   └── stypes.ts
    │   ├── phonebook
    │   │   ├── handler.ts
    │   │   ├── repo.ts
    │   │   ├── router.ts
    │   │   └── stypes.ts
    │   ├── user
    │   │   ├── handler.ts
    │   │   ├── repo.ts
    │   │   ├── router.ts
    │   │   └── stypes.ts
    │   ├── diagnostic
    │   │   └── router.ts
    │   ├── config.ts
    │   ├── db.ts
    │   ├── index.ts
    │   └── server.ts
    ├── test
    │   ├── env
    │   │   ├── factories.ts
    │   │   └── testEnvironment.ts
    │   ├── functional
    │   │   ├── auth.spec.ts
    │   │   ├── search.spec.ts
    │   │   ├── spam.spec.ts
    │   │   └── userSignup.spec.ts
    │   ├── nonfunctional
    │   │   ├── diagnostic.spec.ts
    │   │   └── swagger.spec.ts
    │   └── dummy.ts
    ├── Dockerfile
    ├── setup_db_sh
    ├── .env.sample
    └── README.md
    
    1. authentication - Contains Api for login are in this folder.
       route.ts - Contains all the routes 
       handler.ts - contains buisness logic.
       repo.ts - contains handlers to fetch/persist data in the db
       type.ts - contains all the types.
    2. phonebook - Contains Apis for Searching, Spam and Contact detaiils
    3. user - Contains APi for sign up
    4. config.ts - Contains constants which can be configured based on environment
    5. db.ts - Knex.js setup 
    6. index.ts - Initialise the server
    7. server.ts - Server configuration and setup.
    8. test -  This folder contains all the tests.
    9. env/testEnvironment.ts - Test server setup
    10. functional - Unit tests for auth, serach, spam, and user
    11. dummy.ts - Script for genrating dummy contact list
    11. setup_db_sh - Script to create database 

## Technology Stack

```
NodeJS Framework
- Hapi.js

Orm/Query Builder
- Knex.js

Database
- PostgreSQL

Testing Framework
- Mocha
- Chai (assertion library)
```

