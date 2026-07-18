# Prisma v7 Setup + Troubleshooting Guide (Node.js + TypeScript)

This guide explains exactly what went wrong in your project and gives a repeatable setup you can reuse for future Prisma projects.

---

## 1) What happened in this project

You saw:

```txt
Error: Cannot find module '.prisma/client/default'
```

### Root cause

Your Prisma schema generator was configured like this:

```prisma
generator client {
  provider = "prisma-client"
  output   = "./generated"
}
```

But your app imports Prisma like this:

```ts
import { PrismaClient } from "@prisma/client";
```

`@prisma/client` expects generated artifacts inside:

- `node_modules/@prisma/client`
- `node_modules/.prisma/client`

Since generation output went to `prisma/generated`, Node could not find `.prisma/client/default`.

---

## 2) Correct setup for this style of project (recommended)

If you want to import from `@prisma/client`, use this in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

> Do **not** set `output = "./generated"` unless you intentionally want custom imports and custom integration.

---

## 3) Prisma v7 important runtime change

With Prisma v7, for your setup, plain `new PrismaClient()` was not enough and produced:

```txt
PrismaClientInitializationError: PrismaClient needs ... valid PrismaClientOptions
```

You must provide a database adapter.

---

## 4) Working runtime client file (PostgreSQL)

Install required dependencies:

```bash
npm install @prisma/client
npm install -D prisma
npm install pg @prisma/adapter-pg
```

Use this in `src/lib/prisma.ts`:

```ts
import dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
```

---

## 5) Required environment variable

In `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

If this is missing, startup should fail fast (good behavior).

---

## 6) Commands you should run (order matters)

From project root:

```bash
npm install
npx prisma generate
npm run drill:N4
```

If schema changes:

```bash
npx prisma generate
```

If doing migrations:

```bash
npx prisma migrate dev --name init
```

---

## 7) Fix checklist for common errors

### A) `Cannot find module '.prisma/client/default'`

Check:
1. `schema.prisma` generator uses `provider = "prisma-client-js"`
2. `@prisma/client` is installed
3. Run `npx prisma generate`

### B) `PrismaClientInitializationError` (needs valid PrismaClientOptions)

Check:
1. Prisma v7 runtime file uses adapter (`@prisma/adapter-pg` for Postgres)
2. `pg` and `@prisma/adapter-pg` installed
3. `DATABASE_URL` is present

### C) `P1012` about datasource `url`

If Prisma says datasource `url` is no longer supported in schema:
1. Remove `url = env("DATABASE_URL")` from schema
2. Keep provider only in schema
3. Pass runtime config via adapter in `PrismaClient` setup

---

## 8) Golden template for new Prisma projects (Postgres, TS)

1. Initialize:

```bash
npm init -y
npm install @prisma/client pg @prisma/adapter-pg
npm install -D prisma typescript tsx @types/node
npx prisma init
```

2. Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

3. Add models, then:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Create `src/lib/prisma.ts` using adapter (same as section 4).

5. Run app.

---

## 9) Optional guardrail (recommended)

Add this script in `package.json` to auto-generate Prisma Client after install:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "prisma:generate": "prisma generate"
  }
}
```

This prevents most “client not found” issues after fresh clone or reinstall.

---

## 10) Quick recovery commands (copy/paste)

If Prisma setup breaks in a repo:

```bash
npm install
npx prisma generate
```

If still failing, verify:

- `prisma/schema.prisma` generator/provider config
- `src/lib/prisma.ts` adapter config
- `.env` `DATABASE_URL`
- matching Prisma package versions (`prisma` and `@prisma/client`)

