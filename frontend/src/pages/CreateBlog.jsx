import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Hash, Link as LinkIcon, ArrowLeft } from 'lucide-react';

export default function CreateBlog() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      const blogData = {
        ...formData,
        tags: tagsArray
      };

      const { data } = await api.post('/blogs', blogData);
      toast.success('Journal published');
      setTimeout(() => navigate('/feed'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Toaster position="top-right" />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
            <FileText className="text-kernel-500" />
            write_journal
          </h1>
          <p className="text-kernel-500 font-mono text-xs mt-2">Publish raw engineering thoughts, tutorials, or updates.</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-kernel-950 hover:bg-zinc-200 transition-colors font-mono text-xs font-bold rounded-4xl border border-kernel-600 shadow-sm cursor-pointer shrink-0">
          <ArrowLeft size={14} /> cd ..
        </button>
      </div>

      <div className="bg-kernel-950 border border-kernel-800 shadow-hard p-1">
        <form onSubmit={handleSubmit} className="bg-kernel-900 border border-kernel-800 p-6 md:p-8 flex flex-col gap-6">
          
          <input
            type="text"
            name="title"
            required
            className="w-full bg-transparent border-none text-2xl md:text-3xl font-bold text-kernel-100 placeholder-kernel-700 focus:outline-none transition-colors"
            value={formData.title}
            onChange={handleChange}
            placeholder="Journal Title..."
          />

          <div className="flex bg-kernel-950 border border-kernel-800 p-0.5 rounded-sm self-start mb-[-12px] z-10 ml-4">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`px-4 py-1.5 font-mono text-[11px] uppercase transition-colors ${!isPreview ? 'bg-kernel-800 text-kernel-100 shadow-sm' : 'text-kernel-600 hover:text-kernel-400'}`}
            >
              Compose
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`px-4 py-1.5 font-mono text-[11px] uppercase transition-colors ${isPreview ? 'bg-kernel-800 text-kernel-100 shadow-sm' : 'text-kernel-600 hover:text-kernel-400'}`}
            >
              Preview
            </button>
          </div>

          <div className="relative">
            {!isPreview ? (
              <textarea
                name="content"
                required
                rows="16"
                className="w-full bg-kernel-950 border border-kernel-800 p-4 text-kernel-300 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-serif leading-relaxed transition-colors resize-y"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write using markdown. Start dumping knowledge..."
              />
            ) : (
              <div className="w-full bg-kernel-950 border border-kernel-800 p-8 min-h-[420px] text-kernel-200 font-mono text-sm overflow-y-auto prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black">
                {formData.content ? (
                  <div className="whitespace-pre-wrap">{formData.content}</div>
                ) : (
                  <span className="text-kernel-700 italic">No bytes to display...</span>
                )}
              </div>
            )}
            {!isPreview && (
              <div className="absolute bottom-4 right-4 text-kernel-600 font-mono text-[10px] pointer-events-none">
                Markdown Supported
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 bg-kernel-950 border border-kernel-800 p-2 pl-4">
            <Hash size={16} className="text-kernel-600" />
            <input
              type="text"
              name="tags"
              className="w-full bg-transparent border-none text-kernel-300 placeholder-kernel-700 focus:outline-none font-mono text-sm"
              value={formData.tags}
              onChange={handleChange}
              placeholder="comma, separated, tags"
            />
          </div>



          <div className="flex justify-between items-center pt-6 border-t border-kernel-800">
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="px-4 py-2 font-mono text-xs text-kernel-500 hover:text-kernel-300 transition-colors"
            >
              abort
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-kernel-200 hover:bg-white text-kernel-950 px-8 py-2.5 font-mono font-bold text-sm shadow-hard-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'committing...' : 'commit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
