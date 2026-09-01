import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Code, Link as LinkIcon, Code2, TerminalSquare, ExternalLink, ChevronRight, Search, Loader2, ArrowLeft } from 'lucide-react';

export default function CreateProject() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    githubLink: '',
    liveLink: ''
  });

  const [githubUsername, setGithubUsername] = useState(user?.socialLinks?.github || '');
  const [githubRepos, setGithubRepos] = useState([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [showRepoList, setShowRepoList] = useState(false);

  useEffect(() => {
    if (user?.socialLinks?.github) {
      setGithubUsername(user.socialLinks.github);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchGithubRepos = async (uname = githubUsername) => {
    if (!uname) {
      toast.error('Enter a GitHub username');
      return;
    }
    setIsFetchingRepos(true);
    setShowRepoList(true);
    try {
      const response = await axios.get(`https://api.github.com/users/${uname}/repos?sort=updated&per_page=15`);
      setGithubRepos(response.data);
    } catch (error) {
      toast.error('Failed to fetch repositories. Check the username.');
      setShowRepoList(false);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const importRepo = (repo) => {
    setFormData({
      title: repo.name,
      description: repo.description || '',
      tags: repo.topics && repo.topics.length > 0 ? repo.topics.join(', ') : (repo.language ? repo.language.toLowerCase() : ''),
      githubLink: repo.html_url,
      liveLink: repo.homepage || ''
    });
    setShowRepoList(false);
    toast.success(`Imported ${repo.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      const projectData = {
        ...formData,
        tags: tagsArray
      };

      const { data } = await api.post('/projects', projectData);
      toast.success('repository initialized');
      setTimeout(() => navigate('/feed'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'failed to initialize repository');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Toaster position="top-right" />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
            <TerminalSquare className="text-kernel-500" />
            init_repository
          </h1>
          <p className="text-kernel-500 font-mono text-xs mt-1">Create a new project record in the Kernel database.</p>
        </div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-kernel-950 hover:bg-zinc-200 transition-colors font-mono text-xs font-bold rounded-full border border-kernel-600 shadow-sm cursor-pointer shrink-0">
          <ArrowLeft size={14} /> cd ..
        </button>
      </div>

      <div className="bg-kernel-900/60 border border-kernel-700 rounded-xl overflow-hidden shadow-lg">
        {/* Terminal Header */}
        <div className="bg-kernel-900 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="ml-4 font-mono text-xs text-kernel-400">kernel-cli --new</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-kernel-500 animate-pulse">SYSTEM_ONLINE</span>
          </div>
        </div>

        {/* GitHub Quick Import */}
        <div className="p-5 sm:p-6 bg-kernel-950/40 border-b border-kernel-800">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">Quick Import from GitHub</label>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ExternalLink size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kernel-500" />
              <input
                type="text"
                placeholder="github_username"
                className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 pl-9 text-kernel-100 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), fetchGithubRepos())}
              />
            </div>
            <button
              type="button"
              onClick={() => fetchGithubRepos()}
              className="bg-kernel-800 hover:bg-kernel-700 text-kernel-100 px-4 py-2.5 font-mono text-xs border border-kernel-700 rounded-lg transition-colors flex items-center gap-2 font-bold cursor-pointer"
            >
              {isFetchingRepos ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              FETCH REPOS
            </button>
          </div>

          {showRepoList && (
            <div className="mt-3 border border-kernel-700 bg-kernel-950 rounded-lg max-h-60 overflow-y-auto shadow-inner">
              {isFetchingRepos ? (
                <div className="p-4 text-center text-kernel-500 font-mono text-xs italic flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Scanning repositories...
                </div>
              ) : githubRepos.length > 0 ? (
                <div className="divide-y divide-kernel-900">
                  {githubRepos.map(repo => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => importRepo(repo)}
                      className="w-full text-left p-3 hover:bg-kernel-900/80 transition-colors flex items-center justify-between group disabled:opacity-50 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-kernel-200 font-mono text-sm font-bold truncate group-hover:text-blue-400">{repo.name}</p>
                        <p className="text-kernel-500 font-mono text-[11px] truncate">{repo.description || 'No description available'}</p>
                      </div>
                      <ChevronRight size={14} className="text-kernel-600 group-hover:text-kernel-300 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-kernel-500 font-mono text-xs italic">
                  No public repositories found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Repository Name *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-3 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono transition-colors"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. quantum-router"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest block mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows="8"
              className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-3 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono transition-colors resize-none leading-relaxed text-sm"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain what it does..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Tech Stack Tags</label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-kernel-500">
                <Code size={16} />
              </div>
              <input
                type="text"
                name="tags"
                className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-3 pl-10 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono transition-colors text-sm"
                value={formData.tags}
                onChange={handleChange}
                placeholder="rust, wasm, networking (comma separated)"
              />
            </div>
          </div>

          {/* Links Section */}
          <div className="grid md:grid-cols-2 gap-5 pt-2">
            {/* Git Source URL */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Git Source URL</label>
                {formData.githubLink && (
                  <a 
                    href={formData.githubLink.startsWith('http') ? formData.githubLink : `https://${formData.githubLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                  >
                    test link <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-kernel-500">
                  <Code2 size={16} />
                </div>
                <input
                  type="text"
                  name="githubLink"
                  className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-3 pl-10 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                  value={formData.githubLink}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
            
            {/* Production URL */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Production URL</label>
                {formData.liveLink && (
                  <a 
                    href={formData.liveLink.startsWith('http') ? formData.liveLink : `https://${formData.liveLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                  >
                    test link <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-kernel-500">
                  <LinkIcon size={16} />
                </div>
                <input
                  type="text"
                  name="liveLink"
                  className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-3 pl-10 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                  value={formData.liveLink}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-kernel-800">
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="px-5 py-2.5 font-mono text-xs font-bold text-kernel-300 hover:text-white bg-kernel-800 hover:bg-kernel-700 border border-kernel-600 rounded-lg transition-colors cursor-pointer"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white hover:bg-zinc-200 text-kernel-950 px-7 py-2.5 font-mono font-bold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'executing...' : 'publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

