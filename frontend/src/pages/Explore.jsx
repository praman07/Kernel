import { useState, useEffect } from 'react';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import { Command, Users, GitBranch, ArrowRight, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialView = queryParams.get('view') || 'trending';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [topUsers, setTopUsers] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [discoveryView, setDiscoveryView] = useState(initialView); // 'trending' or 'top_devs'

  useEffect(() => {
    const q = queryParams.get('q') || '';
    const v = queryParams.get('view');
    setSearchQuery(q);
    if (q) setHasSearched(true);
    if (v) setDiscoveryView(v);
  }, [location.search]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setProjects([]);
      setBlogs([]);
      setUsers([]);
      return;
    }
    const run = async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const [projectsRes, blogsRes, usersRes] = await Promise.all([
          api.get(`/projects?keyword=${searchQuery}`),
          api.get(`/blogs?keyword=${searchQuery}`),
          api.get(`/users?keyword=${searchQuery}`),
        ]);
        setProjects(projectsRes.data);
        setBlogs(blogsRes.data);
        setUsers(usersRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(run, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, trendsRes] = await Promise.all([
          api.get('/users/top'),
          api.get('/projects/trends')
        ]);
        setTopUsers(usersRes.data);
        setTrendingTags(trendsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const allResults = activeTab === 'projects'
    ? [...projects.map(p => ({ ...p, type: 'project' })), ...blogs.map(b => ({ ...b, type: 'blog' }))]
    : users;

  return (
    <div className="w-full min-h-screen">
      {/* Search header - clean sticky offset on mobile */}
      <div className="sticky top-0 sm:top-0 z-40 bg-kernel-950/95 backdrop-blur-md border-b border-kernel-700 shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-kernel-950 hover:bg-zinc-200 transition-colors font-mono text-xs font-bold rounded-4xl border border-kernel-600 shadow-sm cursor-pointer shrink-0">
            <ArrowLeft size={14} /> cd ..
          </button>
          <div className="flex-1 flex items-center gap-3 bg-kernel-900 border border-kernel-600 focus-within:border-blue-500 px-3.5 py-2 transition-all rounded-lg shadow-sm">
            <Command size={16} className="text-kernel-300 shrink-0" />
            <input
              type="text"
              autoComplete="off"
              className="flex-1 bg-transparent text-white placeholder-kernel-400 focus:outline-none font-mono text-sm"
              placeholder="Search projects, journals, developers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-kernel-400 hover:text-white font-mono text-xs transition-colors px-1.5 py-0.5 rounded bg-kernel-800"
              >
                esc
              </button>
            )}
          </div>
        </div>
        {hasSearched && (
          <div className="flex border-t border-kernel-700 bg-kernel-900/50">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-5 py-2.5 font-mono text-xs transition-colors relative ${activeTab === 'projects' ? 'text-white font-bold bg-kernel-900' : 'text-kernel-400 hover:text-kernel-200'}`}
            >
              <GitBranch size={14} />
              repos & journals
              {activeTab === 'projects' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-2.5 font-mono text-xs transition-colors relative ${activeTab === 'users' ? 'text-white font-bold bg-kernel-900' : 'text-kernel-400 hover:text-kernel-200'}`}
            >
              <Users size={14} />
              developers
              {users.length > 0 && <span className="ml-1 text-blue-400 font-bold">({users.length})</span>}
              {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-12 flex justify-center">
          <div className="font-mono text-xs text-blue-400 font-bold animate-pulse">$ searching_database...</div>
        </div>
      )}

      {/* Quick Filter Tag Badges */}
      {!isLoading && (
        <div className="px-4 py-2.5 border-b border-kernel-700 flex gap-2 overflow-x-auto no-scrollbar bg-kernel-900/40">
          {['react', 'node', 'python', 'rust', 'nextjs', 'typescript', 'ai', 'web3'].map(stack => (
            <button
              key={stack}
              onClick={() => setSearchQuery(stack)}
              className={`px-3 py-1 font-mono text-[11px] font-bold uppercase rounded border transition-all ${searchQuery.toLowerCase() === stack ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]' : 'bg-kernel-900 border-kernel-700 text-kernel-300 hover:border-kernel-500 hover:text-white'}`}
            >
              #{stack}
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {!isLoading && hasSearched && (
        <div>
          {activeTab === 'projects' ? (
            allResults.length > 0 ? (
              <div className="divide-y divide-kernel-700">
                {allResults.map(item =>
                  item.type === 'project'
                    ? <ProjectCard key={`p-${item._id}`} project={item} />
                    : <BlogCard key={`b-${item._id}`} blog={item} />
                )}
              </div>
            ) : (
              <div className="py-16 text-center px-6">
                <p className="font-mono text-sm text-kernel-400 mb-1">$ grep -r "{searchQuery}" ./kernel/</p>
                <p className="font-mono text-xs text-kernel-500">No matches found in database.</p>
              </div>
            )
          ) : (
            <div className="divide-y divide-kernel-700">
              {users.length > 0 ? users.map(u => (
                <Link
                  to={`/profile/${u._id}`}
                  key={u._id}
                  className="flex items-center gap-3.5 px-5 py-4 border-b border-kernel-700 hover:bg-kernel-900/60 transition-colors group"
                >
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.name} className="w-11 h-11 rounded-full object-cover border-2 border-kernel-600 shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-kernel-800 border-2 border-kernel-600 flex items-center justify-center font-mono text-base font-bold text-white shrink-0 shadow-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-base group-hover:underline truncate">{u.name}</p>
                    <p className="font-mono text-xs text-kernel-400 truncate">@{u.name.toLowerCase().replace(/\s+/g, '_')}</p>
                    {u.bio && <p className="text-xs text-kernel-300 truncate mt-1">{u.bio}</p>}
                    {u.skills?.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {u.skills.slice(0, 5).map((s, i) => (
                          <span key={i} className="font-mono text-[10px] font-bold text-kernel-200 bg-kernel-900 border border-kernel-700 px-2 py-0.5 rounded uppercase">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-kernel-500 group-hover:text-blue-400 transition-colors shrink-0" />
                </Link>
              )) : (
                <div className="py-16 text-center px-6">
                  <p className="font-mono text-xs text-kernel-500">No developers matched "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Discovery: Dynamic Database Trending Tags or Top Developers */}
      {!hasSearched && (
        <div className="px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                {discoveryView === 'trending' ? 'Trending in Kernel' : 'Top Developers'}
              </h2>
            </div>
            <button
              onClick={() => setDiscoveryView(discoveryView === 'trending' ? 'top_devs' : 'trending')}
              className="font-mono text-xs text-blue-400 hover:text-white transition-all uppercase tracking-wider border border-blue-500/40 hover:border-blue-400 px-3 py-1.5 bg-blue-500/10 rounded-md font-bold cursor-pointer"
            >
              Explore {discoveryView === 'trending' ? 'Top Devs' : 'Trending Tags'}
            </button>
          </div>

          <div className="divide-y divide-kernel-700 border-2 border-kernel-700 rounded-xl overflow-hidden bg-kernel-900/50 shadow-md">
            {discoveryView === 'trending' ? (
              trendingTags.map(({ tag, category, posts, count }, i) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-kernel-900 transition-all group text-left cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs mb-1">
                      <span className="font-bold text-kernel-400">{i + 1}</span>
                      <span className="text-kernel-600">·</span>
                      <span className="text-blue-400 font-bold uppercase tracking-wide">{category || 'Tech'}</span>
                    </div>
                    <div className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      #{tag}
                    </div>
                    <div className="font-mono text-xs text-kernel-400 mt-1 flex items-center gap-1.5">
                      <span>{posts || count} posts</span>
                      <Sparkles size={11} className="text-kernel-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-kernel-400 opacity-0 group-hover:opacity-100 transition-opacity">search tag</span>
                    <ArrowRight size={16} className="text-kernel-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </button>
              ))
            ) : (
              topUsers.map((u, i) => (
                <Link
                  to={`/profile/${u._id}`}
                  key={u._id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-kernel-900 transition-colors group"
                >
                  <div className="font-mono text-xs font-bold text-kernel-400 w-5">{i + 1}</div>
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.name} className="w-11 h-11 rounded-full object-cover border-2 border-kernel-600 shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-kernel-800 border-2 border-kernel-600 flex items-center justify-center font-mono text-sm font-bold text-white shrink-0 shadow-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm group-hover:underline truncate">{u.name}</p>
                    <p className="font-mono text-xs text-kernel-400 truncate">
                      {u.followers?.length || 0} followers · {u.skills?.slice(0, 2).join(', ') || 'Developer'}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-kernel-500 group-hover:text-blue-400 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      <div className="h-24 sm:h-6" />
    </div>
  );
}
