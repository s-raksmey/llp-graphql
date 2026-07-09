# LLP GraphQL

GraphQL backend API for the Lecture Learning Platform. This service is designed
to sit beside:

- `llp-web` on `http://localhost:3001`
- `llp-admin` on `http://localhost:3000`
- `llp-graphql` on `http://localhost:4000`

The first version uses a Next.js route handler and in-memory seed data so the
web and admin apps can start integrating against a real GraphQL schema before
MySQL, authentication persistence, and file storage are connected.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) to see the API status page.

GraphQL endpoint:

```text
http://localhost:4000/api/graphql
```

Example request:

```bash
curl -X POST http://localhost:4000/api/graphql \
  -H "content-type: application/json" \
  -d "{\"query\":\"query { health { ok service version } courses(status: PUBLISHED) { id title slug lectureCount } }\"}"
```

## Current Schema Coverage

- Authentication: development `login`
- Courses: list, detail, create, status updates
- Lectures: list, detail, create, publish
- Media: list and filter seed media
- Users: list admin users
- Settings: read and update site settings
- Search: course and lecture search

## Next Backend Steps

- Add MySQL 8 with Knex.js or Prisma.
- Replace development tokens with JWT and bcrypt password checks.
- Add role-based authorization for admin mutations.
- Add persistent media storage through local storage, S3, R2, or UploadThing.
- Add GraphQL Code Generator for admin and web typed operations.
