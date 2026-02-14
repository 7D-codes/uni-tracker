import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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

interface Props {
  universities: University[];
  loading: boolean;
  onUpdate: () => void;
}

const statusConfig: Record<string, { label: string; icon: string }> = {
  researching: { label: 'Researching', icon: '🔍' },
  planning: { label: 'Planning', icon: '📋' },
  applied: { label: 'Applied', icon: '📝' },
  accepted: { label: 'Accepted', icon: '✓' },
  rejected: { label: 'Rejected', icon: '✗' },
  waitlisted: { label: 'Waitlisted', icon: '⏳' },
};

export function UniversityList({ universities, loading, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<University>>({});
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (uni: University) => {
    setEditingId(uni.id);
    setEditForm(uni);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      await fetch(`${API_URL}/universities/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this university?')) return;

    try {
      await fetch(`${API_URL}/universities/${id}`, { method: 'DELETE' });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Filter and search universities
  const filteredUniversities = universities.filter(uni => {
    const matchesFilter = filter === 'all' || uni.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.major.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get counts for filter tabs
  const statusCounts = universities.reduce((acc, uni) => {
    acc[uni.status] = (acc[uni.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (days < 0) return { text: formatted, status: 'passed' };
    if (days <= 7) return { text: `${formatted} (${days}d)`, status: 'urgent' };
    if (days <= 30) return { text: `${formatted} (${days}d)`, status: 'soon' };
    return { text: formatted, status: 'normal' };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="university-list">
      {/* Header with filters and search */}
      <div className="list-header">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({universities.length})
          </button>
          <button
            className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({statusCounts.accepted || 0})
          </button>
          <button
            className={`filter-tab ${filter === 'applied' ? 'active' : ''}`}
            onClick={() => setFilter('applied')}
          >
            Applied ({statusCounts.applied || 0})
          </button>
          <button
            className={`filter-tab ${filter === 'planning' ? 'active' : ''}`}
            onClick={() => setFilter('planning')}
          >
            Planning ({statusCounts.planning || 0})
          </button>
          <button
            className={`filter-tab ${filter === 'researching' ? 'active' : ''}`}
            onClick={() => setFilter('researching')}
          >
            Research ({statusCounts.researching || 0})
          </button>
        </div>

        <div className="search-box">
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search universities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Universities Grid */}
      {filteredUniversities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <h3 className="empty-state-title">No universities found</h3>
          <p className="empty-state-text">
            {searchQuery ? 'Try adjusting your search terms' : 'Add your first university to get started'}
          </p>
        </div>
      ) : (
        <div className="universities-grid">
          {filteredUniversities.map((uni) => (
            <div key={uni.id} className="university-card">
              {editingId === uni.id ? (
                /* Edit Form */
                <div className="edit-form">
                  <div className="form-group">
                    <label className="form-label">University Name</label>
                    <input
                      className="form-input"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="University Name"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={editForm.status || ''}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="researching">Researching</option>
                        <option value="planning">Planning</option>
                        <option value="applied">Applied</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={editForm.priority || ''}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Regular Deadline</label>
                    <input
                      className="form-input"
                      type="date"
                      value={editForm.deadlineRegular || ''}
                      onChange={(e) => setEditForm({ ...editForm, deadlineRegular: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-textarea"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Notes"
                      rows={3}
                    />
                  </div>

                  <div className="edit-actions">
                    <button className="btn btn-primary" onClick={handleSave}>
                      Save Changes
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Card */
                <>
                  <div className="uni-card-header">
                    <div className={`uni-ranking ${uni.ranking && uni.ranking <= 10 ? 'top-10' : ''}`}>
                      {uni.ranking ? `#${uni.ranking}` : '—'}
                    </div>
                    <div className="uni-info">
                      <h3 className="uni-name">{uni.name}</h3>
                      <div className="uni-location">
                        <span className="priority-indicator" style={{
                          width: '6px',
                          height: '6px',
                          background: uni.priority === 'high' ? 'var(--accent-danger)' :
                                     uni.priority === 'medium' ? 'var(--accent-warning)' :
                                     'var(--accent-success)'
                        }} />
                        {uni.country} · {uni.program}
                      </div>
                    </div>
                    <div className={`uni-status-badge ${uni.status}`}>
                      {statusConfig[uni.status]?.label || uni.status}
                    </div>
                  </div>

                  <div className="uni-card-body">
                    <div className="uni-details-grid">
                      <div className="uni-detail">
                        <span className="uni-detail-label">Major</span>
                        <span className="uni-detail-value">{uni.major}</span>
                      </div>
                      <div className="uni-detail">
                        <span className="uni-detail-label">Priority</span>
                        <span className="uni-detail-value" style={{
                          color: uni.priority === 'high' ? 'var(--accent-danger)' :
                                 uni.priority === 'medium' ? 'var(--accent-warning)' :
                                 'var(--accent-success)'
                        }}>
                          {uni.priority.charAt(0).toUpperCase() + uni.priority.slice(1)}
                        </span>
                      </div>
                      {uni.deadlineRegular && (
                        <div className="uni-detail">
                          <span className="uni-detail-label">Deadline</span>
                          <span className="uni-detail-value" style={{
                            color: formatDeadline(uni.deadlineRegular)?.status === 'urgent' ? 'var(--accent-danger)' :
                                   formatDeadline(uni.deadlineRegular)?.status === 'soon' ? 'var(--accent-warning)' :
                                   'inherit'
                          }}>
                            {formatDeadline(uni.deadlineRegular)?.text}
                          </span>
                        </div>
                      )}
                      {uni.applicationPortal && (
                        <div className="uni-detail">
                          <span className="uni-detail-label">Portal</span>
                          <span className="uni-detail-value">{uni.applicationPortal}</span>
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    {(uni.satAvg || uni.ieltsAvg || uni.toeflMin || uni.essaysRequired) && (
                      <div className="uni-requirements">
                        {uni.satAvg && (
                          <div className="requirement-tag">
                            <span className="label">SAT</span> {uni.satAvg}
                          </div>
                        )}
                        {uni.ieltsAvg && (
                          <div className="requirement-tag">
                            <span className="label">IELTS</span> {uni.ieltsAvg}
                          </div>
                        )}
                        {uni.toeflMin && (
                          <div className="requirement-tag">
                            <span className="label">TOEFL</span> {uni.toeflMin}+
                          </div>
                        )}
                        {uni.essaysRequired && uni.essaysRequired > 0 && (
                          <div className="requirement-tag">
                            <span className="label">Essays</span> {uni.essaysRequired}
                          </div>
                        )}
                        {uni.recLettersRequired && uni.recLettersRequired > 0 && (
                          <div className="requirement-tag">
                            <span className="label">Recs</span> {uni.recLettersRequired}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {uni.notes && (
                      <div className="uni-notes">{uni.notes}</div>
                    )}
                  </div>

                  <div className="uni-card-footer">
                    <button className="btn btn-secondary" onClick={() => handleEdit(uni)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    {uni.applicationUrl && (
                      <a
                        href={uni.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <path d="M15 3h6v6M10 14L21 3" />
                        </svg>
                        Apply
                      </a>
                    )}
                    <button className="btn btn-danger" onClick={() => handleDelete(uni.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
