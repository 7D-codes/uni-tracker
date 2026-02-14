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
  status: string;
  priority: string;
  notes?: string;
}

interface StatsProps {
  stats: {
    total: number;
    researching: number;
    planning: number;
    applied: number;
    accepted: number;
    rejected: number;
  };
  universities: University[];
  onNavigate: (view: 'dashboard' | 'universities' | 'tasks' | 'add' | 'settings') => void;
}

export function Dashboard({ stats, universities, onNavigate }: StatsProps) {
  // Get upcoming deadlines
  const getUpcomingDeadlines = () => {
    const now = new Date();
    const deadlines: { uni: University; date: Date; type: string }[] = [];

    universities.forEach(uni => {
      if (uni.deadlineEarly) {
        const d = new Date(uni.deadlineEarly);
        if (d > now) deadlines.push({ uni, date: d, type: 'Early Decision' });
      }
      if (uni.deadlineRegular) {
        const d = new Date(uni.deadlineRegular);
        if (d > now) deadlines.push({ uni, date: d, type: 'Regular Decision' });
      }
      if (uni.deadlineTransfer) {
        const d = new Date(uni.deadlineTransfer);
        if (d > now) deadlines.push({ uni, date: d, type: 'Transfer' });
      }
    });

    return deadlines
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  const formatDate = (date: Date) => {
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    };
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.applied + stats.accepted) / stats.total) * 100);
  };

  // Get high priority universities that need attention
  const getHighPriorityUnis = () => {
    return universities
      .filter(uni => uni.priority === 'high' && uni.status !== 'accepted' && uni.status !== 'rejected')
      .slice(0, 3);
  };

  const highPriorityUnis = getHighPriorityUnis();

  return (
    <div className="dashboard">
      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Universities</div>
        </div>

        <div className="stat-card accepted">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <div className="stat-number">{stats.accepted}</div>
          <div className="stat-label">Accepted</div>
          {stats.accepted > 0 && (
            <div className="stat-change up">Congratulations!</div>
          )}
        </div>

        <div className="stat-card applied">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <div className="stat-number">{stats.applied}</div>
          <div className="stat-label">Applied</div>
        </div>

        <div className="stat-card planning">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div className="stat-number">{stats.planning}</div>
          <div className="stat-label">Planning</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="dashboard-section" style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <h3 className="section-title">Application Progress</h3>
          <span className="section-action" onClick={() => onNavigate('universities')}>
            View All Universities
          </span>
        </div>
        <div className="section-content" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                height: '8px',
                background: 'var(--bg-elevated)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${getProgressPercentage()}%`,
                  background: 'linear-gradient(90deg, var(--accent-warm), var(--accent-success))',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              fontWeight: 600
            }}>
              {getProgressPercentage()}%
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '2rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            <span><strong style={{ color: 'var(--accent-success)' }}>{stats.accepted + stats.applied}</strong> applications submitted</span>
            <span><strong style={{ color: 'var(--accent-warning)' }}>{stats.planning}</strong> in progress</span>
            <span><strong style={{ color: 'var(--text-secondary)' }}>{stats.researching}</strong> researching</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-sections">
        {/* Upcoming Deadlines */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Upcoming Deadlines</h3>
            <span className="section-action" onClick={() => onNavigate('tasks')}>
              View Tasks
            </span>
          </div>
          <div className="section-content">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline, idx) => {
                const { day, month } = formatDate(deadline.date);
                const daysUntil = getDaysUntil(deadline.date);

                return (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-date">
                      <div className="timeline-day">{day}</div>
                      <div className="timeline-month">{month}</div>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{deadline.uni.name}</div>
                      <div className="timeline-subtitle">{deadline.type}</div>
                    </div>
                    <span className={`timeline-badge ${daysUntil <= 7 ? 'urgent' : daysUntil <= 30 ? 'soon' : ''}`}>
                      {daysUntil <= 7 ? `${daysUntil}d left` : `${daysUntil} days`}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.9rem' }}>No upcoming deadlines</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / High Priority */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Priority Focus</h3>
            <span className="section-action" onClick={() => onNavigate('add')}>
              Add University
            </span>
          </div>
          <div className="section-content">
            {highPriorityUnis.length > 0 ? (
              highPriorityUnis.map(uni => (
                <div key={uni.id} className="action-item" onClick={() => onNavigate('universities')}>
                  <div className="action-icon">
                    <div className="priority-indicator high" />
                  </div>
                  <div className="action-text">
                    <div className="action-title">{uni.name}</div>
                    <div className="action-subtitle">
                      {uni.country} · {uni.status.charAt(0).toUpperCase() + uni.status.slice(1)}
                    </div>
                  </div>
                  <span className="action-arrow">→</span>
                </div>
              ))
            ) : null}

            <div className="action-item" onClick={() => onNavigate('add')}>
              <div className="action-icon" style={{ background: 'rgba(232, 168, 124, 0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warm)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8m-4-4h8" />
                </svg>
              </div>
              <div className="action-text">
                <div className="action-title">Add New University</div>
                <div className="action-subtitle">Track another application</div>
              </div>
              <span className="action-arrow">→</span>
            </div>

            <div className="action-item" onClick={() => onNavigate('tasks')}>
              <div className="action-icon" style={{ background: 'rgba(122, 174, 209, 0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-info)" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <div className="action-text">
                <div className="action-title">Manage Tasks</div>
                <div className="action-subtitle">Stay on top of deadlines</div>
              </div>
              <span className="action-arrow">→</span>
            </div>

            <div className="action-item" onClick={() => onNavigate('universities')}>
              <div className="action-icon" style={{ background: 'rgba(126, 183, 127, 0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <div className="action-text">
                <div className="action-title">View All Universities</div>
                <div className="action-subtitle">Browse your full list</div>
              </div>
              <span className="action-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
