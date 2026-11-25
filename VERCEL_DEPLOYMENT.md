# Vercel and PostgreSQL deployment

This application uses Next.js 15 (App Router, React 19, TypeScript), PostgreSQL in production, Drizzle ORM, and PGlite only for local development. Vercel should deploy it as a normal Next.js application; do not enable static export or configure a separate output directory.

## Why migrations are not run while rendering pages

The database connection in `lib/db/index.ts` is for application queries only. It no longer applies Drizzle migrations or inserts seed content when a request first reaches a page. Previously `getDb()` ran Drizzle's migrator from the request path; Drizzle creates its `drizzle` metadata schema, which requires database-level `CREATE` privileges. This made a normal homepage request fail when the Vercel database role lacked that permission and also made every serverless instance a schema-migration runner.

Migrations are now an explicit operator/deployment task. Do not give the Vercel runtime role permission to create schemas or tables just to make page rendering work.

## Required Vercel environment variables

Set these in Vercel Project → Settings → Environment Variables, for Production (and Preview if those deployments need the production database):

- `DATABASE_URL`: hosted PostgreSQL URL used by Next.js at runtime. Use the provider's recommended pooled/serverless connection URL when available. It must connect over TLS where required.
- `AUTH_SECRET`: a private, high-entropy random secret. Never use a checked-in value or expose it through a `NEXT_PUBLIC_` variable.
- `NEXT_PUBLIC_SITE_URL`: the public origin, e.g. `https://visit-rwanda0.vercel.app`.

Optional controlled maintenance credentials (do not add these to client-exposed variables):

- `MIGRATION_DATABASE_URL`: PostgreSQL URL for a deployment operator or trusted migration job. Prefer a separate role with only the permissions needed to apply migrations.
- `SEED_DATABASE_URL`: optional role/URL for the one-time or explicitly requested seed operation.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: only if intentionally using the seed script to create the initial administrator. Remove them after setup if not needed.
- `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`: optional transactional email configuration.

Use Vercel's encrypted environment-variable settings or a trusted CI secret store. Never commit real values in `.env`, `.env.local`, workflow files, or logs. Redeploy after changing variables.

## Safe database preparation

1. Confirm which existing PostgreSQL database the project should use. Do not create a replacement database just to resolve a permission error.
2. Take a provider snapshot/backup and inspect the existing tables and Drizzle migration history before applying migrations. The current migration files contain `CREATE TABLE` statements and are not intended to be replayed against a schema that already has those tables but no matching Drizzle migration records. Do not drop tables, schemas, or migration history to force a rerun.
3. Run `npm run db:check` locally with the runtime `DATABASE_URL`. This runs only `SELECT 1` and does not change database state.
4. From a trusted local machine or deployment job with `MIGRATION_DATABASE_URL` set, run `npm run db:migrate`. This is not a Vercel build or page-start command. Inspect errors and migration history before retrying a partial migration.
5. Run `npm run db:seed` only when intentionally initializing content. The seed code inserts default content only when the destinations table is empty, adds default video rows only when that table is empty, and creates an initial administrator only when configured and no administrator already exists. Review the script and take a backup first when using an existing database.

`DATABASE_URL` may be used for migration/seed commands as a fallback for local or single-role setup. With separate credentials, use `MIGRATION_DATABASE_URL` for migrations and `SEED_DATABASE_URL` (or migration URL) for the explicit seed operation. Never place migration credentials in a `NEXT_PUBLIC_*` variable.

## PostgreSQL privileges

The exact role grants depend on provider and schema ownership. For a typical existing database whose application tables are in `public`:

- The migration role needs `CONNECT` to the database, `CREATE` on the database to create Drizzle's `drizzle` migration schema, and `USAGE, CREATE` on `public` to create the application's tables. It needs to own or have suitable rights on the migration metadata objects it creates. Restrict this role to the migration job/operator; it does not need to be a superuser.
- The runtime role needs `CONNECT`, `USAGE` on `public`, and only the table/sequence privileges required by application features (read, insert, update, delete as used by the app). It does not need database `CREATE`, schema `CREATE`, or permission to apply migrations.
- If tables already exist, granting privileges on existing tables is separate from setting default privileges for future tables. Have the database owner/provider configure these for the actual runtime role. Avoid broad grants to `PUBLIC`.

A PostgreSQL administrator/owner should confirm the exact existing database, schema, table ownership, and roles before running grants. The code cannot determine these from the repository, and no credentials or database changes were available during this review.

## Deploy settings

- Framework preset: Next.js
- Root directory: repository root
- Install command: `npm install` (or Vercel's default)
- Build command: `npm run build`
- Output directory: leave the Next.js default; do not set a static output directory
- Production branch: `main`

The build must not run migrations or require database access. GitHub pushes to the configured production branch trigger Vercel's normal automatic deployment. After deployment, test `/`, `/login`, and a representative public data page, then inspect Vercel Runtime Logs and the deployment's build log.

## Verification commands

```bash
npm install
npm run db:check       # requires DATABASE_URL; read-only
npm run db:migrate     # explicit; requires migration credentials/permissions
npm run db:seed        # explicit and only when intended
npx tsc --noEmit
npm run build
```

These commands must be run in the repository environment. Passing a build does not prove that the configured production database is reachable or that its existing migration history is compatible; verify those separately without exposing connection strings.
