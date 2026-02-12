import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Props {
  onAdd: () => void;
}

export function AddUniversity({ onAdd }: Props) {
  const [form, setForm] = useState({
    name: '',
    country: '',
    program: 'Undergraduate',
    major: 'Computer Science',
    ranking: '',
    deadlineEarly: '',
    deadlineRegular: '',
    deadlineTransfer: '',
    satMin: '',
    satAvg: '',
    ieltsMin: '',
    ieltsAvg: '',
    toeflMin: '',
    gpaMin: '',
    applicationPortal: '',
    applicationUrl: '',
    essaysRequired: '0',
    recLettersRequired: '0',
    interviewRequired: '0',
    status: 'researching',
    priority: 'medium',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch(`${API_URL}/universities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ranking: form.ranking ? Number(form.ranking) : null,
          satMin: form.satMin ? Number(form.satMin) : null,
          satAvg: form.satAvg ? Number(form.satAvg) : null,
          ieltsMin: form.ieltsMin ? Number(form.ieltsMin) : null,
          ieltsAvg: form.ieltsAvg ? Number(form.ieltsAvg) : null,
          toeflMin: form.toeflMin ? Number(form.toeflMin) : null,
          gpaMin: form.gpaMin ? Number(form.gpaMin) : null,
          essaysRequired: Number(form.essaysRequired),
          recLettersRequired: Number(form.recLettersRequired),
          interviewRequired: Number(form.interviewRequired),
        }),
      });
      
      setForm({
        name: '',
        country: '',
        program: 'Undergraduate',
        major: 'Computer Science',
        ranking: '',
        deadlineEarly: '',
        deadlineRegular: '',
        deadlineTransfer: '',
        satMin: '',
        satAvg: '',
        ieltsMin: '',
        ieltsAvg: '',
        toeflMin: '',
        gpaMin: '',
        applicationPortal: '',
        applicationUrl: '',
        essaysRequired: '0',
        recLettersRequired: '0',
        interviewRequired: '0',
        status: 'researching',
        priority: 'medium',
        notes: '',
      });
      
      onAdd();
    } catch (error) {
      console.error('Failed to add university:', error);
    }
  };

  return (
    <div className="add-university">
      <h2>Add New University</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Info</h3>
          <div className="form-row">
            <input
              placeholder="University Name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Country *"
              value={form.country}
              onChange={e => setForm({ ...form, country: e.target.value })}
              required
            />
          </div>
          
          <div className="form-row">
            <input
              placeholder="Program (e.g., Undergraduate) *"
              value={form.program}
              onChange={e => setForm({ ...form, program: e.target.value })}
              required
            />
            <input
              placeholder="Major (e.g., Data Science) *"
              value={form.major}
              onChange={e => setForm({ ...form, major: e.target.value })}
              required
            />
          </div>
          
          <div className="form-row">
            <input
              type="number"
              placeholder="Ranking (e.g., 10)"
              value={form.ranking}
              onChange={e => setForm({ ...form, ranking: e.target.value })}
            />
            
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Deadlines</h3>
          <div className="form-row">
            <input
              type="date"
              value={form.deadlineEarly}
              onChange={e => setForm({ ...form, deadlineEarly: e.target.value })}
            />
            <label>Early Action/Decision</label>
          </div>
          
          <div className="form-row">
            <input
              type="date"
              value={form.deadlineRegular}
              onChange={e => setForm({ ...form, deadlineRegular: e.target.value })}
            />
            <label>Regular Decision</label>
          </div>
          
          <div className="form-row">
            <input
              type="date"
              value={form.deadlineTransfer}
              onChange={e => setForm({ ...form, deadlineTransfer: e.target.value })}
            />
            <label>Transfer Deadline</label>
          </div>
        </div>

        <div className="form-section">
          <h3>Requirements</h3>
          <div className="form-row">
            <input
              type="number"
              placeholder="SAT Min"
              value={form.satMin}
              onChange={e => setForm({ ...form, satMin: e.target.value })}
            />
            <input
              type="number"
              placeholder="SAT Avg"
              value={form.satAvg}
              onChange={e => setForm({ ...form, satAvg: e.target.value })}
            />
          </div>
          
          <div className="form-row">
            <input
              type="number"
              step="0.1"
              placeholder="IELTS Min"
              value={form.ieltsMin}
              onChange={e => setForm({ ...form, ieltsMin: e.target.value })}
            />
            <input
              type="number"
              step="0.1"
              placeholder="IELTS Avg"
              value={form.ieltsAvg}
              onChange={e => setForm({ ...form, ieltsAvg: e.target.value })}
            />
          </div>
          
          <div className="form-row">
            <input
              type="number"
              placeholder="TOEFL Min"
              value={form.toeflMin}
              onChange={e => setForm({ ...form, toeflMin: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="GPA Min"
              value={form.gpaMin}
              onChange={e => setForm({ ...form, gpaMin: e.target.value })}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Application Details</h3>
          <input
            placeholder="Application Portal (e.g., Common App)"
            value={form.applicationPortal}
            onChange={e => setForm({ ...form, applicationPortal: e.target.value })}
          />
          
          <input
            placeholder="Application URL"
            value={form.applicationUrl}
            onChange={e => setForm({ ...form, applicationUrl: e.target.value })}
          />
          
          <div className="form-row">
            <input
              type="number"
              placeholder="Essays Required"
              value={form.essaysRequired}
              onChange={e => setForm({ ...form, essaysRequired: e.target.value })}
            />
            
            <input
              type="number"
              placeholder="Rec Letters Required"
              value={form.recLettersRequired}
              onChange={e => setForm({ ...form, recLettersRequired: e.target.value })}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Status & Notes</h3>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option value="researching">🔍 Researching</option>
            <option value="planning">📋 Planning</option>
            <option value="applied">📝 Applied</option>
            <option value="accepted">✅ Accepted</option>
            <option value="rejected">❌ Rejected</option>
            <option value="waitlisted">⏳ Waitlisted</option>
          </select>
          
          <textarea
            placeholder="Notes (deadlines, requirements, reminders...)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={4}
          />
        </div>

        <button type="submit" className="submit-btn">Add University</button>
      </form>
    </div>
  );
}
