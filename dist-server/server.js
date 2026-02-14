import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { UniversityService, TaskService, initDatabase } from './api/db.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
// API Routes
// Universities
app.get('/api/universities', async (req, res) => {
    try {
        const data = await UniversityService.getAll();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/universities/:id', async (req, res) => {
    try {
        const data = await UniversityService.getById(Number(req.params.id));
        if (!data)
            return res.status(404).json({ error: 'Not found' });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/universities', async (req, res) => {
    try {
        const data = await UniversityService.create(req.body);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/universities/:id', async (req, res) => {
    try {
        const data = await UniversityService.update(Number(req.params.id), req.body);
        if (!data)
            return res.status(404).json({ error: 'Not found' });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/universities/:id', async (req, res) => {
    try {
        await UniversityService.delete(Number(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/stats', async (req, res) => {
    try {
        const data = await UniversityService.getStats();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await TaskService.getAll();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/tasks', async (req, res) => {
    try {
        const data = await TaskService.create(req.body);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const data = await TaskService.update(Number(req.params.id), req.body);
        if (!data)
            return res.status(404).json({ error: 'Not found' });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await TaskService.delete(Number(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Serve static files from dist folder (sibling to dist-server)
const DIST_DIR = path.join(__dirname, '..', 'dist');
app.use(express.static(DIST_DIR));
// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});
const PORT = process.env.PORT || 3002;
// Initialize database before starting server
await initDatabase();
app.listen(PORT, () => {
    console.log(`🎓 Uni-Tracker server running on http://localhost:${PORT}`);
    console.log(`📊 SQLite database: ~/clawd/data/uni-tracker.db`);
});
