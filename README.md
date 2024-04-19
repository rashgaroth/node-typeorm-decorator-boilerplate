# Node JS Routing Controller Boilerplate

A boilerplate project for building Node.js applications using Typescript, Routing Controllers, TypeORM, and Class Validator.

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
- npm
- Docker (optional)

### Installation

1. Clone the repository:

```bash
git clone
```

2. Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

3. Create a `.env` file in the root directory and configure the environment variables:

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

4. Start the application:

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

### Documentation

To view the API documentation, navigate to `http://localhost:4000/docs`.
