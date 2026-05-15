import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Code2, MessageCircle, Heart, Bookmark, GitBranch } from 'lucide-react';
import moment from 'moment';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import TextWithHashtags from './TextWithHashtags';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [likesCount, setLikesCount] = useState(project.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(user && project.likes?.some(id => id.toString() === user._id));
  const [commentsCount] = useState(project.comments?.length || 0);
  const [isBookmarked, setIsBookmarked] = useState(user && user.bookmarks?.some(id => id.toString() === project._id));

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    // Optimistic update
    setIsLiked(prev => !prev);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      const { data } = await api.post(`/projects/${project._id}/like`);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (err) {
      // Revert on failure
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
      const { data } = await api.post(`/users/bookmark/${project._id}`);
      setIsBookmarked(data.isBookmarked);
    } catch (err) {
      setIsBookmarked(prev => !prev);
    }
  };

  const handle = project.creator?.name?.toLowerCase().replace(/\s+/g, '_') || 'anon';
  const timeAgo = moment(project.createdAt).fromNow();

  return (
    <article className="border-b border-kernel-800 hover:bg-kernel-900/20 transition-all duration-150 p-4 sm:p-5 flex gap-3 sm:gap-4">
      {/* Avatar */}
      <Link to={`/profile/${project.creator?._id}`} className="shrink-0 mt-0.5">
        {project.creator?.profilePicture ? (
          <img
            src={project.creator.profilePicture}
            alt={project.creator.name}
            className="w-10 h-10 rounded-full object-cover border border-kernel-700 hover:ring-2 hover:ring-kernel-600 transition-all"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-sm font-bold text-kernel-200">
            {project.creator?.name?.charAt(0)?.toUpperCase() || 'K'}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-1.5 flex-wrap mb-2">
          <Link to={`/profile/${project.creator?._id}`} className="font-bold text-kernel-100 hover:underline text-sm leading-tight">
            {project.creator?.name || 'Unknown'}
          </Link>
          <span className="font-mono text-xs text-kernel-500">@{handle}</span>
          <span className="text-kernel-700">·</span>
          <span className="font-mono text-[11px] text-kernel-600">{timeAgo}</span>
        </div>

        {/* Description */}
        <p className="text-kernel-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
          <TextWithHashtags text={project.description?.length > 180
            ? project.description.slice(0, 180) + '…'
            : project.description} />
        </p>

        {/* Project card */}
        <div
          onClick={() => navigate(`/project/${project._id}`)}
          className="block border border-kernel-800 bg-kernel-950 hover:border-kernel-600 transition-colors mb-3 overflow-hidden group cursor-pointer"
        >
          <div className="bg-kernel-900 border-b border-kernel-800 px-3 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <GitBranch size={12} className="text-kernel-500 shrink-0" />
              <span className="font-mono text-xs font-bold text-kernel-100 truncate">
                {handle}/{project.title?.toLowerCase().replace(/\s+/g, '-')}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="p-1 text-kernel-500 hover:text-kernel-200 transition-colors"
                  title="Source"
                >
                  <Code2 size={13} />
                </a>
              )}
              {project.liveLink && (
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="p-1 text-kernel-500 hover:text-kernel-200 transition-colors"
                  title="Live"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {project.tags?.length > 0 && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5">
              {project.tags.slice(0, 6).map((tag, i) => (
                <span key={i} className="font-mono text-[10px] text-kernel-400 bg-kernel-900 border border-kernel-800 px-1.5 py-0.5 uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 text-kernel-500">
          <Link
            to={`/project/${project._id}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 transition-colors group"
          >
            <MessageCircle size={16} />
            <span className="font-mono text-xs">{commentsCount || ''}</span>
          </Link>

          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors group ${
              isLiked ? 'text-pink-500' : 'hover:bg-pink-500/10 hover:text-pink-400'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className="transition-all" />
            <span className="font-mono text-xs">{likesCount || ''}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ml-auto ${
              isBookmarked ? 'text-yellow-400' : 'hover:bg-yellow-500/10 hover:text-yellow-400 text-kernel-500'
            }`}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} className="transition-all" />
          </button>
        </div>

        {/* Recent Comments Preview */}
        {project.comments?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-kernel-800/50 space-y-2">
            {project.comments.slice(-2).reverse().map((comment, i) => (
              <div key={i} className="flex gap-2 text-[11px] group items-start">
                <Link to={`/profile/${comment.user?._id}`} className="shrink-0 mt-0.5">
                  {comment.user?.profilePicture ? (
                    <img src={comment.user.profilePicture} alt="" className="w-5 h-5 rounded-full object-cover border border-kernel-800" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-kernel-800 flex items-center justify-center text-[8px] font-bold">
                      {comment.user?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${comment.user?._id}`} className="font-bold text-kernel-300 hover:text-kernel-100 transition-colors mr-1">
                    {comment.user?.name || 'anon'}:
                  </Link>
                  <span className="text-kernel-500 line-clamp-2">
                    <TextWithHashtags text={comment.text} />
                  </span>
                </div>
              </div>
            ))}
            {project.comments.length > 2 && (
              <Link 
                to={`/project/${project._id}`} 
                className="block text-[10px] font-mono text-kernel-600 hover:text-kernel-400 transition-colors pt-1"
              >
                view all {project.comments.length} comments
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
