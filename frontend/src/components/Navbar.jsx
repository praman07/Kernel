import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Terminal, User, LogOut, Code2, Compass, PlusSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="hidden md:block bg-kernel-950 border-b border-kernel-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={user ? "/feed" : "/"} className="flex items-center gap-2 group">
              <div className="w-6 h-6 border border-kernel-600 flex items-center justify-center bg-kernel-900 group-hover:bg-kernel-800 transition-colors">
                <Terminal size={14} className="text-kernel-300" />
              </div>
              <span className="font-mono font-bold tracking-tight text-kernel-100 text-sm">Kernel</span>
            </Link>

            {user && (
              <div className="flex items-center gap-6 font-mono text-xs text-kernel-400">
                <Link to="/feed" className={`hover:text-kernel-100 transition-colors ${isActive('/feed') ? 'text-kernel-100 border-b border-kernel-100 pb-1' : ''}`}>~/feed</Link>
                <Link to="/explore" className={`hover:text-kernel-100 transition-colors ${isActive('/explore') ? 'text-kernel-100 border-b border-kernel-100 pb-1' : ''}`}>~/explore</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            {user ? (
              <>
                <Link to="/create-project" className="flex items-center gap-1.5 px-3 py-1.5 border border-kernel-700 bg-kernel-900 hover:bg-kernel-800 text-kernel-200 transition-colors">
                  <PlusSquare size={14} /> new_post
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-kernel-400 hover:text-kernel-100 transition-colors pl-4 border-l border-kernel-800">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-5 h-5 rounded-none border border-kernel-700 object-cover" />
                  ) : (
                    <User size={14} />
                  )}
                  {user.name.split(' ')[0]}
                </Link>
                <button onClick={logout} className="text-kernel-500 hover:text-red-400 transition-colors p-1" title="Logout">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-kernel-400 hover:text-kernel-100 transition-colors">login</Link>
                <Link to="/signup" className="px-3 py-1.5 bg-kernel-100 text-kernel-950 hover:bg-white font-bold transition-colors">
                  init_account
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-kernel-950/90 backdrop-blur-md border-t border-kernel-800 z-50 pb-safe">
        <div className="flex items-center justify-around h-14 px-2">
          {user ? (
            <>
              <Link to="/feed" className={`flex flex-col items-center gap-1 p-2 ${isActive('/feed') ? 'text-kernel-100' : 'text-kernel-500 hover:text-kernel-300'}`}>
                <Code2 size={20} />
              </Link>
              <Link to="/explore" className={`flex flex-col items-center gap-1 p-2 ${isActive('/explore') ? 'text-kernel-100' : 'text-kernel-500 hover:text-kernel-300'}`}>
                <Compass size={20} />
              </Link>
              <Link to="/create-project" className="flex flex-col items-center p-2 text-kernel-100 bg-kernel-800 border border-kernel-700 -mt-6 h-12 w-12 justify-center shadow-hard-sm">
                <PlusSquare size={20} />
              </Link>
              <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 ${isActive('/profile') ? 'text-kernel-100' : 'text-kernel-500 hover:text-kernel-300'}`}>
                <User size={20} />
              </Link>
              <button onClick={logout} className="flex flex-col items-center gap-1 p-2 text-kernel-500 hover:text-red-400">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/" className={`flex flex-col items-center gap-1 p-2 ${isActive('/') ? 'text-kernel-100' : 'text-kernel-500'}`}>
                <Terminal size={20} />
              </Link>
              <Link to="/login" className="font-mono text-xs text-kernel-400 px-4 py-2">login</Link>
              <Link to="/signup" className="font-mono text-xs bg-kernel-100 text-kernel-950 px-4 py-2 font-bold">init_account</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
