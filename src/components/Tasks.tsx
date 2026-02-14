import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Task {
  id: number;
  universityId?: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  priority: string;
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          status: 'todo',
        }),
      });

      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: task.status === 'done' ? 'todo' : 'done',
          completedAt: task.status === 'done' ? null : new Date().toISOString(),
        }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const daysUntil = getDaysUntil(dateStr);
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (daysUntil === null) return null;
    if (daysUntil < 0) return { text: `${Math.abs(daysUntil)}d overdue`, status: 'overdue', formatted };
    if (daysUntil === 0) return { text: 'Due today', status: 'urgent', formatted };
    if (daysUntil === 1) return { text: 'Due tomorrow', status: 'soon', formatted };
    if (daysUntil <= 7) return { text: `${daysUntil}d left`, status: 'soon', formatted };
    return { text: formatted, status: 'normal', formatted };
  };

  // Sort tasks: incomplete first, then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return new Date(a.dueDate || '9999').getTime() - new Date(b.dueDate || '9999').getTime();
  });

  const incompleteTasks = sortedTasks.filter(t => t.status !== 'done');
  const completedTasks = sortedTasks.filter(t => t.status === 'done');

  return (
    <div className="tasks">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {incompleteTasks.length} task{incompleteTasks.length !== 1 ? 's' : ''} remaining
          </span>
        </div>
        <button className="add-task-btn" onClick={() => setShowForm(!showForm)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8m-4-4h8" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <form onSubmit={addTask} className="task-form">
          <div className="task-form-grid">
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                className="form-input"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input
                className="form-input"
                placeholder="Add details..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                className="form-input"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group" style={{ alignSelf: 'end' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h3 className="empty-state-title">No tasks yet</h3>
          <p className="empty-state-text">Add your first task to start tracking deadlines</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add Your First Task
          </button>
        </div>
      ) : (
        <div className="tasks-container">
          {/* Incomplete Tasks */}
          {incompleteTasks.map((task) => {
            const dueInfo = formatDueDate(task.dueDate);
            const isOverdue = dueInfo?.status === 'overdue';

            return (
              <div
                key={task.id}
                className={`task-item ${task.status} ${isOverdue ? 'overdue' : ''}`}
              >
                <div
                  className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                  onClick={() => toggleTask(task)}
                />

                <div className="task-content">
                  <div className={`task-title ${task.status === 'done' ? 'done' : ''}`}>
                    {task.title}
                  </div>

                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}

                  <div className="task-meta">
                    {dueInfo && (
                      <span className={`task-due ${dueInfo.status === 'overdue' ? 'overdue' : dueInfo.status === 'soon' || dueInfo.status === 'urgent' ? 'soon' : ''}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {dueInfo.text}
                      </span>
                    )}
                    <span className={`task-priority ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <button className="task-delete" onClick={() => deleteTask(task.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <>
              <div style={{
                padding: '1rem 0',
                marginTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600
              }}>
                Completed ({completedTasks.length})
              </div>

              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-item done"
                >
                  <div
                    className="task-checkbox checked"
                    onClick={() => toggleTask(task)}
                  />

                  <div className="task-content">
                    <div className="task-title done">{task.title}</div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                  </div>

                  <button className="task-delete" onClick={() => deleteTask(task.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
