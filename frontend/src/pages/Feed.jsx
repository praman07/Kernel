import { useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import { RefreshCw, TerminalSquare, BookOpen, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Radio, Command } from 'lucide-react';

export default function Feed() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('For you');
  const [showComposerChoice, setShowComposerChoice] = useState(false);
  const [systemEvents, setSystemEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'For you') {
        const [projectsRes, blogsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/blogs')
        ]);
        const merged = [
          ...projectsRes.data.map(p => ({ ...p, type: 'project' })),
          ...blogsRes.data.map(b => ({ ...b, type: 'blog' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeedItems(merged);
      } else {
        // Following tab — only show posts from people the user follows
        const followingIds = user?.following || [];
        const [projectsRes, blogsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/blogs')
        ]);
        const merged = [
          ...projectsRes.data.map(p => ({ ...p, type: 'project' })),
          ...blogsRes.data.map(b => ({ ...b, type: 'blog' }))
        ]
          .filter(item => {
            const creatorId = item.type === 'project' ? item.creator?._id : item.author?._id;
            return followingIds.some(fid => fid.toString() === creatorId?.toString());
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeedItems(merged);
      }
    } catch (error) {
      console.error('Error fetching feed data', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/projects/activity');
        setSystemEvents(data);
      } catch (err) {
        console.error('Activity fetch failed', err);
      }
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="w-full">
      {/* Feed Header / Tabs */}
      <div className="sticky top-0 z-40 bg-kernel-950/80 backdrop-blur-md border-b border-kernel-800 flex items-center">
        <button 
          onClick={() => setActiveTab('For you')}
          className={`flex-1 hover:bg-kernel-900/50 transition-colors flex justify-center py-4 relative text-sm ${
            activeTab === 'For you' ? 'font-bold text-kernel-100' : 'font-medium text-kernel-400'
          }`}
        >
          For you
          {activeTab === 'For you' && <div className="absolute bottom-0 w-16 h-1 bg-blue-500 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('Following')}
          className={`flex-1 hover:bg-kernel-900/50 transition-colors flex justify-center py-4 relative text-sm ${
            activeTab === 'Following' ? 'font-bold text-kernel-100' : 'font-medium text-kernel-400'
          }`}
        >
          Following
          {activeTab === 'Following' && <div className="absolute bottom-0 w-16 h-1 bg-blue-500 rounded-t-full" />}
        </button>
        <button onClick={fetchData} className="p-4 text-kernel-500 hover:text-kernel-200 hover:bg-kernel-900/50 transition-colors">
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* System Event Stream (Alive indicator) */}
      <div className="bg-kernel-900/40 border-b border-kernel-800 px-4 py-2 overflow-hidden flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-mono text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Live Stream</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {systemEvents.map(event => (
              <div key={event.id} className="flex items-center gap-2 font-mono text-[10px] text-kernel-500">
                <span className="text-kernel-600">[{event.time}]</span>
                <span className="text-kernel-400">{event.text}</span>
              </div>
            ))}
            {/* Duplicate for seamless marquee */}
            {systemEvents.map(event => (
              <div key={`dup-${event.id}`} className="flex items-center gap-2 font-mono text-[10px] text-kernel-500">
                <span className="text-kernel-600">[{event.time}]</span>
                <span className="text-kernel-400">{event.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Composer */}
      <div className="p-4 border-b border-kernel-800 hidden sm:block relative">
        <div className="flex gap-4">
          <Link to="/profile" className="shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-10 h-10 object-cover border border-kernel-700" />
            ) : (
              <div className="w-10 h-10 bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-sm text-kernel-300">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </Link>
          <div className="flex-1">
            <button
              onClick={() => setShowComposerChoice(true)}
              className="w-full text-left bg-kernel-900 border border-kernel-800 hover:border-kernel-600 px-4 py-3 text-kernel-500 hover:text-kernel-400 font-mono text-sm transition-colors rounded-lg cursor-text"
            >
              What are you building today?
            </button>
          </div>
        </div>

        {/* Post Type Picker */}
        {showComposerChoice && (
          <div className="absolute top-full left-0 right-0 z-50 bg-kernel-950 border border-kernel-800 shadow-hard">
            <div className="flex items-center justify-between px-4 py-3 border-b border-kernel-800">
              <span className="font-mono text-xs text-kernel-400">Choose post type</span>
              <button onClick={() => setShowComposerChoice(false)} className="text-kernel-500 hover:text-kernel-200 p-1">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2">
              <button
                onClick={() => { setShowComposerChoice(false); navigate('/create-project'); }}
                className="flex flex-col items-center gap-2 p-6 hover:bg-kernel-900 border-r border-kernel-800 transition-colors group"
              >
                <TerminalSquare size={28} className="text-kernel-500 group-hover:text-blue-400 transition-colors" />
                <span className="font-mono text-sm font-bold text-kernel-300 group-hover:text-kernel-100">Project</span>
                <span className="font-mono text-[10px] text-kernel-600">Ship a new build</span>
              </button>
              <button
                onClick={() => { setShowComposerChoice(false); navigate('/create-blog'); }}
                className="flex flex-col items-center gap-2 p-6 hover:bg-kernel-900 transition-colors group"
              >
                <BookOpen size={28} className="text-kernel-500 group-hover:text-emerald-400 transition-colors" />
                <span className="font-mono text-sm font-bold text-kernel-300 group-hover:text-kernel-100">Journal</span>
                <span className="font-mono text-[10px] text-kernel-600">Write a dev post</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feed Stream */}
      <div>
        {isLoading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kernel-500" />
            <span className="font-mono text-xs text-kernel-600">fetching_segments...</span>
          </div>
        ) : feedItems.length > 0 ? (
          <>
            {feedItems.slice(0, visibleCount).map(item => (
              item.type === 'project' 
                ? <ProjectCard key={`p-${item._id}`} project={item} /> 
                : <BlogCard key={`b-${item._id}`} blog={item} />
            ))}
            
            {visibleCount < feedItems.length && (
              <div className="p-8 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 border border-kernel-800 rounded-full flex items-center justify-center group-hover:bg-kernel-900 group-hover:border-kernel-600 transition-all">
                    <Command size={18} className="text-kernel-600 group-hover:text-kernel-200" />
                  </div>
                  <span className="font-mono text-[10px] text-kernel-600 group-hover:text-kernel-400">kernel_fetch --next</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 border border-kernel-800 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <Radio size={32} className="text-kernel-500" />
            </div>
            <p className="font-mono text-kernel-500 text-sm mb-4">
              {activeTab === 'Following' 
                ? 'Follow more developers to see their posts here.' 
                : 'The network is empty. Be the first to push.'}
            </p>
            {activeTab === 'Following' && (
              <Link to="/explore" className="font-mono text-xs text-blue-400 hover:underline">→ find developers to follow</Link>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom padding for mobile scrolling */}
      <div className="h-24 sm:h-0" />
    </div>
  );
}
