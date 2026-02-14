import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    essaysRequired: '',
    recLettersRequired: '',
    interviewRequired: '0',
    status: 'researching',
    priority: 'medium',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
          essaysRequired: form.essaysRequired ? Number(form.essaysRequired) : null,
          recLettersRequired: form.recLettersRequired ? Number(form.recLettersRequired) : null,
          interviewRequired: Number(form.interviewRequired),
        }),
      });

      onAdd();
    } catch (error) {
      console.error('Failed to add university:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-university">
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-card">
          <div className="form-card-header">
            <h3 className="form-card-title">Basic Information</h3>
          </div>
          <div className="form-card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">University Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g., Stanford University"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  className="form-input"
                  placeholder="e.g., USA"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Program *</label>
                <select
                  className="form-select"
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">PhD</option>
                  <option value="Master's">Master's</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Major *</label>
                <input
                  className="form-input"
                  placeholder="e.g., Computer Science"
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">World Ranking</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 5"
                  value={form.ranking}
                  onChange={(e) => setForm({ ...form, ranking: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Deadlines */}
        <div className="form-card">
          <div className="form-card-header">
            <h3 className="form-card-title">Deadlines</h3>
          </div>
          <div className="form-card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Early Decision/Action</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.deadlineEarly}
                  onChange={(e) => setForm({ ...form, deadlineEarly: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Regular Decision</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.deadlineRegular}
                  onChange={(e) => setForm({ ...form, deadlineRegular: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Transfer Deadline</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.deadlineTransfer}
                  onChange={(e) => setForm({ ...form, deadlineTransfer: e.target.value })}
                />
              </div>
              <div className="form-group" />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="form-card">
          <div className="form-card-header">
            <h3 className="form-card-title">Requirements</h3>
          </div>
          <div className="form-card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SAT Minimum</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 1400"
                  value={form.satMin}
                  onChange={(e) => setForm({ ...form, satMin: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">SAT Average</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 1500"
                  value={form.satAvg}
                  onChange={(e) => setForm({ ...form, satAvg: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">IELTS Minimum</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 7.0"
                  value={form.ieltsMin}
                  onChange={(e) => setForm({ ...form, ieltsMin: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">IELTS Average</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 7.5"
                  value={form.ieltsAvg}
                  onChange={(e) => setForm({ ...form, ieltsAvg: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">TOEFL Minimum</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 100"
                  value={form.toeflMin}
                  onChange={(e) => setForm({ ...form, toeflMin: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GPA Minimum</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 3.7"
                  value={form.gpaMin}
                  onChange={(e) => setForm({ ...form, gpaMin: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="form-card">
          <div className="form-card-header">
            <h3 className="form-card-title">Application Details</h3>
          </div>
          <div className="form-card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Application Portal</label>
                <select
                  className="form-select"
                  value={form.applicationPortal}
                  onChange={(e) => setForm({ ...form, applicationPortal: e.target.value })}
                >
                  <option value="">Select portal...</option>
                  <option value="Common App">Common App</option>
                  <option value="Coalition App">Coalition App</option>
                  <option value="UCAS">UCAS</option>
                  <option value="Direct">Direct Application</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Application URL</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://..."
                  value={form.applicationUrl}
                  onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Essays Required</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 2"
                  value={form.essaysRequired}
                  onChange={(e) => setForm({ ...form, essaysRequired: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Recommendation Letters</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 2"
                  value={form.recLettersRequired}
                  onChange={(e) => setForm({ ...form, recLettersRequired: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Interview Required</label>
                <select
                  className="form-select"
                  value={form.interviewRequired}
                  onChange={(e) => setForm({ ...form, interviewRequired: e.target.value })}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="researching">Researching</option>
                  <option value="planning">Planning</option>
                  <option value="applied">Applied</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-card">
          <div className="form-card-header">
            <h3 className="form-card-title">Notes</h3>
          </div>
          <div className="form-card-body">
            <div className="form-group full-width">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Any additional information, reminders, or requirements..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="submit-section">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                Adding...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8m-4-4h8" />
                </svg>
                Add University
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
