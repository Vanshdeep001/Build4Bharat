import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function FarmerVerification() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Simulating fetching validation data from backend using submissionId
  // For this scope, we just assume the link is valid.
  
  const [form, setForm] = useState({
    benefit_received: null,
    quality_rating: 0,
    issue_description: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // In a real app, verify the submissionId exists and hasn't been verified yet.
    setLoading(false);
  }, [submissionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.benefit_received === null) {
      setError('Please indicate if you received the benefit.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/verifications', {
        submission_id: submissionId,
        district_id: 'unknown', // Typically fetched from the backend via the submission lookup
        block_id: 'unknown',
        channel: 'sms_link',
        benefit_received: form.benefit_received,
        quality_rating: form.quality_rating,
        issue_description: form.issue_description || 'None'
      });
      
      setSuccess('Thank you! Your verification has been recorded via the PMDDKY GroundTruth system.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md bg-surface-card border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-3">
            <span className="text-xl font-bold text-white">GT</span>
          </div>
          <h1 className="text-xl font-bold text-white">Govt. Verification</h1>
          <p className="text-xs text-slate-500 mt-1">PMDDKY Benefit Confirmation</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-sm text-emerald-400 font-medium">Successfully Verified</p>
            <p className="text-xs text-slate-400">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3 text-center">
                Did you receive the specified benefit from the field agent?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, benefit_received: true })}
                  className={`py-3 rounded-xl border font-bold transition-all ${
                    form.benefit_received === true
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-surface-elevated border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  Yes, Received
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, benefit_received: false })}
                  className={`py-3 rounded-xl border font-bold transition-all ${
                    form.benefit_received === false
                      ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-surface-elevated border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  No, Not Received
                </button>
              </div>
            </div>

            {form.benefit_received === true && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-white mb-2 text-center">
                  How would you rate the quality of service/materials?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, quality_rating: star })}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      {star <= form.quality_rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.benefit_received === false && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-white mb-2">
                  Please describe the issue (Optional)
                </label>
                <textarea
                  value={form.issue_description}
                  onChange={(e) => setForm({ ...form, issue_description: e.target.value })}
                  placeholder="E.g., The agent never visited, or I was asked for money..."
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-elevated border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition resize-none"
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || form.benefit_received === null}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
