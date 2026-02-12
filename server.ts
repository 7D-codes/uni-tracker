import express from 'express';
import cors from 'cors';
import { UniversityService, TaskService } from './api/db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Universities
app.get('/api/universities', async (req, res) => {
  try {
    const data = await UniversityService.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/universities/:id', async (req, res) => {
  try {
    const data = await UniversityService.getById(Number(req.params.id));
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/universities', async (req, res) => {
  try {
    const data = await UniversityService.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/universities/:id', async (req, res) => {
  try {
    const data = await UniversityService.update(Number(req.params.id), req.body);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/universities/:id', async (req, res) => {
  try {
    await UniversityService.delete(Number(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const data = await UniversityService.getStats();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const data = await TaskService.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const data = await TaskService.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const data = await TaskService.update(Number(req.params.id), req.body);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await TaskService.delete(Number(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
