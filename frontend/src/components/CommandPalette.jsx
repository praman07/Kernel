import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, User, Bell, Bookmark, PlusSquare, Command, Hash, Terminal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function CommandPalette({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { icon: Home, label: 'Go to Feed', shortcut: 'G H', path: '/feed' },
    { icon: Compass, label: 'Explore Projects', shortcut: 'G E', path: '/explore' },
    { icon: Bell, label: 'Notifications', shortcut: 'G N', path: '/notifications' },
    { icon: Bookmark, label: 'My Bookmarks', shortcut: 'G B', path: '/bookmarks' },
    { icon: User, label: 'View Profile', shortcut: 'G P', path: `/profile/${user?._id}` },
    { icon: PlusSquare, label: 'Ship New Project', shortcut: 'C P', path: '/create-project' },
    { icon: PlusSquare, label: 'Write Journal Entry', shortcut: 'C B', path: '/create-blog' },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  if (!isOpen) return null;

  const handleAction = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-kernel-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-lg bg-kernel-900 border border-kernel-800 shadow-hard overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-4 border-b border-kernel-800">
          <Search size={18} className="text-kernel-500 mr-3" />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent text-kernel-100 placeholder-kernel-600 focus:outline-none font-mono text-sm"
            placeholder="Search commands or files..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <div className="flex items-center gap-1 ml-2">
            <span className="px-1.5 py-0.5 rounded bg-kernel-800 text-[10px] font-mono text-kernel-500">ESC</span>
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-2">
          {filteredActions.length > 0 ? (
            <div className="space-y-1">
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                      index === selectedIndex ? 'bg-blue-600/10 text-blue-400' : 'text-kernel-400 hover:bg-kernel-800/50 hover:text-kernel-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={index === selectedIndex ? 'text-blue-400' : 'text-kernel-600'} />
                      <span className="font-mono text-xs">{action.label}</span>
                    </div>
                    {action.shortcut && (
                      <span className="font-mono text-[9px] text-kernel-700 uppercase tracking-widest">{action.shortcut}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full border border-kernel-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                <Terminal size={20} className="text-kernel-600" />
              </div>
              <p className="font-mono text-xs text-kernel-600 italic">No matching commands found.</p>
            </div>
          )}
        </div>

        <div className="bg-kernel-950 px-4 py-2 border-t border-kernel-800 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-kernel-700">
              <div className="px-1 border border-kernel-800 rounded">↵</div>
              <span>select</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-kernel-700">
              <div className="px-1 border border-kernel-800 rounded">↑↓</div>
              <span>navigate</span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] text-kernel-800 uppercase tracking-widest">
            kernel_v0.9.4
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: Missing icon in earlier import
function Compass(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
