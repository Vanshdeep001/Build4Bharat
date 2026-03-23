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
    <div className="h-screen flex flex-col md:flex-row bg-brand-creme overflow-hidden">
      
      {/* Left Immersive Section */}
      <div className="w-full md:w-[60%] h-[35vh] md:h-full bg-brand-clay flex flex-col justify-center p-8 md:p-20 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px] animate-float"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-1 bg-black mb-12"></div>
          <h1 className="text-hero text-black uppercase leading-tight">
            PMDDKY
          </h1>
          <p className="font-display font-black text-xs md:text-sm uppercase tracking-tight text-black">
            Pradhan Mantri Dhan-Dhaanya<br/>Krishi Yojana
          </p>
        </div>

        <div className="absolute bottom-12 left-12 md:left-20">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-2 h-2 rounded-full border border-black/20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Interaction Section */}
      <div className="w-full md:w-[40%] flex flex-col justify-center p-6 md:p-16 bg-brand-creme overflow-hidden">
        <div className="max-w-md w-full mx-auto space-y-6 md:space-y-10">
          
          <div className="mb-4 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black uppercase text-brand-ink">Sign In</h2>
            <p className="text-brand-ink font-bold opacity-80 text-sm">Enter your details to start work.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 md:space-y-10">
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-600 p-4 text-rose-700 text-sm font-bold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="group relative">
              <label className="block text-label text-accent-cobalt mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-minimal w-full py-2"
                placeholder="Enter 10-digit number"
                required
              />
            </div>

            <div className="group relative">
              <label className="block text-label text-accent-cobalt mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-minimal w-full py-2"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-capsule w-full group py-3 md:py-4"
            >
              <span className="flex items-center justify-center gap-4">
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
                {!loading && <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>}
              </span>
            </button>
          </form>

          {/* Quick Access */}
          <div className="mt-8 md:mt-20 flex flex-col gap-4">
            <p className="text-label text-brand-ink/80 font-black">Quick Sign In</p>
            <div className="flex gap-3">
              <button
                onClick={() => quickLogin('9800000001', 'agent123')}
                className="flex-1 py-3 px-4 bg-brand-clay border-2 border-brand-ink font-display font-black text-xs uppercase transition hover:bg-white hover:shadow-[4px_4px_0px_black] active:translate-y-[2px] rounded-2xl text-brand-ink"
              >
                Agent 1
              </button>
              <button
                onClick={() => quickLogin('9800000002', 'agent123')}
                className="flex-1 py-3 px-4 bg-brand-clay border-2 border-brand-ink font-display font-black text-xs uppercase transition hover:bg-white hover:shadow-[4px_4px_0px_black] active:translate-y-[2px] rounded-2xl text-brand-ink"
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
