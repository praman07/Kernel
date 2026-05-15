import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Code, Link as LinkIcon, Code2, TerminalSquare, ExternalLink, ChevronRight, Search, Loader2 } from 'lucide-react';

export default function CreateProject() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    githubLink: '',
    liveLink: ''
  });

  const [githubUsername, setGithubUsername] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [showRepoList, setShowRepoList] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchGithubRepos = async () => {
    if (!githubUsername) {
      toast.error('Enter a GitHub username');
      return;
    }
    setIsFetchingRepos(true);
    setShowRepoList(true);
    try {
      const response = await axios.get(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
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
      tags: repo.topics ? repo.topics.join(', ') : (repo.language ? repo.language.toLowerCase() : ''),
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
    <div className="max-w-3xl mx-auto py-8">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
          <TerminalSquare className="text-kernel-500" />
          init_repository
        </h1>
        <p className="text-kernel-500 font-mono text-xs mt-2">Create a new project record in the Kernel database.</p>
      </div>

      <div className="bg-kernel-950 border border-kernel-800 shadow-hard">
        <div className="bg-kernel-900 border-b border-kernel-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="ml-4 font-mono text-[10px] text-kernel-500">kernel-cli --new</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-kernel-600 animate-pulse">SYSTEM_ONLINE</span>
          </div>
        </div>

        {/* GitHub Import Section */}
        <div className="p-6 border-b border-kernel-800 bg-kernel-900/20">
          <label className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest mb-3 block">Quick Import from GitHub</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-kernel-600" />
              <input
                type="text"
                placeholder="github_username"
                className="w-full bg-kernel-950 border border-kernel-800 p-2 pl-9 text-kernel-200 font-mono text-sm focus:outline-none focus:border-kernel-600 transition-colors"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), fetchGithubRepos())}
              />
            </div>
            <button
              type="button"
              onClick={fetchGithubRepos}
              className="bg-kernel-800 hover:bg-kernel-700 text-kernel-200 px-4 py-2 font-mono text-xs border border-kernel-700 transition-colors flex items-center gap-2"
            >
              {isFetchingRepos ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              FETCH
            </button>
          </div>

          {showRepoList && (
            <div className="mt-4 border border-kernel-800 bg-kernel-950 max-h-60 overflow-y-auto">
              {isFetchingRepos ? (
                <div className="p-4 text-center text-kernel-600 font-mono text-xs italic">
                  Scanning repositories...
                </div>
              ) : githubRepos.length > 0 ? (
                <div className="divide-y divide-kernel-900">
                  {githubRepos.map(repo => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => importRepo(repo)}
                      className="w-full text-left p-3 hover:bg-kernel-900 transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0">
                        <p className="text-kernel-200 font-mono text-sm font-bold truncate group-hover:text-blue-400">{repo.name}</p>
                        <p className="text-kernel-600 font-mono text-[10px] truncate">{repo.description || 'No description'}</p>
                      </div>
                      <ChevronRight size={14} className="text-kernel-800 group-hover:text-kernel-400 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-kernel-600 font-mono text-xs italic">
                  No public repositories found.
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Repository Name *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full bg-kernel-900 border border-kernel-700 p-3 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-400 font-mono transition-colors"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. quantum-router"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">README.md (Description) *</label>
              <div className="flex bg-kernel-900 border border-kernel-800 p-0.5 rounded-sm">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className={`px-3 py-1 font-mono text-[10px] uppercase transition-colors ${!isPreview ? 'bg-kernel-800 text-kernel-100 shadow-sm' : 'text-kernel-600 hover:text-kernel-400'}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className={`px-3 py-1 font-mono text-[10px] uppercase transition-colors ${isPreview ? 'bg-kernel-800 text-kernel-100 shadow-sm' : 'text-kernel-600 hover:text-kernel-400'}`}
                >
                  Preview
                </button>
              </div>
            </div>
            {!isPreview ? (
              <textarea
                name="description"
                required
                rows="8"
                className="w-full bg-kernel-900 border border-kernel-700 p-3 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-400 font-mono transition-colors resize-none"
                value={formData.description}
                onChange={handleChange}
                placeholder="# Project Title\n\nExplain what it does..."
              />
            ) : (
              <div className="w-full bg-kernel-900 border border-kernel-700 p-4 min-h-[212px] text-kernel-200 font-mono text-sm overflow-y-auto prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-kernel-950">
                {formData.description ? (
                  <div className="whitespace-pre-wrap">{formData.description}</div>
                ) : (
                  <span className="text-kernel-700 italic">Nothing to preview...</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Tech Stack Tags</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-kernel-600">
                <Code size={16} />
              </div>
              <input
                type="text"
                name="tags"
                className="w-full bg-kernel-900 border border-kernel-700 p-3 pl-10 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-400 font-mono transition-colors"
                value={formData.tags}
                onChange={handleChange}
                placeholder="rust, wasm, networking (comma separated)"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-kernel-800">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Git Source URL</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-kernel-600">
                  <Code2 size={16} />
                </div>
                <input
                  type="url"
                  name="githubLink"
                  className="w-full bg-kernel-900 border border-kernel-700 p-3 pl-10 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-400 font-mono text-sm transition-colors"
                  value={formData.githubLink}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">Production URL</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-kernel-600">
                  <LinkIcon size={16} />
                </div>
                <input
                  type="url"
                  name="liveLink"
                  className="w-full bg-kernel-900 border border-kernel-700 p-3 pl-10 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-400 font-mono text-sm transition-colors"
                  value={formData.liveLink}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>



          <div className="flex justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="px-6 py-2.5 font-mono text-sm text-kernel-400 hover:text-kernel-100 border border-transparent hover:border-kernel-700 transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-kernel-200 hover:bg-white text-kernel-950 px-8 py-2.5 font-mono font-bold text-sm shadow-hard-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'executing...' : 'publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
