This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Start the Node API and Next.js in separate terminals:

```bash
npm run api:dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Courses

Node is the only service that connects to MySQL. Next.js serves the UI and proxies API calls to Node. Add your local settings to `.env.local` (never commit this file):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=school
API_HOST=127.0.0.1
API_PORT=4000
NODE_API_URL=http://127.0.0.1:4000
AUTH_SESSION_SECRET=replace-with-a-random-secret-at-least-32-characters-long
```

Generate a session secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Check the connection and table list with `npm run db:check`. Seed the original course catalog with `npm run db:seed`. The seed adds 84 courses, 35 lessons per course, lesson quizzes, and final exams; it skips courses with a matching title and subject and does not delete or update existing rows.

Before enabling registration, run `npm run db:migrate-auth`. This idempotent migration adds a nullable `password_hash` column to `users`; it does not alter existing account rows. The Node service hashes new passwords with bcrypt and uses the existing unique email index.

Lesson writing is original. Each course includes research references from NASA, OpenStax subject catalogs, Purdue OWL, the Library of Congress, NIST, the U.S. Small Business Administration, Smithsonian Learning Lab, British Council, USGS, Harvard CS50, MedlinePlus, or Open Music Theory, as appropriate to its subject.

## Node API

The `/login` and `/signup` forms send same-origin requests to Next.js, which proxies them to Node. Node serves `GET /health`, `GET /api/courses`, `GET /api/courses/:courseId`, `POST /auth/login`, `POST /auth/signup`, `GET /auth/me`, and `POST /auth/logout`.

Login accepts `{ "email": "...", "password": "..." }`; signup accepts `{ "name": "...", "email": "...", "password": "..." }`. Successful auth sets a signed `HttpOnly`, `SameSite=Lax` session cookie; production cookies use `Secure`. The Node API is bound to loopback by default and is intended to be reached by Next.js, not directly by browser JavaScript.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
