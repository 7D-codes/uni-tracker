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
- **Database:** JSON file (simple, portable)
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
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/uni-tracker.git
   git push -u origin main
   ```

2. Connect to Vercel
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. Deploy!

## Local Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173 (frontend) and http://localhost:3001 (API)

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
