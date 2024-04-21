# Node JS Routing Controller Boilerplate

A boilerplate project for building Node.js applications using Typescript, Routing Controllers, TypeORM, and Class Validator. Simple deployment & simple setup supported with custom decorators

## Features

- **Typescript**: The project is written in Typescript, a statically-typed superset of JavaScript that enhances code quality and maintainability. ✨
- **Routing Controllers**: Utilizes [Routing Controllers](https://github.com/typestack/routing-controllers) for efficient and organized routing management. 🚀
- **Type ORM**: Employs [Type ORM](https://typeorm.io/) for seamless database operations, providing an easy-to-use and powerful Object-Relational Mapping (ORM) solution. 💪
- **Class Validator**: Integrates [Class Validator](https://github.com/typestack/class-validator) for robust input validation, ensuring data integrity and security. 🔒
- **TypeORM seeding**: Implements TypeORM seeding for convenient and automated database seeding, saving development time and effort. 🌱
- **OpenAPI**: Utilizes [Swagger](https://swagger.io/) for comprehensive API documentation, making it easier for developers to understand and consume the API. 📚
- **Modular**: The project follows a modular architecture, allowing for easy extension and maintenance, promoting code reusability and scalability. 🧩

## Getting Started

### Prerequisites

- Node.js
- Npm
- Docker

### Installation

Clone the repository:

```bash
git clone
```

Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

Create a `.env` file in the root directory and configure the environment variables:

```bash
BASE_URL="http://localhost:4000"
NODE_ENV="development"

DB_HOST="localhost"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="testdb"
DB_PORT="5432"

PORT="4000"

JWT_SECRET="j1256BwwXA6vmM7OV8ujsgUyA3BW72JsWE9mMt2SBgg"
TOKEN_SECRET_KEY="XQyyhBrXcGVLqwtKY+E9PFb6kpLZHe8ZhJsFXZquaig"
```

or

```bash
cp .env.example .env
```

Start the application:

```bash
npm start:dev
```

### Migrations

To run the migrations, execute the following command:

```bash
npm run typeorm migration:run
```

To create a new migration, execute the following command:

```bash
npm run typeorm migration:create -- -n MigrationName
```

If you have any changes in the entities, you can generate a new migration by executing the following command:

```bash
npm run typeorm migration:generate -- -n MigrationName
```

If you wants to revert the last migration, you can execute the following command:

```bash
npm run typeorm migration:revert
```

### Seeding

To seed the database, execute the following command:

```bash
npm run seed
```

if you want to add a new seed file, you can create a new file in the `src/seeds` directory, then you can create your own seed:

```typescript
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { EntityValues } from 'common.interface';
import { DataSource } from 'typeorm';

export default class RolePermissionSeeder extends Seeder {
  async run(dataSource: DataSource) {
    // Your seeder code.
  }
}
```

### Open API Documentation

To view the API documentation, navigate to `http://localhost:{YOUR_PORT}/docs`.

## Quick start

To create an API you just need to create your controller & service

### Create a new module

To create a new module, you need to create one specific module like image below:

<img width="100%" alt="image" src="https://github.com/rashgaroth/node-typeorm-decorator-boilerplate/assets/50513263/f9328000-fbbf-47d1-b961-79a863da9bbc">

- **DTO** -- is the internal DTOs for it's module
- **{*}.controller.ts** -- is the controller where you will define your routes
- **{*}.service.ts** -- is the service that can provide any returned value / proceed any value

### Create an APIs

  Create your own controller with the decorator

```typescript
import { CurrUser } from 'common.interface';
import {
  Authorized,
  CurrentUser,
  Get,
  JsonController,
  Put,
} from 'routing-controllers';

@JsonController('/identity')
export class IdentityController {
  identityService: IdentityService;

  constructor() {
    this.identityService = new IdentityService();
  }

  @Get('/health')
  @Authorized(['*'])
  healthCheck() {
    return 'OK';
  }

  @Get('/me')
  @Authorized(['*'])
  healthCheck(
   @CurrentUser() user: CurrUser
  ) {
    return this.identityService.getMe(user.id);
  }
}
```

- **@Authorized** -- is the user validation to ensure that every request has authorization method (bearer)
- **healthCheck()** -- is your controller's function
- **@CurrentUser()** -- is the function decorator that will decode & return the current user

## Docker

This docker-compose.yml file is used to define two services: identity-db and digivite-identity. Docker Compose uses this file to create and manage these services.

The identity-db service is a PostgreSQL database. The `image: postgres:latest` line tells Docker to use the latest version of the PostgreSQL Docker image. The env_file: `./.env.ci` line tells Docker to use the environment variables defined in the `.env.ci` file. The expose: 5433 line makes the PostgreSQL service available on port 5433 to linked services. The volumes: `./data:/var/lib/postgresql/data` line persists the data of the database by mapping the data directory of the PostgreSQL container to a local directory called `./data`.

To run the application using Docker, execute the following command:

```bash
docker-compose up
```

To stop the application, execute the following command:

```bash
docker-compose down
```

## To Do

- [ ] Add unit testing
- [ ] Kubernetes Deployment
- [ ] CI/CD Integration
