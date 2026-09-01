import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Trash2, Edit3, FileText, Clock, Share2 } from 'lucide-react';
import TextWithHashtags from '../components/TextWithHashtags';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await api.get(`/blogs/${id}`);
        setBlog(data);
      } catch (error) {
        console.error('Error fetching blog', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Delete this journal?')) {
      try {
        await api.delete(`/blogs/${id}`);
        toast.success('Journal deleted');
        setTimeout(() => navigate('/feed'), 1000);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Deletion failed');
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/blogs/${id}/comment`, { text: commentText });
      setBlog({ ...blog, comments: [...blog.comments, data] });
      setCommentText('');
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="max-w-3xl mx-auto py-20 font-mono text-xs text-kernel-500 animate-pulse">fetching journal...</div>;
  if (!blog) return <div className="max-w-3xl mx-auto py-20 font-mono text-xs text-red-500">error: journal not found.</div>;

  const isOwner = user && blog.author && user._id === blog.author._id;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Toaster position="top-right" />
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-kernel-950 hover:bg-zinc-200 transition-colors font-mono text-xs font-bold rounded-4xl border border-kernel-600 shadow-sm cursor-pointer">
          <ArrowLeft size={14} /> cd ..
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Journal link copied to clipboard!');
              }
            }} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-kernel-900 hover:bg-kernel-800 text-zinc-300 hover:text-white font-mono text-xs font-bold rounded-md border border-kernel-700 shadow-sm cursor-pointer transition-colors"
          >
            <Share2 size={13} /> share
          </button>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link to={`/edit-blog/${id}`} className="font-mono text-xs text-blue-500 hover:bg-blue-500/10 px-2 py-1 transition-colors flex items-center gap-2">
                <Edit3 size={12} /> edit
              </Link>
              <button onClick={handleDelete} className="font-mono text-xs text-red-500 hover:bg-red-500/10 px-2 py-1 transition-colors flex items-center gap-2 bg-transparent border-none cursor-pointer">
                <Trash2 size={12} /> rm
              </button>
            </div>
          )}
        </div>
      </div>

      <article className="bg-kernel-950 border border-kernel-800 shadow-hard p-6 md:p-12">
        
        {/* Meta Header */}
        <div className="flex flex-col gap-4 mb-10 border-b border-kernel-800 pb-8">
          <div className="flex items-center gap-2 font-mono text-xs text-kernel-500 uppercase">
            <FileText size={14} />
            <span>journal_entry</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-kernel-100 leading-tight tracking-tight">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between mt-4">
            <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-3 group">
              {blog.author?.profilePicture ? (
                <img src={blog.author.profilePicture} alt={blog.author.name} className="w-8 h-8 rounded-none border border-kernel-700 object-cover transition-all" />
              ) : (
                <div className="w-8 h-8 bg-kernel-900 border border-kernel-700 flex items-center justify-center font-mono text-xs text-kernel-300">
                  {blog.author?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-mono text-sm text-kernel-300 group-hover:text-kernel-100 transition-colors">{blog.author?.name || 'anonymous'}</span>
                <div className="flex items-center gap-1 font-mono text-[10px] text-kernel-500">
                  <Clock size={10} /> {moment(blog.createdAt).format('YYYY-MM-DD')}
                </div>
              </div>
            </Link>

            <div className="flex flex-wrap gap-2">
              {blog.tags?.map((tag, index) => (
                <span key={index} className="px-2 py-0.5 border border-kernel-800 text-kernel-400 font-mono text-[10px] uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>



        {/* Content */}
        <div className="prose prose-invert max-w-none prose-p:text-kernel-300 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-kernel-100 whitespace-pre-wrap font-sans">
          <TextWithHashtags text={blog.content} />
        </div>
      </article>

      {/* Comments Section */}
      <div className="p-6 md:p-8 border border-kernel-800 bg-kernel-950 mt-6">
        <h3 className="font-mono text-xs font-bold text-kernel-500 uppercase tracking-widest mb-6">Discussion</h3>
        
        {user ? (
          <form onSubmit={submitComment} className="flex gap-3 mb-8">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="You" className="w-8 h-8 object-cover border border-kernel-700 shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-kernel-900 border border-kernel-700 flex items-center justify-center font-mono text-xs text-kernel-400 shrink-0">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <input 
              type="text" 
              placeholder="Leave a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-transparent border-b border-kernel-700 focus:border-blue-500 outline-none text-kernel-100 text-sm font-mono pb-2 transition-colors placeholder-kernel-600"
            />
            <button type="submit" disabled={!commentText.trim()} className="px-4 py-1 text-xs font-mono font-bold bg-kernel-100 text-kernel-950 hover:bg-white disabled:opacity-50 transition-colors h-8 shadow-hard-sm cursor-pointer">
              Submit
            </button>
          </form>
        ) : (
          <div className="p-4 mb-8 bg-kernel-900 border border-kernel-800 rounded-lg flex items-center justify-between font-mono text-xs text-kernel-400">
            <span>Login to join the discussion on this journal.</span>
            <Link to="/login" className="px-3 py-1.5 bg-white text-kernel-950 font-bold rounded hover:bg-zinc-200 transition-colors">
              login
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {blog.comments?.map((comment, index) => (
            <div key={index} className="flex gap-3">
              <Link to={`/profile/${comment.user?._id}`} className="shrink-0">
                {comment.user?.profilePicture ? (
                  <img src={comment.user.profilePicture} alt="User" className="w-8 h-8 object-cover border border-kernel-700" />
                ) : (
                  <div className="w-8 h-8 bg-kernel-900 border border-kernel-700 flex items-center justify-center font-mono text-xs text-kernel-400">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/profile/${comment.user?._id}`} className="font-bold text-kernel-100 text-sm hover:underline">{comment.user?.name}</Link>
                  <span className="text-[10px] font-mono text-kernel-600">
                    {moment(comment.createdAt).fromNow()}
                  </span>
                </div>
                <p className="text-kernel-300 text-sm">
                  <TextWithHashtags text={comment.text} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
