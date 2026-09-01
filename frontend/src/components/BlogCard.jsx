import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle, Heart, Bookmark, BookOpen, Share2, Check } from 'lucide-react';
import TextWithHashtags from './TextWithHashtags';

export default function BlogCard({ blog }) {
  const { user } = useContext(AuthContext);
  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(user && blog.likes?.some(id => id.toString() === user._id));
  const [commentsCount] = useState(blog.comments?.length || 0);
  const [isBookmarked, setIsBookmarked] = useState(user && user.bookmarks?.some(id => id.toString() === blog._id));
  const [copied, setCopied] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setIsLiked(prev => !prev);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      const { data } = await api.post(`/blogs/${blog._id}/like`);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (err) {
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setIsBookmarked(prev => !prev);
    try {
      const { data } = await api.post(`/users/bookmark/${blog._id}`);
      setIsBookmarked(data.isBookmarked);
    } catch (err) {
      setIsBookmarked(prev => !prev);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/blog/${blog._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handle = blog.author?.name?.toLowerCase().replace(/\s+/g, '_') || 'anon';
  const readTime = Math.max(1, Math.ceil((blog.content?.split(' ').length || 0) / 200));

  return (
    <article className="bg-kernel-900/60 border border-kernel-700 hover:border-kernel-600 rounded-xl p-5 sm:p-6 transition-all duration-150 flex gap-3 sm:gap-4 shadow-sm">
      {/* Avatar */}
      <Link to={`/profile/${blog.author?._id}`} className="shrink-0 mt-0.5">
        {blog.author?.profilePicture ? (
          <img
            src={blog.author.profilePicture}
            alt={blog.author.name}
            className="w-10 h-10 rounded-full object-cover border border-kernel-700 hover:ring-2 hover:ring-kernel-600 transition-all"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-sm font-bold text-kernel-200">
            {blog.author?.name?.charAt(0)?.toUpperCase() || 'K'}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-1.5 flex-wrap mb-2">
          <Link to={`/profile/${blog.author?._id}`} className="font-bold text-white hover:underline text-sm">
            {blog.author?.name || 'Unknown'}
          </Link>
          <span className="font-mono text-xs text-kernel-400">@{handle}</span>
          <span className="text-kernel-600">·</span>
          <span className="font-mono text-xs text-kernel-400">{moment(blog.createdAt).fromNow()}</span>
        </div>

        {/* Content preview */}
        <p className="text-zinc-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words font-sans">
          <TextWithHashtags text={blog.content?.length > 200
            ? blog.content.slice(0, 200) + '…'
            : blog.content} />
        </p>

        {/* Blog card */}
        <Link
          to={`/blog/${blog._id}`}
          className="block border border-kernel-600 bg-kernel-900/90 hover:border-blue-400 transition-colors mb-3 overflow-hidden shadow-md rounded-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-kernel-900 border-b border-kernel-700/80 px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen size={14} className="text-purple-400 shrink-0" />
              <span className="font-mono text-xs font-bold text-white tracking-wide truncate">{blog.title}</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-300 font-medium shrink-0 bg-kernel-950 px-2 py-0.5 border border-kernel-700 rounded">{readTime} min read</span>
          </div>

          {blog.tags?.length > 0 && (
            <div className="px-3.5 py-2 flex flex-wrap gap-1.5 bg-kernel-950/80">
              {blog.tags.slice(0, 5).map((tag, i) => (
                <span key={i} className="font-mono text-[11px] font-semibold text-zinc-200 bg-kernel-800 border border-kernel-600 px-2 py-0.5 uppercase tracking-wider rounded-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 text-kernel-400">
          <Link
            to={`/blog/${blog._id}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 text-zinc-400 transition-colors"
          >
            <MessageCircle size={17} />
            <span className="font-mono text-xs font-bold">{commentsCount || ''}</span>
          </Link>

          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              isLiked ? 'text-pink-500' : 'hover:bg-pink-500/10 hover:text-pink-400 text-zinc-400'
            }`}
          >
            <Heart size={17} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="font-mono text-xs font-bold">{likesCount || ''}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all border border-kernel-700 bg-kernel-900 hover:bg-kernel-800 text-zinc-300 hover:text-white cursor-pointer"
            title="Share journal link"
          >
            {copied ? <Check size={14} className="text-white stroke-[3]" /> : <Share2 size={14} />}
            <span>{copied ? 'copied!' : 'share'}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ml-auto ${
              isBookmarked ? 'text-yellow-400' : 'hover:bg-yellow-500/10 hover:text-yellow-400 text-zinc-400'
            }`}
          >
            <Bookmark size={17} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Recent Comments Preview */}
        {blog.comments?.length > 0 && (
          <div className="mt-3.5 pt-3 bg-kernel-950/40 rounded-xl p-3 space-y-2 border border-kernel-800/80">
            {blog.comments.slice(-2).reverse().map((comment, i) => (
              <div key={i} className="flex gap-2 text-xs group items-start">
                <Link to={`/profile/${comment.user?._id}`} className="shrink-0 mt-0.5">
                  {comment.user?.profilePicture ? (
                    <img src={comment.user.profilePicture} alt="" className="w-5 h-5 rounded-full object-cover border border-kernel-700" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-kernel-800 border border-kernel-700 flex items-center justify-center text-[9px] font-bold text-kernel-300">
                      {comment.user?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${comment.user?._id}`} className="font-bold text-zinc-200 hover:text-white transition-colors mr-1">
                    {comment.user?.name || 'anon'}:
                  </Link>
                  <span className="text-zinc-300 font-mono text-[11px] line-clamp-2">
                    <TextWithHashtags text={comment.text} />
                  </span>
                </div>
              </div>
            ))}
            {blog.comments.length > 2 && (
              <Link 
                to={`/blog/${blog._id}`} 
                className="block text-xs font-mono text-blue-400 hover:text-blue-300 font-semibold transition-colors pt-1"
              >
                view all {blog.comments.length} comments →
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
