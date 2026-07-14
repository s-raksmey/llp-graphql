# LLP GraphQL

GraphQL backend API for the Lecture Learning Platform. This service is designed
to sit beside:

- `llp-web` on `http://localhost:3001`
- `llp-admin` on `http://localhost:3000`
- `llp-graphql` on `http://localhost:4000`

The API uses a Next.js route handler with MySQL-backed categories, lectures,
lecture outlines, and per-section lecture content.

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
  -d "{\"query\":\"query { health { ok service } lectures { id title slug status } }\"}"
```

## Current Schema Coverage

- Categories: list, detail, create, edit, archive, delete
- Lectures: list, detail, create
- Lecture outlines: parent and child outline items
- Lecture content: save content per outline item

## Next Backend Steps

- Add authentication with JWT and bcrypt password checks.
- Add role-based authorization for admin mutations.
- Add persistent media storage through local storage, S3, R2, or UploadThing.
- Add GraphQL Code Generator for admin and web typed operations.
