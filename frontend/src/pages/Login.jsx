import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Terminal } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('auth success');
      navigate('/feed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'auth failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] bg-dot-pattern px-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-sm bg-kernel-950 border border-kernel-800 shadow-hard relative">
        <div className="absolute -top-3 -left-3 w-6 h-6 border border-kernel-800 bg-kernel-900 flex items-center justify-center">
          <Terminal size={12} className="text-kernel-500" />
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-mono font-bold text-kernel-100 tracking-tight">/auth/login</h2>
            <p className="text-kernel-500 font-mono text-xs mt-1">Authenticate to access the network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-kernel-400 uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                className="w-full bg-kernel-900 border border-kernel-800 p-2.5 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                placeholder="user@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-kernel-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                className="w-full bg-kernel-900 border border-kernel-800 p-2.5 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-kernel-200 hover:bg-white text-kernel-950 font-mono font-bold text-sm py-2.5 shadow-hard-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'authenticating...' : 'execute'}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-kernel-800 text-center">
            <p className="font-mono text-xs text-kernel-500">
              No access credentials?{' '}
              <Link to="/signup" className="text-kernel-300 hover:text-white hover:underline transition-colors">
                init_account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
