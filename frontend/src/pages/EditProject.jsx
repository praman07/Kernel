import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Code, Link as LinkIcon, Code2, TerminalSquare, ExternalLink, ChevronRight, Search, Loader2 } from 'lucide-react';

export default function EditProject() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    githubLink: '',
    liveLink: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        
        // Ownership check
        if (data.creator !== user._id && data.creator._id !== user._id) {
          toast.error('Not authorized');
          navigate('/feed');
          return;
        }

        setFormData({
          title: data.title,
          description: data.description,
          tags: data.tags?.join(', ') || '',
          githubLink: data.githubLink || '',
          liveLink: data.liveLink || ''
        });
      } catch (error) {
        toast.error('Failed to fetch project');
        navigate('/feed');
      } finally {
        setIsFetching(false);
      }
    };
    fetchProject();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      await api.put(`/projects/${id}`, projectData);
      toast.success('repository updated');
      setTimeout(() => navigate('/feed'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'failed to update repository');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="max-w-3xl mx-auto py-20 font-mono text-xs text-kernel-500 animate-pulse">fetching repository data...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
          <TerminalSquare className="text-kernel-500" />
          patch_repository
        </h1>
        <p className="text-kernel-500 font-mono text-xs mt-2">Modify the existing project records.</p>
      </div>

      <div className="bg-kernel-950 border border-kernel-800 shadow-hard">
        <div className="bg-kernel-900 border-b border-kernel-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="ml-4 font-mono text-[10px] text-kernel-500">kernel-cli --patch {id.slice(0,8)}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-kernel-600 animate-pulse">EDIT_MODE</span>
          </div>
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
            <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">README.md (Description) *</label>
            <textarea
              name="description"
              required
              rows="6"
              className="w-full bg-kernel-900 border border-kernel-700 p-3 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-400 font-mono transition-colors resize-none"
              value={formData.description}
              onChange={handleChange}
              placeholder="# Project Title\n\nExplain what it does..."
            />
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
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 font-mono text-sm text-kernel-400 hover:text-kernel-100 border border-transparent hover:border-kernel-700 transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-kernel-200 hover:bg-white text-kernel-950 px-8 py-2.5 font-mono font-bold text-sm shadow-hard-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'executing...' : 'save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
