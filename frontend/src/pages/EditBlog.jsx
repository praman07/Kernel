import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Hash, Link as LinkIcon } from 'lucide-react';

export default function EditBlog() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    tags: ''
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await api.get(`/blogs/${id}`);
        
        // Ownership check
        if (data.author !== user._id && data.author._id !== user._id) {
          toast.error('Not authorized');
          navigate('/feed');
          return;
        }

        setFormData({
          title: data.title,
          content: data.content,
          tags: data.tags?.join(', ') || ''
        });
      } catch (error) {
        toast.error('Failed to fetch journal');
        navigate('/feed');
      } finally {
        setIsFetching(false);
      }
    };
    fetchBlog();
  }, [id, user, navigate]);

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

      await api.put(`/blogs/${id}`, blogData);
      toast.success('Journal updated');
      setTimeout(() => navigate('/feed'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="max-w-3xl mx-auto py-20 font-mono text-xs text-kernel-500 animate-pulse">fetching journal entry...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
          <FileText className="text-kernel-500" />
          patch_journal
        </h1>
        <p className="text-kernel-500 font-mono text-xs mt-2">Modify your previously committed engineering thoughts.</p>
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

          <div className="relative">
            <textarea
              name="content"
              required
              rows="16"
              className="w-full bg-kernel-950 border border-kernel-800 p-4 text-kernel-300 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-serif leading-relaxed transition-colors resize-y"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write using markdown. Start dumping knowledge..."
            />
            <div className="absolute bottom-4 right-4 text-kernel-600 font-mono text-[10px] pointer-events-none">
              Markdown Supported
            </div>
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
              onClick={() => navigate(-1)}
              className="px-4 py-2 font-mono text-xs text-kernel-500 hover:text-kernel-300 transition-colors"
            >
              abort
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-kernel-200 hover:bg-white text-kernel-950 px-8 py-2.5 font-mono font-bold text-sm shadow-hard-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'updating...' : 'save_changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
