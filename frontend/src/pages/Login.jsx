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
    <div className="flex items-center justify-center min-h-[85vh] bg-dot-pattern px-4 py-12">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-md bg-kernel-950 border-2 border-kernel-600 shadow-2xl relative rounded-xl">
        <div className="absolute -top-3.5 -left-3.5 w-8 h-8 border border-kernel-600 bg-kernel-900 flex items-center justify-center rounded-md shadow-md">
          <Terminal size={16} className="text-blue-400" />
        </div>
        
        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold text-white tracking-tight">/auth/login</h2>
            <p className="text-kernel-400 font-mono text-sm mt-1.5">Authenticate to access the network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                className="w-full bg-kernel-900 border border-kernel-700 focus:border-blue-500 p-3 text-white placeholder-kernel-500 focus:outline-none font-mono text-base transition-colors rounded-lg"
                placeholder="user@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-kernel-900 border border-kernel-700 focus:border-blue-500 p-3 text-white placeholder-kernel-500 focus:outline-none font-mono text-base transition-colors rounded-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-white hover:bg-zinc-200 text-kernel-950 font-mono font-bold text-base py-3 shadow-md transition-all rounded-lg cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'authenticating...' : 'execute'}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-kernel-800 text-center">
            <p className="font-mono text-sm text-kernel-400">
              No access credentials?{' '}
              <Link to="/signup" className="text-white hover:text-blue-400 font-bold underline transition-colors">
                init_account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
