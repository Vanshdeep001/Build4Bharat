import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(phone, password);
      if (user.role === 'field_agent') {
        navigate('/field');
      } else {
        setError('Access Denied. Contact HQ.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed.');
      setLoading(false);
    }
  };

  const quickLogin = (p, pwd) => {
    setPhone(p);
    setPassword(pwd);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-surface overflow-hidden">

      {/* Left Section */}
      <div className="w-full md:w-[55%] h-[30vh] md:h-full bg-primary flex flex-col justify-center p-8 md:p-16">
        <div className="space-y-4">
          <div className="w-12 h-1 bg-white/40 mb-8"></div>
          <h1 className="text-4xl md:text-6xl font-bold text-white uppercase leading-tight tracking-tight">
            PMDDKY
          </h1>
          <p className="text-sm md:text-base font-semibold text-white/80 uppercase tracking-wide">
            Pradhan Mantri Dhan-Dhaanya<br />Krishi Yojana
          </p>
          <p className="text-xs text-white/50 mt-4">
            Field Agent Portal • Government of India
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-[45%] flex flex-col justify-center p-6 md:p-14 bg-white overflow-auto">
        <div className="max-w-sm w-full mx-auto space-y-6">

          <div>
            <h2 className="text-2xl font-bold text-ink">Sign In</h2>
            <p className="text-sm text-ink-secondary mt-1">Enter your credentials to start work.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-danger-light border-l-4 border-danger p-3 text-danger text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="label-text mb-1.5 block">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="Enter 10-digit number"
                required
              />
            </div>

            <div>
              <label className="label-text mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Quick Access */}
          <div className="pt-4 border-t border-border">
            <p className="label-text mb-3">Quick Login</p>
            <div className="flex gap-3">
              <button
                onClick={() => quickLogin('9800000001', 'agent123')}
                className="flex-1 py-2.5 px-3 bg-surface border border-border rounded-lg text-xs font-bold text-ink hover:bg-surface-card"
              >
                Agent 1
              </button>
              <button
                onClick={() => quickLogin('9800000002', 'agent123')}
                className="flex-1 py-2.5 px-3 bg-surface border border-border rounded-lg text-xs font-bold text-ink hover:bg-surface-card"
              >
                Agent 2
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
