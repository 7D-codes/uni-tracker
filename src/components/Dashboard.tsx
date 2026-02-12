interface StatsProps {
  stats: {
    total: number;
    researching: number;
    planning: number;
    applied: number;
    accepted: number;
    rejected: number;
  };
}

export function Dashboard({ stats }: StatsProps) {
  return (
    <div className="dashboard">
      <h2>Application Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Universities</div>
        </div>
        
        <div className="stat-card accepted">
          <div className="stat-number">{stats.accepted}</div>
          <div className="stat-label">Accepted ✅</div>
        </div>
        
        <div className="stat-card applied">
          <div className="stat-number">{stats.applied}</div>
          <div className="stat-label">Applied 📝</div>
        </div>
        
        <div className="stat-card planning">
          <div className="stat-number">{stats.planning}</div>
          <div className="stat-label">Planning 📋</div>
        </div>
        
        <div className="stat-card researching">
          <div className="stat-number">{stats.researching}</div>
          <div className="stat-label">Researching 🔍</div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected ❌</div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <ul>
          <li>🚨 Check upcoming deadlines (next 30 days)</li>
          <li>✅ Complete UoL registration by March 30</li>
          <li>📝 Start SAT preparation for Fall 2027 applications</li>
          <li>📚 Research Oxford and KAUST deadlines</li>
        </ul>
      </div>
    </div>
  );
}
