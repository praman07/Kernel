import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Code, Link as LinkIcon, Code2, TerminalSquare, ExternalLink, ChevronRight, Search, Loader2, ArrowLeft } from 'lucide-react';

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
      setTimeout(() => navigate('/feed', { replace: true }), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'failed to update repository');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="max-w-3xl mx-auto py-20 font-mono text-xs text-kernel-500 animate-pulse">fetching repository data...</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Toaster position="top-right" />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
            <TerminalSquare className="text-kernel-500" />
            patch_repository
          </h1>
          <p className="text-kernel-500 font-mono text-xs mt-1">Modify the existing project records.</p>
        </div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-kernel-950 hover:bg-zinc-200 transition-colors font-mono text-xs font-bold rounded-full border border-kernel-600 shadow-sm cursor-pointer shrink-0">
          <ArrowLeft size={14} /> cd ..
        </button>
      </div>

      <div className="bg-kernel-900/60 border border-kernel-700 rounded-xl overflow-hidden shadow-lg">
        {/* Terminal Header */}
        <div className="bg-kernel-900 px-6 py-3.5 flex items-center justify-between border-b border-kernel-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="ml-4 font-mono text-xs text-kernel-400">kernel-cli --patch {id.slice(0,8)}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-kernel-500 animate-pulse">EDIT_MODE</span>
          </div>
        </div>

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
            <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-widest">README.md (Description) *</label>
            <textarea
              name="description"
              required
              rows="8"
              className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-3 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono transition-colors resize-none leading-relaxed text-sm"
              value={formData.description}
              onChange={handleChange}
              placeholder="# Project Title&#10;&#10;Explain what it does..."
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

          <div className="grid md:grid-cols-2 gap-5 pt-2">
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

          <div className="flex justify-end gap-3 pt-6 border-t border-kernel-800/60">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 font-mono text-xs font-bold text-kernel-300 hover:text-white bg-kernel-800 hover:bg-kernel-700 border border-kernel-600 rounded-lg transition-colors cursor-pointer"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white hover:bg-zinc-200 text-kernel-950 px-6 py-2.5 font-mono font-bold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isLoading ? 'executing...' : 'save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
