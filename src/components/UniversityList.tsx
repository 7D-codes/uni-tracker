import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

const statusColors: Record<string, string> = {
  researching: '#6b7280',
  planning: '#f59e0b',
  applied: '#3b82f6',
  accepted: '#10b981',
  rejected: '#ef4444',
  waitlisted: '#8b5cf6',
};

const priorityLabels: Record<string, string> = {
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🟢 Low',
};

export function UniversityList({ universities, loading, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<University>>({});

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
    if (!confirm('Are you sure?')) return;
    
    try {
      await fetch(`${API_URL}/universities/${id}`, { method: 'DELETE' });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="university-list">
      <h2>Universities ({universities.length})</h2>
      
      <div className="universities-grid">
        {universities.map(uni => (
          <div key={uni.id} className="university-card">
            {editingId === uni.id ? (
              <div className="edit-form">
                <input
                  value={editForm.name || ''}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="University Name"
                />
                <select
                  value={editForm.status || ''}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="researching">Researching</option>
                  <option value="planning">Planning</option>
                  <option value="applied">Applied</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>
                
                <select
                  value={editForm.priority || ''}
                  onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                
                <input
                  value={editForm.deadlineRegular || ''}
                  onChange={e => setEditForm({ ...editForm, deadlineRegular: e.target.value })}
                  placeholder="Regular Deadline (YYYY-MM-DD)"
                />
                
                <textarea
                  value={editForm.notes || ''}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Notes"
                  rows={3}
                />
                
                <div className="edit-actions">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="uni-header">
                  <div className="uni-ranking">#{uni.ranking || '?'}</div>
                  <div className="uni-title">
                    <h3>{uni.name}</h3>
                    <span className="uni-country">{uni.country}</span>
                  </div>
                  <div 
                    className="uni-status"
                    style={{ backgroundColor: statusColors[uni.status] }}
                  >
                    {uni.status}
                  </div>
                </div>
                
                <div className="uni-details">
                  <p><strong>Program:</strong> {uni.program}</p>
                  <p><strong>Major:</strong> {uni.major}</p>
                  <p><strong>Priority:</strong> {priorityLabels[uni.priority]}</p>
                  
                  {uni.deadlineRegular && (
                    <p><strong>Deadline:</strong> {uni.deadlineRegular}</p>
                  )}
                  
                  {uni.satAvg && (
                    <p><strong>SAT Avg:</strong> {uni.satAvg}</p>
                  )}
                  
                  {uni.ieltsAvg && (
                    <p><strong>IELTS Avg:</strong> {uni.ieltsAvg}</p>
                  )}
                  
                  {uni.notes && (
                    <p className="uni-notes">{uni.notes}</p>
                  )}
                </div>
                
                <div className="uni-actions">
                  <button onClick={() => handleEdit(uni)}>Edit</button>
                  <button onClick={() => handleDelete(uni.id)} className="delete">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
