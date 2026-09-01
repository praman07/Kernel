import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Bookmarks() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        // Get the full user profile which has bookmarks array
        const { data: profile } = await api.get(`/users/${user._id}`);

        const bookmarkIds = profile.bookmarks || [];
        if (bookmarkIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch all projects and blogs, filter by bookmark IDs
        const [projectsRes, blogsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/blogs')
        ]);

        const allItems = [
          ...projectsRes.data.map(p => ({ ...p, type: 'project' })),
          ...blogsRes.data.map(b => ({ ...b, type: 'blog' }))
        ];

        const saved = allItems.filter(item =>
          bookmarkIds.some(bid => bid.toString() === item._id.toString())
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setBookmarkedItems(saved);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  return (
    <div className="w-full min-h-screen bg-kernel-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-kernel-950/80 backdrop-blur-md border-b border-kernel-800 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-kernel-950 hover:bg-zinc-200 transition-colors font-mono text-xs font-bold rounded-4xl border border-kernel-600 shadow-sm cursor-pointer">
          <ArrowLeft size={14} /> cd ..
        </button>
        <div className="flex items-center gap-2">
          <Bookmark size={18} className="text-kernel-400" />
          <h1 className="text-lg font-bold text-kernel-100">Saved</h1>
        </div>
      </div>

      {/* Subheader */}
      <div className="px-4 py-3 border-b border-kernel-800 bg-kernel-900/20">
        <p className="font-mono text-xs text-kernel-500">
          @{user?.name?.toLowerCase().replace(/\s+/g, '_')} · {bookmarkedItems.length} saved items
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kernel-500" />
        </div>
      ) : bookmarkedItems.length > 0 ? (
        <div>
          {bookmarkedItems.map(item =>
            item.type === 'project'
              ? <ProjectCard key={`p-${item._id}`} project={item} />
              : <BlogCard key={`b-${item._id}`} blog={item} />
          )}
        </div>
      ) : (
        <div className="py-20 text-center px-4">
          <Bookmark size={40} className="text-kernel-700 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-kernel-300 mb-2">Nothing saved yet</h2>
          <p className="font-mono text-xs text-kernel-500 mb-6">
            Tap the bookmark icon on any post to save it here for later.
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="font-mono text-xs text-blue-400 hover:underline"
          >
            → browse the feed
          </button>
        </div>
      )}

      <div className="h-24 sm:h-0" />
    </div>
  );
}
