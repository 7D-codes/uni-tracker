import { useState, useEffect } from 'react';
import './UniversityDetail.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Requirement {
  type: string;
  required: boolean;
  minScore?: number;
  avgScore?: number;
  count?: number;
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
  status: string;
  priority: string;
  notes?: string;
  requirements?: Requirement[];
  satMin?: number;
  satAvg?: number;
  ieltsMin?: number;
  ieltsAvg?: number;
  toeflMin?: number;
  gpaMin?: number;
  essaysRequired?: number;
  recLettersRequired?: number;
  interviewRequired?: number;
  applicationUrl?: string;
}

interface Profile {
  id: number;
  satTarget?: number;
  satActual?: number;
  ieltsScore?: number;
  toeflScore?: number;
  transcriptStatus: string;
  transcriptCount: number;
  recommendationsCount: number;
  statementStatus: string;
  interviewStatus: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  universityId?: number;
}

interface Props {
  universityId: number;
  onClose: () => void;
  onEditProfile: () => void;
  onUpdate: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  researching: { label: 'Researching', color: '#a39e99', icon: '🔍' },
  planning: { label: 'Planning', color: '#e6c86e', icon: '📋' },
  applied: { label: 'Applied', color: '#7aaed1', icon: '📝' },
  accepted: { label: 'Accepted', color: '#7eb77f', icon: '✓' },
  rejected: { label: 'Rejected', color: '#d67070', icon: '✗' },
  waitlisted: { label: 'Waitlisted', color: '#a889bd', icon: '⏳' },
};

