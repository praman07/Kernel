import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, User, Bell, Bookmark, PlusSquare, Compass, Terminal, FileText, CornerDownLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function CommandPalette({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  const actions = [
    { icon: Home, label: 'Go to Feed', shortcut: 'G H', path: '/feed' },
    { icon: Compass, label: 'Explore Projects', shortcut: 'G E', path: '/explore' },
    { icon: Bell, label: 'Notifications', shortcut: 'G N', path: '/notifications' },
    { icon: Bookmark, label: 'My Bookmarks', shortcut: 'G B', path: '/bookmarks' },
    { icon: User, label: 'View Profile', shortcut: 'G P', path: `/profile/${user?._id}` },
    { icon: PlusSquare, label: 'Ship New Project', shortcut: 'C P', path: '/create-project' },
    { icon: FileText, label: 'Write Journal Entry', shortcut: 'C B', path: '/create-blog' },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selected index when query changes or palette opens
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  const handleAction = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredActions.length > 0 ? (prev + 1) % filteredActions.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredActions.length > 0 ? (prev - 1 + filteredActions.length) % filteredActions.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          handleAction(filteredActions[selectedIndex].path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen, filteredActions, selectedIndex]);

  // Ensure active item is scrolled into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      listRef.current.children[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl bg-kernel-950 border border-kernel-600 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden rounded-xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-kernel-700 bg-kernel-900/60">
          <Search size={20} className="text-blue-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent text-kernel-100 placeholder-kernel-500 focus:outline-none font-mono text-sm leading-relaxed"
            placeholder="Search commands or navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="px-2 py-0.5 rounded border border-kernel-700 bg-kernel-900 text-[10px] font-mono text-kernel-400 hover:text-kernel-100 hover:border-kernel-500 transition-colors ml-2 cursor-pointer shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Action Options List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1" ref={listRef}>
          {filteredActions.length > 0 ? (
            filteredActions.map((action, index) => {
              const Icon = action.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer border ${
                    isSelected 
                      ? 'bg-blue-600/20 border-blue-500/60 text-white font-semibold shadow-sm' 
                      : 'bg-transparent border-transparent text-kernel-300 hover:bg-kernel-900 hover:text-kernel-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isSelected ? 'text-blue-400' : 'text-kernel-500'} />
                    <span className="font-mono text-xs tracking-wide">{action.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {action.shortcut && (
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        isSelected 
                          ? 'border-blue-500/40 bg-blue-950/40 text-blue-300' 
                          : 'border-kernel-800 bg-kernel-900 text-kernel-500'
                      }`}>
                        {action.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft size={14} className="text-blue-400 ml-1 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <div className="w-10 h-10 rounded-full border border-kernel-800 flex items-center justify-center mx-auto mb-3 opacity-40">
                <Terminal size={18} className="text-kernel-500" />
              </div>
              <p className="font-mono text-xs text-kernel-500">No matching commands found.</p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="bg-kernel-900/80 px-4 py-2.5 border-t border-kernel-800 flex items-center justify-between text-kernel-400 font-mono text-[11px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-kernel-950 border border-kernel-700 text-kernel-300 rounded font-bold text-[10px]">↵</span>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-kernel-950 border border-kernel-700 text-kernel-300 rounded font-bold text-[10px]">↑</span>
              <span className="px-1.5 py-0.5 bg-kernel-950 border border-kernel-700 text-kernel-300 rounded font-bold text-[10px]">↓</span>
              <span>Navigate</span>
            </div>
          </div>
          <div className="text-[10px] text-kernel-500 font-mono tracking-widest uppercase">
            KERNEL_PALETTE
          </div>
        </div>

      </div>
    </div>
  );
}
