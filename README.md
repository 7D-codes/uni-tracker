# University Application Tracker

A full-stack web app for tracking university applications with deadlines, requirements, and tasks.

**Built for:** Personal use on your local machine + Cloudflared tunnel

## Features

- 📊 Dashboard with application stats
- 🎓 Add and manage universities
- ✅ Track application status (researching → planning → applied → accepted/rejected)
- 📅 Task and deadline management
- 📝 Notes and requirements tracking

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + Node.js (single server)
- **Database:** SQLite (better-sqlite3) — persists to `~/clawd/data/uni-tracker.db`
- **Deployment:** Cloudflared tunnel to your domain (7d.codes)

## Quick Start

```bash
# Install dependencies
npm install

# Build frontend + start production server
npm start
```

Then open http://localhost:3000

## Development

```bash
# Run in dev mode (hot reload for frontend + backend)
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api

## Deploy with Cloudflared

```bash
# Install cloudflared
brew install cloudflared

# Login (one-time)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create unitracker

# Route to your domain
cloudflared tunnel route dns unitracker 7d.codes

# Config at ~/.cloudflared/config.yml
tunnel: <your-tunnel-id>
credentials-file: ~/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: 7d.codes
    service: http://localhost:3000
  - service: http_status:404
```

Then run:
```bash
# Start the app
npm start

# In another terminal, start the tunnel
cloudflared tunnel run unitracker
```

Or use `brew services start cloudflared` to auto-start on boot.

## Database

SQLite database lives at `~/clawd/data/uni-tracker.db` — outside the project folder so it survives git operations or project moves.

The database auto-initializes with seed data on first run.

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

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Build + run production server |
| `npm run dev` | Dev mode with hot reload |
| `npm run build` | Build frontend + server |
| `npm run preview` | Preview production build |
