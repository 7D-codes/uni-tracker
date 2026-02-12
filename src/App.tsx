import { useState, useEffect } from 'react';
import './App.css';
import { UniversityList } from './components/UniversityList';
import { Dashboard } from './components/Dashboard';
import { AddUniversity } from './components/AddUniversity';
import { Tasks } from './components/Tasks';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({
    total: 0,
    researching: 0,
    planning: 0,
    applied: 0,
    accepted: 0,
    rejected: 0,
  });
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/universities`);
      const data = await res.json();
      setUniversities(data);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUniversities();
  }, []);

  const refresh = () => {
    fetchStats();
    fetchUniversities();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎓 University Application Tracker</h1>
        <nav className="nav">
          <button 
            className={view === 'dashboard' ? 'active' : ''} 
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={view === 'universities' ? 'active' : ''} 
            onClick={() => setView('universities')}
          >
            Universities ({stats.total})
          </button>
          <button 
            className={view === 'tasks' ? 'active' : ''} 
            onClick={() => setView('tasks')}
          >
            Tasks
          </button>
          <button 
            className={view === 'add' ? 'active' : ''} 
            onClick={() => setView('add')}
          >
            + Add Uni
          </button>
        </nav>
      </header>

      <main className="main">
        {view === 'dashboard' && <Dashboard stats={stats} />}
        {view === 'universities' && (
          <UniversityList 
            universities={universities} 
            loading={loading}
            onUpdate={refresh}
          />
        )}
        {view === 'tasks' && <Tasks />}
        {view === 'add' && <AddUniversity onAdd={refresh} />}
      </main>
    </div>
  );
}

export default App;
