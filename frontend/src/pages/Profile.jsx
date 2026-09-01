// Kernel Profile Page - Optimized
import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Link as LinkIcon, ExternalLink, ArrowLeft, Smile, Edit3, Share2, Code, Briefcase, Globe } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import UserListModal from '../components/UserListModal';
import TextWithHashtags from '../components/TextWithHashtags';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';

// --- Contribution Heatmap (ONE standout feature) ---
function ContributionHeatmap({ items }) {
  // Build last 24 weeks of data (168 days)
  const today = moment().startOf('day');
  const startDay = moment(today).subtract(167, 'days');

  // Count posts per day
  const dayCounts = {};
  items.forEach(item => {
    const key = moment(item.createdAt).format('YYYY-MM-DD');
    dayCounts[key] = (dayCounts[key] || 0) + 1;
  });

  // Build 24 columns × 7 rows grid
  const weeks = [];
  let cursor = moment(startDay);
  for (let w = 0; w < 24; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = cursor.format('YYYY-MM-DD');
      week.push({ date: cursor.format('MMM D'), count: dayCounts[key] || 0 });
      cursor.add(1, 'day');
    }
    weeks.push(week);
  }

  const maxCount = Math.max(1, ...Object.values(dayCounts));

  const getColor = (count) => {
    if (count === 0) return 'bg-kernel-900 border-kernel-800';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return 'bg-blue-900 border-blue-800';
    if (intensity < 0.5) return 'bg-blue-700 border-blue-600';
    if (intensity < 0.75) return 'bg-blue-500 border-blue-400';
    return 'bg-blue-400 border-blue-300';
  };

  const totalContributions = Object.values(dayCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mb-6 px-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-kernel-500 uppercase tracking-widest">Activity</span>
        <span className="font-mono text-[10px] text-kernel-600">{totalContributions} posts in the last 24 weeks</span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px] min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date} — ${day.count} ${day.count === 1 ? 'post' : 'posts'}`}
                  className={`w-[10px] h-[10px] border rounded-[2px] transition-all cursor-default ${getColor(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="font-mono text-[9px] text-kernel-600">Less</span>
        {['bg-kernel-900', 'bg-blue-900', 'bg-blue-700', 'bg-blue-500', 'bg-blue-400'].map((c, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
        ))}
        <span className="font-mono text-[9px] text-kernel-600">More</span>
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUserInfo } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Projects');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusInput, setStatusInput] = useState({ text: '', emoji: '' });

  const [userListModal, setUserListModal] = useState({ isOpen: false, title: '', users: [] });

  // Reset on id change
  useEffect(() => {
    setProfileUser(null);
    setUserItems([]);
    setIsLoading(true);
  }, [id, currentUser?._id]);

  const isOwnProfile = !id || (currentUser && id === currentUser._id);
  const fetchId = id || currentUser?._id;

  useEffect(() => {
    if (!fetchId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [userRes, projectsRes, blogsRes] = await Promise.all([
          api.get(`/users/${fetchId}`),
          api.get('/projects'),
          api.get('/blogs'),
        ]);
        if (cancelled) return;

        const u = userRes.data;
        setProfileUser(u);
        setFollowersCount(u.followers?.length || 0);
        setIsFollowing(u.followers?.some(f => (f._id || f).toString() === currentUser?._id?.toString()) || false);
        setStatusInput({ text: u.status?.text || '', emoji: u.status?.emoji || '' });

        const merged = [
          ...projectsRes.data
            .filter(p => p.creator?._id?.toString() === fetchId.toString())
            .map(p => ({ ...p, type: 'project' })),
          ...blogsRes.data
            .filter(b => b.author?._id?.toString() === fetchId.toString())
            .map(b => ({ ...b, type: 'blog' })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setUserItems(merged);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchId]); // only re-run when the target user ID changes

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      const { data } = await api.post(`/users/${profileUser._id}/follow`);
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);

      // Update global context
      const updatedUser = { ...currentUser };
      if (data.isFollowing) {
        updatedUser.following = [...(updatedUser.following || []), profileUser._id];
      } else {
        updatedUser.following = updatedUser.following?.filter(id => (id._id || id).toString() !== profileUser._id.toString());
      }
      updateUserInfo(updatedUser);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showStatusModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showStatusModal]);

  const toggleFollowFromModal = async (targetId) => {
    if (!currentUser) return;
    try {
      const { data } = await api.post(`/users/${targetId}/follow`);

      // Update global context
      const updatedUser = { ...currentUser };
      if (data.isFollowing) {
        updatedUser.following = [...(updatedUser.following || []), targetId];
      } else {
        updatedUser.following = updatedUser.following?.filter(id => (id._id || id).toString() !== targetId.toString());
      }
      updateUserInfo(updatedUser);

      // If we are on the current user's own profile and they unfollow someone, 
      // we might want to refresh the list, but for now context sync is enough.
    } catch (err) {
      toast.error('Follow action failed');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const { data } = await api.put('/users/profile', {
        status: { ...statusInput, updatedAt: new Date() }
      });
      setProfileUser({ ...profileUser, status: data.status });
      setShowStatusModal(false);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
      <div className="h-36 bg-kernel-900 w-full" />
      <div className="flex justify-between items-end px-4">
        <div className="w-24 h-24 rounded-full bg-kernel-800 -mt-12 border-4 border-kernel-950" />
        <div className="h-8 w-24 bg-kernel-800 rounded-full" />
      </div>
      <div className="px-4 space-y-2 mt-2">
        <div className="h-5 bg-kernel-800 w-1/3 rounded" />
        <div className="h-3 bg-kernel-800 w-1/4 rounded" />
        <div className="h-12 bg-kernel-800 w-full rounded mt-2" />
      </div>
    </div>
  );

  if (!profileUser) return (
    <div className="py-20 text-center font-mono text-sm text-kernel-500">
      <p className="mb-2">$ whoami</p>
      <p className="text-red-400">user: not found</p>
    </div>
  );

  const handle = profileUser.name?.toLowerCase().replace(/\s+/g, '_');
  const projectCount = userItems.filter(i => i.type === 'project').length;
  const blogCount = userItems.filter(i => i.type === 'blog').length;
  const totalLikes = userItems.reduce((acc, item) => acc + (item.likes?.length || 0), 0);

  const filteredItems = userItems.filter(item => {
    if (activeTab === 'Projects') return item.type === 'project';
    if (activeTab === 'Journals') return item.type === 'blog';
    return false;
  });

  return (
    <div className="w-full bg-kernel-950 min-h-screen">
      <Toaster position="top-right" />

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-kernel-950/90 backdrop-blur-md border-b border-kernel-800 px-4 py-2.5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-kernel-950 hover:bg-zinc-200 transition-colors font-mono text-xs font-bold rounded-4xl border border-kernel-600 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} /> cd ..
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-kernel-100 leading-tight truncate">{profileUser.name}</h1>
          <p className="font-mono text-[10px] text-kernel-600">
            {projectCount} projects · {blogCount} journals · {totalLikes} likes
          </p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-28 sm:h-44 bg-gradient-to-br from-kernel-900 via-kernel-900 to-kernel-950 relative overflow-hidden">
        {profileUser.bannerImage ? (
          <img src={profileUser.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        )}
      </div>

      <div className="px-4">
        {/* Avatar + action buttons */}
        <div className="flex justify-between items-end -mt-10 sm:-mt-14 mb-3">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-kernel-950 border-[3px] border-kernel-950 overflow-hidden shrink-0 z-10">
            {profileUser.profilePicture ? (
              <img src={profileUser.profilePicture} alt={profileUser.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-kernel-800 flex items-center justify-center font-mono text-3xl font-bold text-kernel-200">
                {profileUser.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            {isOwnProfile && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-kernel-900 border border-kernel-800 text-kernel-400 hover:text-kernel-100 font-mono text-xs transition-colors flex items-center gap-2 rounded-full"
              >
                {profileUser.status?.text ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm">{profileUser.status.emoji}</span>
                    <span className="truncate max-w-[100px]">{profileUser.status.text}</span>
                  </span>
                ) : (
                  <>
                    <Smile size={14} />
                    <span className="hidden sm:inline">Set Status</span>
                  </>
                )}
              </button>
            )}
            {isOwnProfile ? (
              <Link
                to="/profile/edit"
                className="px-4 py-1.5 border border-kernel-700 text-kernel-100 font-semibold rounded-full text-sm hover:bg-kernel-900 transition-colors"
              >
                Edit profile
              </Link>
            ) : (
              <>
                <Link
                  to={`/messages/${profileUser._id}`}
                  className="px-5 py-1.5 font-bold rounded-full text-sm border border-kernel-600 text-kernel-200 hover:bg-kernel-900/30 transition-all"
                >
                  Message
                </Link>
                <button
                  onClick={handleFollow}
                  className={`px-5 py-1.5 font-bold rounded-full text-sm transition-all ${isFollowing
                      ? 'border border-kernel-600 text-kernel-200 hover:border-red-800 hover:text-red-400 hover:bg-red-900/10'
                      : 'bg-kernel-100 text-kernel-950 hover:bg-white'
                    }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="mb-1">
          <h2 className="text-lg font-bold text-kernel-100 leading-tight">{profileUser.name}</h2>
          <p className="font-mono text-sm text-kernel-500">@{handle}</p>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <p className="text-kernel-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            <TextWithHashtags text={profileUser.bio} />
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-kernel-500 text-xs font-mono mb-3">
          {profileUser.socialLinks?.website && (
            <a
              href={profileUser.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Globe size={13} />
              <span className="hover:underline">{profileUser.socialLinks.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {profileUser.socialLinks?.github && (
            <a
              href={`https://github.com/${profileUser.socialLinks.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-kernel-200 transition-colors"
            >
              <Code size={13} />
              <span>{profileUser.socialLinks.github}</span>
            </a>
          )}
          {profileUser.socialLinks?.linkedin && (
            <a
              href={`https://linkedin.com/in/${profileUser.socialLinks.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-kernel-200 transition-colors"
            >
              <Briefcase size={13} />
              <span>{profileUser.socialLinks.linkedin}</span>
            </a>
          )}
          {profileUser.socialLinks?.twitter && (
            <a
              href={`https://twitter.com/${profileUser.socialLinks.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-kernel-200 transition-colors"
            >
              <Share2 size={13} />
              <span>@{profileUser.socialLinks.twitter}</span>
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            joined {moment(profileUser.createdAt).format('MMM YYYY')}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5 text-sm font-mono mb-4">
          <button
            onClick={() => setUserListModal({ isOpen: true, title: 'Following', users: profileUser.following })}
            className="hover:underline transition-all bg-transparent border-none cursor-pointer"
          >
            <span className="font-bold text-kernel-100">{profileUser.following?.length || 0}</span>
            <span className="text-kernel-500 ml-1">following</span>
          </button>
          <button
            onClick={() => setUserListModal({ isOpen: true, title: 'Followers', users: profileUser.followers })}
            className="hover:underline transition-all bg-transparent border-none cursor-pointer"
          >
            <span className="font-bold text-kernel-100">{followersCount}</span>
            <span className="text-kernel-500 ml-1">followers</span>
          </button>
        </div>

        {/* Skills */}
        {profileUser.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {profileUser.skills.map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-kernel-900 border border-kernel-800 text-kernel-300 font-mono text-[11px] uppercase rounded-sm">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contribution Heatmap */}
      <ContributionHeatmap items={userItems} />

      {/* Tabs */}
      <div className="flex border-b border-kernel-800 sticky top-[53px] z-30 bg-kernel-950">
        {[
          { key: 'Projects', count: projectCount },
          { key: 'Journals', count: blogCount },
        ].map(({ key, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 relative text-sm transition-colors ${activeTab === key ? 'font-bold text-kernel-100' : 'text-kernel-500 hover:text-kernel-300 hover:bg-kernel-900/30'
              }`}
          >
            <span>{key}</span>
            <span className={`font-mono text-[10px] ${activeTab === key ? 'text-kernel-400' : 'text-kernel-700'}`}>
              {count}
            </span>
            {activeTab === key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div>
        {filteredItems.length > 0 ? (
          filteredItems.map(item =>
            item.type === 'project'
              ? <ProjectCard key={`p-${item._id}`} project={item} />
              : <BlogCard key={`b-${item._id}`} blog={item} />
          )
        ) : (
          <div className="py-16 px-6 text-center">
            <p className="font-mono text-sm text-kernel-600 mb-1">
              {isOwnProfile
                ? `$ ls ./${activeTab.toLowerCase()}/`
                : `$ ls @${handle}/${activeTab.toLowerCase()}/`}
            </p>
            <p className="font-mono text-xs text-kernel-700">No {activeTab.toLowerCase()} found.</p>
            {isOwnProfile && (
              <Link
                to={activeTab === 'Projects' ? '/create-project' : '/create-blog'}
                className="inline-block mt-4 font-mono text-xs text-blue-400 hover:underline"
              >
                + ship your first {activeTab === 'Projects' ? 'project' : 'journal entry'}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="relative w-full max-w-sm bg-kernel-950 border border-kernel-800 shadow-hard p-6">
            <h3 className="font-mono text-xs font-bold text-kernel-100 uppercase tracking-widest mb-6">Set Status</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="🚀"
                  className="w-12 bg-kernel-900 border border-kernel-800 p-2 text-center text-xl focus:outline-none focus:border-blue-500"
                  value={statusInput.emoji}
                  onChange={e => setStatusInput({ ...statusInput, emoji: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="What's happening?"
                  className="flex-1 bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  value={statusInput.text}
                  onChange={e => setStatusInput({ ...statusInput, text: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 bg-transparent border border-kernel-800 text-kernel-500 font-mono text-xs hover:text-kernel-200 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-2 px-4 py-2 bg-blue-600 text-white font-mono font-bold text-xs hover:bg-blue-500 transition-colors shadow-hard-sm"
                >
                  SAVE STATUS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User List Modal */}
      <UserListModal
        isOpen={userListModal.isOpen}
        onClose={() => setUserListModal(prev => ({ ...prev, isOpen: false }))}
        title={userListModal.title}
        users={userListModal.users}
        currentUser={currentUser}
        onFollowToggle={toggleFollowFromModal}
      />

      <div className="h-24 sm:h-0" />
    </div>
  );
}

