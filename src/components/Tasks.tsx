import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
  });

  return (
    <div className="tasks">
      <h2>Tasks & Deadlines</h2>
      
      <form onSubmit={addTask} className="add-task-form">
        <input
          placeholder="Task title..."
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <input
          placeholder="Description..."
          value={newTask.description}
          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
        />
        
        <select
          value={newTask.priority}
          onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
        >
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        
        <button type="submit">Add Task</button>
      </form>

      <div className="tasks-list">
        {sortedTasks.map(task => {
          const daysUntil = getDaysUntil(task.dueDate);
          const isOverdue = daysUntil !== null && daysUntil < 0 && task.status !== 'done';
          
          return (
            <div 
              key={task.id} 
              className={`task-item ${task.status} ${isOverdue ? 'overdue' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => toggleTask(task)}
              />
              
              <div className="task-content">
                <span className={`task-title ${task.status === 'done' ? 'done' : ''}`}>
                  {task.title}
                </span>
                
                {task.description && (
                  <span className="task-desc">{task.description}</span>
                )}
                
                {task.dueDate && daysUntil !== null && (
                  <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                    {isOverdue ? '🚨 ' : ''}
                    {daysUntil === 0 ? 'Due today' : 
                     daysUntil === 1 ? 'Due tomorrow' :
                     daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                     `${daysUntil} days left`}
                  </span>
                )}
              </div>
              
              <button 
                className="delete-task"
                onClick={() => deleteTask(task.id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
