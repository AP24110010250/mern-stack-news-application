# MERN News Application

A full-stack news app built with MongoDB, Express, React, and Node.

## Features

- Article feed with featured stories, categories, and search.
- Live India headlines through NewsData.io when `NEWS_API_KEY` is configured.
- User and admin authentication with JWT sessions.
- Watch Later saved articles per signed-in user.
- Admin-only article publishing.
- Forgot-password reset links with optional SMTP email delivery.
- Article detail pages.
- Publish form for adding new stories.
- Express REST API with MongoDB persistence through Mongoose.
- Local sample-data fallback when MongoDB is not connected.
- Seed script for loading demo articles into MongoDB.

## Quick Start

Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Create environment variables:

```bash
copy .env.example server\.env
```

Add your NewsData.io key to `server\.env`:

```bash
NEWS_API_KEY=your_newsdataio_key_here
MONGO_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/news-app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_ACCESS_CODE=replace-with-private-admin-code
```

The local admin access code currently configured is `IndiaDeskAdmin2026`.
Admin signup and admin login both require that code.

Start MongoDB locally, then seed demo articles:

```bash
npm run seed
```

Run the full app:

```bash
npm run dev
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## API Routes

- `GET /api/health`
- `GET /api/articles`
- `GET /api/articles/categories`
- `GET /api/articles/:slug`
- `POST /api/articles`
- `PUT /api/articles/:slug`
- `DELETE /api/articles/:slug`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/saved-articles`
- `POST /api/saved-articles`
- `DELETE /api/saved-articles/:slug`

Query parameters for `GET /api/articles`:

- `q`: search text
- `category`: category name
- `tag`: tag name
- `featured`: `true` or `false`
- `page`: page number
- `limit`: page size

## Notes

If `NEWS_API_KEY` is set, the API serves live India headlines from NewsData.io. If it is missing or unavailable, the API falls back to MongoDB and then to bundled sample articles.

Password reset emails require SMTP settings in `server\.env`. Without SMTP settings, the API creates the reset link and logs/returns it for local development.
