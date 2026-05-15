import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Code2, ExternalLink, ArrowLeft, Trash2, Edit3, TerminalSquare, Clock } from 'lucide-react';
import TextWithHashtags from '../components/TextWithHashtags';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);
      } catch (error) {
        console.error('Error fetching project', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Execute rm -rf on this repository?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Repository deleted');
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
      const { data } = await api.post(`/projects/${id}/comment`, { text: commentText });
      setProject({ ...project, comments: [...project.comments, data] });
      setCommentText('');
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="max-w-4xl mx-auto py-20 font-mono text-xs text-kernel-500 animate-pulse">loading repository...</div>;
  if (!project) return <div className="max-w-4xl mx-auto py-20 font-mono text-xs text-red-500">error: repository not found.</div>;

  const isOwner = user && project.creator && user._id === project.creator._id;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Toaster position="top-right" />

      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-mono text-xs text-kernel-500 hover:text-kernel-300 transition-colors cursor-pointer bg-transparent border-none">
          <ArrowLeft size={14} /> cd ..
        </button>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link to={`/edit-project/${id}`} className="font-mono text-xs text-blue-500 hover:bg-blue-500/10 px-2 py-1 transition-colors flex items-center gap-2">
              <Edit3 size={12} /> edit
            </Link>
            <button onClick={handleDelete} className="font-mono text-xs text-red-500 hover:bg-red-500/10 px-2 py-1 transition-colors flex items-center gap-2 bg-transparent border-none cursor-pointer">
              <Trash2 size={12} /> rm -rf
            </button>
          </div>
        )}
      </div>

      <div className="bg-kernel-950 border border-kernel-800 shadow-hard">
        {/* Header - Terminal Style */}
        <div className="bg-kernel-900 border-b border-kernel-800 p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-kernel-500 mb-2">
              <TerminalSquare size={16} />
              <span className="font-mono text-xs">repository</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-kernel-100 font-mono tracking-tight mb-4">
              {project.creator?.name}/{project.title}
            </h1>

            <div className="flex items-center gap-4">
              <Link to={`/profile/${project.creator?._id}`} className="flex items-center gap-2 group">
                {project.creator?.profilePicture ? (
                  <img src={project.creator.profilePicture} alt={project.creator.name} className="w-6 h-6 border border-kernel-700 object-cover transition-all" />
                ) : (
                  <div className="w-6 h-6 bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-xs text-kernel-300">
                    {project.creator?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-mono text-kernel-400 group-hover:text-kernel-200">{project.creator?.name || 'anonymous'}</span>
              </Link>
              <div className="flex items-center gap-1 font-mono text-xs text-kernel-600">
                <Clock size={12} />
                {moment(project.createdAt).format('YYYY-MM-DD HH:mm')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-kernel-950 border border-kernel-700 text-kernel-300 hover:text-kernel-100 hover:bg-kernel-800 transition-colors shadow-hard-sm">
                <Code2 size={14} /> source
              </a>
            )}
            {project.liveLink && (
              <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-kernel-200 text-kernel-950 hover:bg-white transition-colors font-bold shadow-hard-sm">
                <ExternalLink size={14} /> visit
              </a>
            )}
          </div>
        </div>



        {/* Tags */}
        <div className="p-4 md:px-6 border-b border-kernel-800 bg-kernel-950 flex flex-wrap gap-2">
          {project.tags?.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-kernel-900 border border-kernel-800 text-kernel-400 font-mono text-xs uppercase">
              {tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h3 className="font-mono text-xs font-bold text-kernel-500 uppercase tracking-widest mb-6">README.md</h3>
          <div className="prose prose-invert max-w-none prose-p:text-kernel-300 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-kernel-100 whitespace-pre-wrap font-sans text-sm md:text-base">
            <TextWithHashtags text={project.description} />
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6 md:p-8 border-t border-kernel-800 bg-kernel-950">
          <h3 className="font-mono text-xs font-bold text-kernel-500 uppercase tracking-widest mb-6">Discussion</h3>

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
            <button type="submit" disabled={!commentText.trim()} className="px-4 py-1 text-xs font-mono font-bold bg-kernel-100 text-kernel-950 hover:bg-white disabled:opacity-50 transition-colors h-8 shadow-hard-sm">
              Submit
            </button>
          </form>

          <div className="space-y-6">
            {project.comments?.map((comment, index) => (
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
    </div>
  );
}
