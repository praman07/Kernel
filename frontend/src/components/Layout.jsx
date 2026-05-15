import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Terminal, Home, Compass, PlusSquare, User, Bell, LogOut, Bookmark, Search, X, MessageSquare } from 'lucide-react';
import CommandPalette from './CommandPalette';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [trends, setTrends] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket']
    });

    socket.emit('register', user._id);

    socket.on('receive_message', () => {
      // Refresh unread count when a new message arrives anywhere
      api.get('/messages/unread')
        .then(({ data }) => setUnreadMessages(data.count))
        .catch(() => { });
    });

    return () => socket.disconnect();
  }, [user?._id]);

  useEffect(() => {
    if (user) {
      api.get('/users')
        .then(({ data }) => {
          const others = data.filter(u => u._id !== user._id && !user.following?.some(fid => fid.toString() === u._id.toString()));

          // Smart Recommendation: Score users based on shared skills/tags
          const scored = others.map(u => {
            const sharedSkills = u.skills?.filter(s => user.skills?.includes(s)).length || 0;
            const isRecentlyActive = (new Date() - new Date(u.lastActive)) < (1000 * 60 * 60 * 2); // 2 hours
            return { ...u, score: sharedSkills + (isRecentlyActive ? 5 : 0), isRecentlyActive };
          });

          setSuggestedUsers(scored.sort((a, b) => b.score - a.score).slice(0, 4));
        })
        .catch(err => console.error(err));

      // Fetch unread notification count
      api.get('/notifications').then(({ data }) => {
        setUnreadCount(data.filter(n => !n.read).length);
      }).catch(() => { });

      // Fetch real trends
      api.get('/projects/trends')
        .then(({ data }) => setTrends(data))
        .catch(() => { });

      // Fetch unread messages
      api.get('/messages/unread')
        .then(({ data }) => setUnreadMessages(data.count))
        .catch(() => { });

      // Onboarding check: if bio and skills are empty, and not already on onboarding page
      if (!user.bio && (!user.skills || user.skills.length === 0) && location.pathname !== '/onboarding' && location.pathname !== '/profile/edit') {
        navigate('/onboarding');
      }
    }
  }, [user, location.pathname, navigate]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFollow = async (targetId) => {
    try {
      await api.post(`/users/${targetId}/follow`);
      setSuggestedUsers(prev => prev.filter(u => u._id !== targetId));
    } catch (err) { console.error(err); }
  };

  const isActive = (path) => location.pathname === path;

  // We only show the full layout if the user is logged in, 
  // otherwise we might just render a simpler layout for Home/Auth.
  if (!user) {
    return (
      <div className="min-h-screen bg-kernel-950 flex flex-col">
        {/* Simple top nav for logged out users */}
        <nav className="border-b border-kernel-800 sticky top-0 z-50 bg-kernel-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 border border-kernel-600 flex items-center justify-center bg-kernel-900 group-hover:bg-kernel-800 transition-colors">
                <Terminal size={14} className="text-kernel-300" />
              </div>
              <span className="font-mono font-bold tracking-tight text-kernel-100 text-sm">Kernel</span>
            </Link>
            <div className="flex items-center gap-4 font-mono text-xs">
              <Link to="/login" className="text-kernel-400 hover:text-kernel-100 transition-colors">login</Link>
              <Link to="/signup" className="px-3 py-1.5 bg-kernel-100 text-kernel-950 hover:bg-white font-bold transition-colors shadow-hard-sm">
                init_account
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kernel-950 flex justify-center">

      {/* Desktop Left Sidebar */}
      <aside className={`hidden sm:flex flex-col border-r border-kernel-800 sticky top-0 h-screen overflow-y-auto px-2 py-6 transition-all duration-300 ease-in-out ${isMainSidebarOpen ? 'w-20 xl:w-80 xl:px-4' : 'w-0 border-none px-0'}`}>
        <div className={isMainSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}>
          <div className="flex items-center justify-between mb-8 px-2 xl:px-4">
            <Link to="/feed" className="flex items-center gap-4 group">
              <div className="w-8 h-8 border-2 border-kernel-600 flex items-center justify-center bg-kernel-900 group-hover:bg-kernel-800 transition-colors shrink-0 shadow-hard-sm">
                <Terminal size={16} className="text-kernel-300" />
              </div>
              <span className="font-mono font-bold tracking-tight text-kernel-100 text-xl hidden xl:block">Kernel</span>
            </Link>
            <button onClick={() => setIsMainSidebarOpen(false)} className="hidden xl:block text-kernel-600 hover:text-kernel-100 p-1">
              <X size={18} />
            </button>
          </div>

        {/* Quick Search Shortcut */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden xl:flex items-center justify-between mb-6 px-3 py-2 bg-kernel-900/50 border border-kernel-800 hover:border-kernel-700 transition-colors rounded-xl text-kernel-500 hover:text-kernel-300 group"
        >
          <div className="flex items-center gap-2">
            <Search size={14} />
            <span className="font-mono text-[10px]">search_commands...</span>
          </div>
          <span className="font-mono text-[10px] bg-kernel-800 px-1 rounded">⌘K</span>
        </button>

        <nav className="flex flex-col gap-2 font-mono text-sm flex-1">
          <Link to="/feed" className={`flex items-center gap-4 p-3 xl:px-4 rounded-xl transition-colors ${isActive('/feed') ? 'font-bold text-kernel-100' : 'text-kernel-400 hover:bg-kernel-900 hover:text-kernel-200'}`}>
            <Home size={22} className={isActive('/feed') ? 'text-kernel-100' : ''} />
            <span className="hidden xl:block">Home</span>
          </Link>
          <Link to="/explore" className={`flex items-center gap-4 p-3 xl:px-4 rounded-xl transition-colors ${isActive('/explore') ? 'font-bold text-kernel-100' : 'text-kernel-400 hover:bg-kernel-900 hover:text-kernel-200'}`}>
            <Compass size={22} className={isActive('/explore') ? 'text-kernel-100' : ''} />
            <span className="hidden xl:block">Explore</span>
          </Link>
          <Link to="/notifications" className={`flex items-center gap-4 p-3 xl:px-4 rounded-xl transition-colors relative ${isActive('/notifications') ? 'font-bold text-kernel-100' : 'text-kernel-400 hover:bg-kernel-900 hover:text-kernel-200'}`}>
            <div className="relative">
              <Bell size={22} className={isActive('/notifications') ? 'text-kernel-100' : ''} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="hidden xl:block">Notifications</span>
          </Link>
          <Link to="/profile" className={`flex items-center gap-4 p-3 xl:px-4 rounded-xl transition-colors ${isActive('/profile') ? 'font-bold text-kernel-100' : 'text-kernel-400 hover:bg-kernel-900 hover:text-kernel-200'}`}>
            <User size={22} className={isActive('/profile') ? 'text-kernel-100' : ''} />
            <span className="hidden xl:block">Profile</span>
          </Link>

          <Link to="/bookmarks" className={`flex items-center gap-4 p-3 xl:px-4 rounded-xl transition-colors ${isActive('/bookmarks') ? 'font-bold text-kernel-100' : 'text-kernel-400 hover:bg-kernel-900 hover:text-kernel-200'}`}>
            <Bookmark size={22} className={isActive('/bookmarks') ? 'text-kernel-100' : ''} />
            <span className="hidden xl:block">Bookmarks</span>
          </Link>

          <Link to="/messages" className={`flex items-center gap-4 p-3 xl:px-4 rounded-xl transition-colors relative ${isActive('/messages') ? 'font-bold text-kernel-100' : 'text-kernel-400 hover:bg-kernel-900 hover:text-kernel-200'}`}>
            <div className="relative">
              <Terminal size={22} className={isActive('/messages') ? 'text-kernel-100' : ''} />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-kernel-950" />
              )}
            </div>
            <span className="hidden xl:block">Messages</span>
          </Link>

          <Link to="/create-project" className="mt-6 flex items-center justify-center gap-2 p-3 xl:px-4 bg-kernel-200 text-kernel-950 hover:bg-white transition-colors font-bold rounded-xl shadow-hard-sm">
            <PlusSquare size={20} />
            <span className="hidden xl:block">Post</span>
          </Link>
        </nav>

        {/* User Mini Profile & Logout at Bottom */}
        <div className="mt-auto pt-4 border-t border-kernel-800 flex flex-col gap-2">
          <Link to="/profile" className="flex items-center gap-3 px-2 xl:px-4 cursor-pointer hover:bg-kernel-900 p-2 rounded-xl transition-colors">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-10 h-10 object-cover shrink-0 border border-kernel-700" />
            ) : (
              <div className="w-10 h-10 shrink-0 bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-xs text-kernel-300">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="hidden xl:flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold text-kernel-100 truncate">{user.name}</span>
              <span className="text-xs text-kernel-500 font-mono truncate">@{user.name.toLowerCase().replace(/\s+/g, '_')}</span>
            </div>
          </Link>
          <button onClick={logout} className="flex items-center gap-4 px-2 xl:px-4 cursor-pointer hover:bg-red-900/20 text-kernel-400 hover:text-red-500 p-2 rounded-xl transition-colors w-full text-left">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center xl:justify-start xl:w-auto xl:h-auto">
              <LogOut size={20} />
            </div>
            <span className="hidden xl:block text-sm font-bold">Logout</span>
          </button>
        </div>
      </div>
    </aside>

      {/* Floating Toggle for Sidebar (Desktop) */}
      {!isMainSidebarOpen && (
        <button 
          onClick={() => setIsMainSidebarOpen(true)}
          className="hidden sm:flex fixed top-4 left-4 z-50 p-2 bg-kernel-900 border border-kernel-800 text-kernel-400 hover:text-kernel-100 transition-all shadow-hard-sm"
        >
          <Terminal size={20} />
        </button>
      )}

      {/* Mobile Top Bar */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-14 bg-kernel-950/80 backdrop-blur-md border-b border-kernel-800 z-50 flex items-center justify-between px-4">
        <Link to="/messages" className="text-kernel-100 hover:text-blue-400 transition-colors">
          <MessageSquare size={22} />
        </Link>
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-kernel-600" />
          <span className="font-mono font-bold tracking-tight text-kernel-100 text-sm">Kernel</span>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>
      <main className="flex-1 w-full sm:max-w-xl md:max-w-2xl lg:max-w-[850px] border-r border-kernel-800 pt-14 sm:pt-0 pb-20 sm:pb-0 min-h-screen">
        {children}
      </main>

      {/* Desktop Right Sidebar */}
      <aside className="hidden lg:block w-[420px] p-6 sticky top-0 h-screen overflow-y-auto">
        {/* Search */}
        <div className="flex items-center gap-2 bg-kernel-900 border border-kernel-800 focus-within:border-kernel-600 px-3 py-2 mb-6 transition-colors">
          <Compass size={14} className="text-kernel-600 shrink-0" />
          <input
            type="text"
            placeholder="Search... (Enter)"
            className="bg-transparent text-kernel-100 focus:outline-none font-mono text-sm w-full placeholder-kernel-600"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Who to follow */}
        {suggestedUsers.length > 0 && (
          <div className="mb-6">
            <h3 className="font-mono text-[10px] font-bold text-kernel-500 uppercase tracking-widest mb-3">Who to follow</h3>
            <div className="space-y-3">
              {suggestedUsers.map(dev => (
                <div key={dev._id} className="flex items-center gap-2">
                  <Link to={`/profile/${dev._id}`} className="flex items-center gap-2 flex-1 overflow-hidden group">
                    {dev.profilePicture ? (
                      <img src={dev.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-kernel-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-full shrink-0 bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-xs font-bold text-kernel-300">
                        {dev.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <p className="font-bold text-kernel-100 text-sm truncate group-hover:underline">{dev.name}</p>
                      </div>
                      <p className="font-mono text-[10px] text-kernel-600 truncate">@{dev.name.toLowerCase().replace(/\s+/g, '_')}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleFollow(dev._id)}
                    className="shrink-0 px-2.5 py-1 bg-kernel-100 text-kernel-950 text-[11px] font-mono font-bold hover:bg-white transition-colors rounded-full"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending tags */}
        {trends.length > 0 && (
          <div className="mb-6">
            <h3 className="font-mono text-[10px] font-bold text-kernel-500 uppercase tracking-widest mb-3">Trending</h3>
            <div className="space-y-2">
              {trends.map(({ tag, count }, index) => (
                <Link
                  key={tag}
                  to={`/explore?q=${tag}`}
                  className="flex items-center justify-between px-3 py-2 hover:bg-kernel-900 transition-colors group"
                >
                  <div>
                    <p className="font-mono text-[11px] text-kernel-600 mb-0.5">{index + 1} · trending</p>
                    <p className="font-bold text-kernel-100 text-sm group-hover:text-blue-400">#{tag}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-kernel-600 uppercase">{count} items</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-kernel-700">
          <span>© 2026 Kernel</span>
          <span>·</span>
          <span>Built for developers</span>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-kernel-950/95 backdrop-blur-md border-t border-kernel-800 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center h-14">
          <Link to="/feed" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/feed') ? 'text-kernel-100' : 'text-kernel-600 active:text-kernel-200'}`}>
            <Home size={22} />
          </Link>
          <Link to="/explore" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/explore') ? 'text-kernel-100' : 'text-kernel-600 active:text-kernel-200'}`}>
            <Compass size={22} />
          </Link>
          {/* Post FAB */}
          <div className="flex-1 flex items-center justify-center h-full">
            <Link to="/create-project" className="flex items-center justify-center w-11 h-11 bg-kernel-100 text-kernel-950 rounded-full shadow-lg active:scale-95 transition-transform">
              <PlusSquare size={20} />
            </Link>
          </div>
          <Link to="/notifications" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative ${isActive('/notifications') ? 'text-kernel-100' : 'text-kernel-600 active:text-kernel-200'}`}>
            <div className="relative">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-blue-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </Link>
          <Link to="/messages" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative ${isActive('/messages') ? 'text-kernel-100' : 'text-kernel-600 active:text-kernel-200'}`}>
            <div className="relative">
              <Terminal size={22} />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-kernel-950" />
              )}
            </div>
          </Link>
          {/* Profile + logout menu trigger */}
          <button
            onClick={() => setShowMobileMenu(prev => !prev)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${showMobileMenu || isActive('/profile') ? 'text-kernel-100' : 'text-kernel-600 active:text-kernel-200'}`}
          >
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-kernel-700" />
            ) : (
              <User size={22} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile profile slide-up drawer */}
      {showMobileMenu && (
        <>
          <div className="sm:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="sm:hidden fixed bottom-14 left-0 right-0 z-50 bg-kernel-950 border-t border-kernel-800 rounded-t-2xl overflow-hidden">
            <div className="p-4 border-b border-kernel-800 flex items-center gap-3">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover border border-kernel-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-sm text-kernel-300">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-kernel-100 text-sm">{user.name}</p>
                <p className="font-mono text-xs text-kernel-500">@{user.name.toLowerCase().replace(/\s+/g, '_')}</p>
              </div>
            </div>
            <div className="p-2">
              <Link
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-kernel-200 hover:bg-kernel-900 transition-colors"
              >
                <User size={18} />
                <span className="font-medium text-sm">View profile</span>
              </Link>
              <Link
                to="/bookmarks"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-kernel-200 hover:bg-kernel-900 transition-colors"
              >
                <Bookmark size={18} />
                <span className="font-medium text-sm">Bookmarks</span>
              </Link>
              <Link
                to="/profile/edit"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-kernel-200 hover:bg-kernel-900 transition-colors"
              >
                <span className="font-mono text-sm text-kernel-500">⚙</span>
                <span className="font-medium text-sm">Settings</span>
              </Link>
              <button
                onClick={() => { setShowMobileMenu(false); logout(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-colors w-full text-left"
              >
                <LogOut size={18} />
                <span className="font-medium text-sm">Log out</span>
              </button>
            </div>
            <div className="h-2" />
          </div>
        </>
      )}
      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} />
    </div>
  );
}
