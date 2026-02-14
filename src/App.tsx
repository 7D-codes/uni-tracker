import { useState, useEffect } from 'react';
import './App.css';
import { UniversityList } from './components/UniversityList';
import { Dashboard } from './components/Dashboard';
import { AddUniversity } from './components/AddUniversity';
import { Tasks } from './components/Tasks';

const API_URL = '/api';

type View = 'dashboard' | 'universities' | 'tasks' | 'add' | 'settings';

interface Stats {
  total: number;
  researching: number;
  planning: number;
  applied: number;
  accepted: number;
  rejected: number;
}

interface University {
  id: number;
  name: string;
  country: string;
  program: string;
  major: string;
  ranking?: number;
  deadlineEarly?: string;
  deadlineRegular?: string;
  deadlineTransfer?: string;
  satMin?: number;
  satAvg?: number;
  ieltsMin?: number;
  ieltsAvg?: number;
  toeflMin?: number;
  gpaMin?: number;
  applicationPortal?: string;
  applicationUrl?: string;
  essaysRequired?: number;
  recLettersRequired?: number;
  interviewRequired?: number;
  status: string;
  priority: string;
  notes?: string;
  applicationSubmitted?: string;
  decisionReceived?: string;
  decisionResult?: string;
}

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    researching: 0,
    planning: 0,
    applied: 0,
    accepted: 0,
    rejected: 0,
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavClick = (newView: View) => {
    setView(newView);
    setMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'universities': return 'Universities';
      case 'tasks': return 'Tasks & Deadlines';
      case 'add': return 'Add University';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (view) {
      case 'dashboard': return 'Track your application journey at a glance';
      case 'universities': return `Managing ${stats.total} universities across your application list`;
      case 'tasks': return 'Stay on top of deadlines and requirements';
      case 'add': return 'Add a new university to your tracker';
      case 'settings': return 'Customize your experience';
      default: return '';
    }
  };

  return (
    <div className="app">
      <div className="app-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="logo-text">
                UniTracker
                <span>Application Manager</span>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">Overview</div>
              <button
                className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                </span>
                Dashboard
              </button>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">Manage</div>
              <button
                className={`nav-item ${view === 'universities' ? 'active' : ''}`}
                onClick={() => handleNavClick('universities')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                Universities
                <span className="nav-badge">{stats.total}</span>
              </button>
              <button
                className={`nav-item ${view === 'tasks' ? 'active' : ''}`}
                onClick={() => handleNavClick('tasks')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </span>
                Tasks
              </button>
              <button
                className={`nav-item ${view === 'add' ? 'active' : ''}`}
                onClick={() => handleNavClick('add')}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8m-4-4h8" />
                  </svg>
                </span>
                Add University
              </button>
            </div>
          </nav>

          {/* Sidebar Stats */}
          <div className="sidebar-stats">
            <div className="sidebar-stats-grid">
              <div className="mini-stat accepted">
                <div className="mini-stat-value">{stats.accepted}</div>
                <div className="mini-stat-label">Accepted</div>
              </div>
              <div className="mini-stat applied">
                <div className="mini-stat-value">{stats.applied}</div>
                <div className="mini-stat-label">Applied</div>
              </div>
              <div className="mini-stat planning">
                <div className="mini-stat-value">{stats.planning}</div>
                <div className="mini-stat-label">Planning</div>
              </div>
              <div className="mini-stat researching">
                <div className="mini-stat-value">{stats.researching}</div>
                <div className="mini-stat-label">Research</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Mobile Header */}
          <div className="mobile-header" style={{ display: 'none' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className="logo-text" style={{ fontSize: '1rem' }}>UniTracker</div>
          </div>

          {/* Page Header */}
          <header className="page-header">
            <h1 className="page-title">{getPageTitle()}</h1>
            <p className="page-subtitle">{getPageSubtitle()}</p>
          </header>

          {/* Page Content */}
          <div className="page-content">
            {view === 'dashboard' && (
              <Dashboard
                stats={stats}
                universities={universities}
                onNavigate={handleNavClick}
              />
            )}
            {view === 'universities' && (
              <UniversityList
                universities={universities}
                loading={loading}
                onUpdate={refresh}
              />
            )}
            {view === 'tasks' && <Tasks />}
            {view === 'add' && <AddUniversity onAdd={() => { refresh(); setView('universities'); }} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
