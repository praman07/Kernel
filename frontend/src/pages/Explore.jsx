import { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import { Command, Users, GitBranch, ArrowRight, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const TRENDING_TAGS = [
  { tag: 'sheryians', category: 'Education', posts: '5.4k' },
  { tag: 'mern', category: 'Fullstack', posts: '3.1k' },
  { tag: 'indiehackers', category: 'Business', posts: '2.2k' },
  { tag: 'typescript', category: 'Language', posts: '1.9k' },
  { tag: 'nextjs', category: 'Frontend', posts: '1.8k' },
  { tag: 'gsap', category: 'Animation', posts: '1.2k' },
];

export default function Explore() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [topUsers, setTopUsers] = useState([]);
  const [discoveryView, setDiscoveryView] = useState('trending'); // 'trending' or 'top_devs'

  useEffect(() => {
    const q = queryParams.get('q') || '';
    setSearchQuery(q);
    if (q) setHasSearched(true);
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
          axios.get(`http://localhost:5000/api/projects?keyword=${searchQuery}`),
          axios.get(`http://localhost:5000/api/blogs?keyword=${searchQuery}`),
          axios.get(`http://localhost:5000/api/users?keyword=${searchQuery}`),
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
    const fetchTop = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/top');
        setTopUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTop();
  }, []);

  const allResults = activeTab === 'projects'
    ? [...projects.map(p => ({ ...p, type: 'project' })), ...blogs.map(b => ({ ...b, type: 'blog' }))]
    : users;

  return (
    <div className="w-full min-h-screen">
      {/* Search header */}
      <div className="sticky top-0 z-40 bg-kernel-950/90 backdrop-blur-md border-b border-kernel-800">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 bg-kernel-900 border border-kernel-700 focus-within:border-kernel-500 px-3 py-2.5 transition-colors">
            <Command size={15} className="text-kernel-500 shrink-0" />
            <input
              type="text"
              autoComplete="off"
              className="flex-1 bg-transparent text-kernel-100 placeholder-kernel-600 focus:outline-none font-mono text-sm"
              placeholder="Search projects, journals, developers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-kernel-600 hover:text-kernel-300 font-mono text-xs transition-colors"
              >
                esc
              </button>
            )}
          </div>
        </div>
        {hasSearched && (
          <div className="flex border-t border-kernel-800">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs transition-colors relative ${activeTab === 'projects' ? 'text-kernel-100 font-bold' : 'text-kernel-500 hover:text-kernel-300'}`}
            >
              <GitBranch size={13} />
              repos & journals
              {activeTab === 'projects' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs transition-colors relative ${activeTab === 'users' ? 'text-kernel-100 font-bold' : 'text-kernel-500 hover:text-kernel-300'}`}
            >
              <Users size={13} />
              developers
              {users.length > 0 && <span className="ml-1 text-kernel-600">({users.length})</span>}
              {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-12 flex justify-center">
          <div className="font-mono text-xs text-kernel-500 animate-pulse">$ searching...</div>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && (
        <div>
          {activeTab === 'projects' ? (
            allResults.length > 0 ? (
              <div>
                {allResults.map(item =>
                  item.type === 'project'
                    ? <ProjectCard key={`p-${item._id}`} project={item} />
                    : <BlogCard key={`b-${item._id}`} blog={item} />
                )}
              </div>
            ) : (
              <div className="py-16 text-center px-6">
                <p className="font-mono text-sm text-kernel-600 mb-1">$ grep -r "{searchQuery}" ./kernel/</p>
                <p className="font-mono text-xs text-kernel-700">No matches found.</p>
              </div>
            )
          ) : (
            <div>
              {users.length > 0 ? users.map(u => (
                <Link
                  to={`/profile/${u._id}`}
                  key={u._id}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-kernel-800 hover:bg-kernel-900/30 transition-colors group"
                >
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.name} className="w-11 h-11 rounded-full object-cover border border-kernel-700 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-base font-bold text-kernel-300 shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-kernel-100 text-sm group-hover:underline truncate">{u.name}</p>
                    <p className="font-mono text-xs text-kernel-500 truncate">@{u.name.toLowerCase().replace(/\s+/g, '_')}</p>
                    {u.bio && <p className="text-xs text-kernel-400 truncate mt-0.5">{u.bio}</p>}
                    {u.skills?.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {u.skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="font-mono text-[10px] text-kernel-500 bg-kernel-900 border border-kernel-800 px-1.5 py-0.5 uppercase">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-kernel-700 group-hover:text-kernel-400 transition-colors shrink-0" />
                </Link>
              )) : (
                <div className="py-16 text-center px-6">
                  <p className="font-mono text-xs text-kernel-700">No developers matched "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Discovery: trending tags or top devs */}
      {!hasSearched && (
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-kernel-500" />
              <h2 className="font-mono text-xs font-bold text-kernel-400 uppercase tracking-widest">
                {discoveryView === 'trending' ? 'Trending in Kernel' : 'Top Developers'}
              </h2>
            </div>
            <button
              onClick={() => setDiscoveryView(discoveryView === 'trending' ? 'top_devs' : 'trending')}
              className="font-mono text-[10px] text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest border border-blue-500/20 px-2 py-1 bg-blue-500/5"
            >
              Explore {discoveryView === 'trending' ? 'Top Devs' : 'Trending Tags'}
            </button>
          </div>

          <div className="divide-y divide-kernel-800 border border-kernel-800 bg-kernel-900/20">
            {discoveryView === 'trending' ? (
              TRENDING_TAGS.map(({ tag, category, posts }, i) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-kernel-900/50 transition-colors group text-left"
                >
                  <div>
                    <div className="font-mono text-[10px] text-kernel-600 mb-0.5">{i + 1} · {category}</div>
                    <div className="font-bold text-kernel-100 text-sm group-hover:text-blue-400 transition-colors">
                      #{tag}
                    </div>
                    <div className="font-mono text-[10px] text-kernel-600 mt-0.5">{posts} posts</div>
                  </div>
                  <ArrowRight size={14} className="text-kernel-700 group-hover:text-kernel-400 transition-colors" />
                </button>
              ))
            ) : (
              topUsers.map((u, i) => (
                <Link
                  to={`/profile/${u._id}`}
                  key={u._id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-kernel-900/50 transition-colors group"
                >
                  <div className="font-mono text-[10px] text-kernel-700 w-4">{i + 1}</div>
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-kernel-700 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-sm font-bold text-kernel-300 shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-kernel-100 text-sm group-hover:underline truncate">{u.name}</p>
                    <p className="font-mono text-[10px] text-kernel-500 truncate">
                      {u.followers?.length || 0} followers · {u.skills?.slice(0, 2).join(', ') || 'Developer'}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-kernel-700 group-hover:text-kernel-400 transition-colors" />
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