export function UniversityDetail({ universityId, onClose, onEditProfile, onUpdate }: Props) {
  const [university, setUniversity] = useState<University | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements'>('overview');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setAnimateIn(true), 50);
    fetchData();
  }, [universityId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uniRes, profileRes, tasksRes] = await Promise.all([
        fetch(`${API_URL}/universities/${universityId}`),
        fetch(`${API_URL}/profile`),
        fetch(`${API_URL}/tasks?university_id=${universityId}`),
      ]);

      const uniData = await uniRes.json();
      const profileData = await profileRes.json();
      const tasksData = await tasksRes.json();

      setUniversity(uniData);
      setProfile(profileData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch university details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(onClose, 300);
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (days < 0) return { text: formatted, days, status: 'passed' as const };
    if (days <= 7) return { text: formatted, days, status: 'urgent' as const };
    if (days <= 30) return { text: formatted, days, status: 'soon' as const };
    return { text: formatted, days, status: 'normal' as const };
  };

  const getRequirementStatus = (type: string, uniValue?: number, userValue?: number, count?: number) => {
    if (!uniValue && !count) return { status: 'not-required' as const, label: 'Not Required' };
    
    if (count !== undefined) {
      const userCount = userValue || 0;
      if (userCount >= count) return { status: 'complete' as const, label: 'Complete', percentage: 100 };
      if (userCount > 0) return { status: 'partial' as const, label: 'Partial', percentage: (userCount / count) * 100 };
      return { status: 'missing' as const, label: 'Missing', percentage: 0 };
    }

    if (!userValue) return { status: 'missing' as const, label: 'Missing', percentage: 0 };
    if (uniValue && userValue >= uniValue) return { status: 'complete' as const, label: 'Meets Requirement', percentage: 100 };
    return { status: 'partial' as const, label: 'Below Target', percentage: (userValue / (uniValue || 1)) * 100 };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return '#7eb77f';
      case 'partial': return '#e6c86e';
      case 'missing': return '#d67070';
      default: return '#6b6560';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'complete': return 'rgba(126, 183, 127, 0.15)';
      case 'partial': return 'rgba(230, 200, 110, 0.15)';
      case 'missing': return 'rgba(214, 112, 112, 0.15)';
      default: return 'rgba(107, 101, 96, 0.15)';
    }
  };

  if (loading) {
    return (
      <div className={`uni-detail-overlay ${animateIn ? 'visible' : ''}`}>
        <div className="uni-detail-modal loading-state">
          <div className="uni-detail-loading">
            <div className="uni-detail-spinner" />
            <span>Loading university details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!university || !profile) {
    return (
      <div className={`uni-detail-overlay ${animateIn ? 'visible' : ''}`}>
        <div className="uni-detail-modal">
          <div className="uni-detail-error">
            <p>Failed to load university details</p>
            <button className="udi-btn-primary" onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const earlyDeadline = formatDeadline(university.deadlineEarly);
  const regularDeadline = formatDeadline(university.deadlineRegular);

  // Calculate requirement statuses
  const satStatus = getRequirementStatus('SAT', university.satMin || university.satAvg, profile.satActual);
  const ieltsStatus = getRequirementStatus('IELTS', university.ieltsMin || university.ieltsAvg, profile.ieltsScore);
  const toeflStatus = getRequirementStatus('TOEFL', university.toeflMin, profile.toeflScore);
  const transcriptStatus = getRequirementStatus('transcript', undefined, profile.transcriptCount, university.gpaMin ? 1 : 0);
  const recsStatus = getRequirementStatus('recs', undefined, profile.recommendationsCount, university.recLettersRequired || 0);
  const essaysStatus = getRequirementStatus('essays', undefined, profile.statementStatus === 'complete' ? 1 : 0, university.essaysRequired || 0);
  const interviewStatus = getRequirementStatus('interview', undefined, profile.interviewStatus === 'scheduled' || profile.interviewStatus === 'completed' ? 1 : 0, university.interviewRequired || 0);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className={`uni-detail-overlay ${animateIn ? 'visible' : ''}`} onClick={handleClose}>
      <div className={`uni-detail-modal ${animateIn ? 'slide-in' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="udi-close-btn" onClick={handleClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Section */}
        <div className="udi-hero">
          <div className="udi-hero-bg">
            <div className="udi-hero-gradient" />
            <div className="udi-hero-pattern" />
          </div>
          
          <div className="udi-hero-content">
            <div className="udi-hero-meta">
              {university.ranking && (
                <div className={`udi-ranking ${university.ranking <= 10 ? 'top-tier' : ''}`}>
                  <span className="udi-ranking-label">Rank</span>
                  <span className="udi-ranking-value">#{university.ranking}</span>
                </div>
              )}
              <div 
                className="udi-status-badge"
                style={{ 
                  backgroundColor: `${statusConfig[university.status]?.color}20`,
                  color: statusConfig[university.status]?.color,
                  borderColor: `${statusConfig[university.status]?.color}40`
                }}
              >
                <span>{statusConfig[university.status]?.icon}</span>
                {statusConfig[university.status]?.label}
              </div>
            </div>

            <h1 className="udi-title">{university.name}</h1>
            <p className="udi-subtitle">
              {university.country} · {university.program}
            </p>
            
            <div className="udi-major">
              <span className="udi-major-label">Field of Study</span>
              <span className="udi-major-value">{university.major}</span>
            </div>
          </div>

          {/* Priority & Quick Stats */}
          <div className="udi-quick-stats">
            <div className="udi-stat-item">
              <span className="udi-stat-label">Priority</span>
              <div className={`udi-priority-badge ${university.priority}`}>
                <span className="udi-priority-dot" />
                {university.priority.charAt(0).toUpperCase() + university.priority.slice(1)}
              </div>
            </div>
            <div className="udi-stat-item">
              <span className="udi-stat-label">Tasks</span>
              <span className="udi-stat-value">{tasks.length}</span>
            </div>
            <div className="udi-stat-item">
              <span className="udi-stat-label">Pending</span>
              <span className="udi-stat-value" style={{ color: pendingTasks.length > 0 ? '#e6c86e' : '#7eb77f' }}>
                {pendingTasks.length}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="udi-tabs">
          <button 
            className={`udi-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            Overview
          </button>
          <button 
            className={`udi-tab ${activeTab === 'requirements' ? 'active' : ''}`}
            onClick={() => setActiveTab('requirements')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Requirements
            <span className="udi-tab-badge">
              {[satStatus, ieltsStatus, toeflStatus, recsStatus, essaysStatus].filter(s => s.status === 'missing').length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="udi-content">
          {activeTab === 'overview' ? (
            <div className="udi-overview">
              {/* Deadlines Section */}
              <div className="udi-section udi-deadlines">
                <h3 className="udi-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Application Deadlines
                </h3>
                
                <div className="udi-deadlines-grid">
                  {earlyDeadline && (
                    <div className={`udi-deadline-card ${earlyDeadline.status}`}>
                      <div className="udi-deadline-type">Early Decision</div>
                      <div className="udi-deadline-date">{earlyDeadline.text}</div>
                      {earlyDeadline.days > 0 && (
                        <div className="udi-deadline-countdown">
                          <span className="udi-countdown-number">{earlyDeadline.days}</span>
                          <span className="udi-countdown-label">days remaining</span>
                        </div>
                      )}
                      {earlyDeadline.days <= 0 && (
                        <div className="udi-deadline-status">Deadline passed</div>
                      )}
                    </div>
                  )}
                  
                  {regularDeadline && (
                    <div className={`udi-deadline-card ${regularDeadline.status}`}>
                      <div className="udi-deadline-type">Regular Decision</div>
                      <div className="udi-deadline-date">{regularDeadline.text}</div>
                      {regularDeadline.days > 0 && (
                        <div className="udi-deadline-countdown">
                          <span className="udi-countdown-number">{regularDeadline.days}</span>
                          <span className="udi-countdown-label">days remaining</span>
                        </div>
                      )}
                      {regularDeadline.days <= 0 && (
                        <div className="udi-deadline-status">Deadline passed</div>
                      )}
                    </div>
                  )}
                  
                  {!earlyDeadline && !regularDeadline && (
                    <div className="udi-deadline-empty">
                      No deadlines set. Edit the university to add deadlines.
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Section */}
              <div className="udi-section udi-tasks">
                <div className="udi-section-header">
                  <h3 className="udi-section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                    Related Tasks
                  </h3>
                  <span className="udi-task-count">{tasks.length} total</span>
                </div>

                {tasks.length === 0 ? (
                  <div className="udi-tasks-empty">
                    <p>No tasks linked to this university yet.</p>
                    <p className="udi-empty-hint">Tasks will appear here when you add them or when they're auto-generated based on requirements.</p>
                  </div>
                ) : (
                  <div className="udi-tasks-list">
                    {pendingTasks.map((task, index) => (
                      <div 
                        key={task.id} 
                        className="udi-task-item"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`udi-task-status ${task.status}`} />
                        <div className="udi-task-content">
                          <div className="udi-task-title">{task.title}</div>
                          {task.description && (
                            <div className="udi-task-desc">{task.description}</div>
                          )}
                          {task.dueDate && (
                            <div className="udi-task-due">
                              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {completedTasks.length > 0 && (
                      <div className="udi-tasks-completed-header">
                        Completed ({completedTasks.length})
                      </div>
                    )}
                    
                    {completedTasks.map((task, index) => (
                      <div 
                        key={task.id} 
                        className="udi-task-item completed"
                        style={{ animationDelay: `${(pendingTasks.length + index) * 50}ms` }}
                      >
                        <div className={`udi-task-status ${task.status}`} />
                        <div className="udi-task-content">
                          <div className="udi-task-title">{task.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {university.notes && (
                <div className="udi-section udi-notes">
                  <h3 className="udi-section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Notes
                  </h3>
                  <div className="udi-notes-content">{university.notes}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="udi-requirements">
              <div className="udi-req-header">
                <h3 className="udi-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  Requirement Matching
                </h3>
                <p className="udi-req-subtitle">
                  Compare university requirements with your profile. Click any item to update your profile.
                </p>
              </div>

              <div className="udi-req-grid">
                {/* SAT Requirement */}
                {(university.satMin || university.satAvg) && (
                  <div 
                    className="udi-req-card"
                    onClick={onEditProfile}
                    style={{ 
                      borderColor: getStatusColor(satStatus.status),
                      background: getStatusBg(satStatus.status)
                    }}
                  >
                    <div className="udi-req-icon">📊</div>
                    <div className="udi-req-info">
                      <div className="udi-req-name">SAT Score</div>
                      <div className="udi-req-details">
                        {university.satMin && <span>Min: {university.satMin}</span>}
                        {university.satAvg && <span>Avg: {university.satAvg}</span>}
                      </div>
                    </div>
                    <div className="udi-req-user">
                      {profile.satActual ? (
                        <div className="udi-req-score" style={{ color: getStatusColor(satStatus.status) }}>
                          {profile.satActual}
                        </div>
                      ) : (
                        <div className="udi-req-missing">Not set</div>
                      )}
                      <div 
                        className="udi-req-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(satStatus.status),
                          color: '#0d0d0d'
                        }}
                      >
                        {satStatus.label}
                      </div>
                    </div>
                    <div className="udi-req-edit-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                )}

                {/* IELTS Requirement */}
                {(university.ieltsMin || university.ieltsAvg) && (
                  <div 
                    className="udi-req-card"
                    onClick={onEditProfile}
                    style={{ 
                      borderColor: getStatusColor(ieltsStatus.status),
                      background: getStatusBg(ieltsStatus.status)
                    }}
                  >
                    <div className="udi-req-icon">🌍</div>
                    <div className="udi-req-info">
                      <div className="udi-req-name">IELTS Score</div>
                      <div className="udi-req-details">
                        {university.ieltsMin && <span>Min: {university.ieltsMin}</span>}
                        {university.ieltsAvg && <span>Avg: {university.ieltsAvg}</span>}
                      </div>
                    </div>
                    <div className="udi-req-user">
                      {profile.ieltsScore ? (
                        <div className="udi-req-score" style={{ color: getStatusColor(ieltsStatus.status) }}>
                          {profile.ieltsScore}
                        </div>
                      ) : (
                        <div className="udi-req-missing">Not set</div>
                      )}
                      <div 
                        className="udi-req-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(ieltsStatus.status),
                          color: '#0d0d0d'
                        }}
                      >
                        {ieltsStatus.label}
                      </div>
                    </div>
                    <div className="udi-req-edit-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                )}

                {/* TOEFL Requirement */}
                {university.toeflMin && (
                  <div 
                    className="udi-req-card"
                    onClick={onEditProfile}
                    style={{ 
                      borderColor: getStatusColor(toeflStatus.status),
                      background: getStatusBg(toeflStatus.status)
                    }}
                  >
                    <div className="udi-req-icon">📝</div>
                    <div className="udi-req-info">
                      <div className="udi-req-name">TOEFL Score</div>
                      <div className="udi-req-details">
                        <span>Min: {university.toeflMin}</span>
                      </div>
                    </div>
                    <div className="udi-req-user">
                      {profile.toeflScore ? (
                        <div className="udi-req-score" style={{ color: getStatusColor(toeflStatus.status) }}>
                          {profile.toeflScore}
                        </div>
                      ) : (
                        <div className="udi-req-missing">Not set</div>
                      )}
                      <div 
                        className="udi-req-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(toeflStatus.status),
                          color: '#0d0d0d'
                        }}
                      >
                        {toeflStatus.label}
                      </div>
                    </div>
                    <div className="udi-req-edit-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                )}

                {/* Transcripts */}
                {university.gpaMin && (
                  <div 
                    className="udi-req-card"
                    onClick={onEditProfile}
                    style={{ 
                      borderColor: getStatusColor(transcriptStatus.status),
                      background: getStatusBg(transcriptStatus.status)
                    }}
                  >
                    <div className="udi-req-icon">📄</div>
                    <div className="udi-req-info">
                      <div className="udi-req-name">Transcripts</div>
                      <div className="udi-req-details">
                        <span>GPA Min: {university.gpaMin}</span>
                      </div>
                    </div>
                    <div className="udi-req-user">
                      <div className="udi-req-score" style={{ color: getStatusColor(transcriptStatus.status) }}>
                        {profile.transcriptCount}
                      </div>
                      <div 
                        className="udi-req-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(transcriptStatus.status),
                          color: '#0d0d0d'
                        }}
                      >
                        {transcriptStatus.label}
                      </div>
                    </div>
                    <div className="udi-req-edit-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {university.recLettersRequired && university.recLettersRequired > 0 && (
                  <div 
                    className="udi-req-card"
                    onClick={onEditProfile}
                    style={{ 
                      borderColor: getStatusColor(recsStatus.status),
                      background: getStatusBg(recsStatus.status)
                    }}
                  >
                    <div className="udi-req-icon">💌</div>
                    <div className="udi-req-info">
                      <div className="udi-req-name">Recommendations</div>
                      <div className="udi-req-details">
                        <span>Need: {university.recLettersRequired}</span>
                      </div>
                    </div>
                    <div className="udi-req-user">
                      <div className="udi-req-score" style={{ color: getStatusColor(recsStatus.status) }}>
                        {profile.recommendationsCount}
                      </div>
                      <div 
                        className="udi-req-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(recsStatus.status),
                          color: '#0d0d0d'
                        }}
                      >
                        {recsStatus.label}
                      </div>
                    </div>
                    <div className="udi-req-edit-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                )}

                {/* Essays */}
                {university.essaysRequired && university.essaysRequired > 0 && (
                  <div 
                    className="udi-req-card"
                    onClick={onEditProfile}
                    style={{ 
                      borderColor: getStatusColor(essaysStatus.status),
                      background: getStatusBg(essaysStatus.status)
                    }}
                  >
                    <div className="udi-req-icon">✍️</div>
                    <div className="udi-req-info">
                      <div className="udi-req-name">Essays / Personal Statement</div>
                      <div className="udi-req-details">
                        <span>Required: {university.essaysRequired === 1 ? 'Yes' : `${university.essaysRequired} essays`}</span>
                      </div>
                    </div>
                    <div className="udi-req-user">
                      <div className="udi-req-score" style={{ color: getStatusColor(essaysStatus.status) }}>
                        {profile.statementStatus === 'complete' ? '✓' : profile.statementStatus === 'draft' ? 'Draft' : '—'}
                      </div>
                      <div 
                        className="udi-req-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(essaysStatus.status),
                          color: '#0d0d0d'
                        }}
                      >
                        {essaysStatus.label}
                      </div>
                    </div>
                    <div className="udi-req-edit-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                )}

                {/* Interview */}
                {university.interviewRequired && university.interviewRequired > 0 && (
                  <div 
                    className="udi-req-card"
                    onClick={onEditProfile}
                    style={{ 
                      borderColor: getStatusColor(interviewStatus.status),
                      background: getStatusBg(interviewStatus.status)
                    }}
                  >
                    <div className="udi-req-icon">🎤</div>
                    <div className="udi-req-info">
                      <div className="udi-req-name">Interview</div>
                      <div className="udi-req-details">
                        <span>Required: Yes</span>
                      </div>
                    </div>
                    <div className="udi-req-user">
                      <div className="udi-req-score" style={{ color: getStatusColor(interviewStatus.status) }}>
                        {profile.interviewStatus === 'completed' ? 'Done' : 
                         profile.interviewStatus === 'scheduled' ? 'Scheduled' : '—'}
                      </div>
                      <div 
                        className="udi-req-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(interviewStatus.status),
                          color: '#0d0d0d'
                        }}
                      >
                        {interviewStatus.label}
                      </div>
                    </div>
                    <div className="udi-req-edit-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="udi-footer">
          {university.applicationUrl && (
            <a 
              href={university.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="udi-btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <path d="M15 3h6v6M10 14L21 3" />
              </svg>
              Visit Application Portal
            </a>
          )}
          <button className="udi-btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
