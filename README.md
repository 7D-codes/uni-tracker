# University Application Tracker

A full-stack web app for tracking university applications with deadlines, requirements, and tasks.

## Features

- 📊 Dashboard with application stats
- 🎓 Add and manage universities
- ✅ Track application status (researching → planning → applied → accepted/rejected)
- 📅 Task and deadline management
- 📝 Document tracking

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + Node.js
- **Database:** SQLite (local) / PostgreSQL (production)
- **ORM:** Drizzle ORM
- **Deployment:** Vercel

## Development

```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Start dev server (frontend + backend)
npm run dev
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables if needed
4. Deploy

## API Endpoints

- `GET /api/universities` - List all universities
- `GET /api/universities/:id` - Get university by ID
- `POST /api/universities` - Add new university
- `PUT /api/universities/:id` - Update university
- `DELETE /api/universities/:id` - Delete university
- `GET /api/stats` - Get application statistics
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Add new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
