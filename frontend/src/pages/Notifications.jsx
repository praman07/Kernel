import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Heart, MessageCircle, UserPlus, Bookmark, Bell } from 'lucide-react';

const TYPE_MAP = {
  LIKE_PROJECT:    { Icon: Heart,          color: 'text-pink-500',    bg: 'bg-pink-500/10',    verb: 'liked your project' },
  LIKE_BLOG:       { Icon: Heart,          color: 'text-pink-500',    bg: 'bg-pink-500/10',    verb: 'liked your journal' },
  COMMENT_PROJECT: { Icon: MessageCircle,  color: 'text-blue-400',    bg: 'bg-blue-400/10',    verb: 'commented on your project' },
  COMMENT_BLOG:    { Icon: MessageCircle,  color: 'text-blue-400',    bg: 'bg-blue-400/10',    verb: 'commented on your journal' },
  FOLLOW:          { Icon: UserPlus,       color: 'text-emerald-400', bg: 'bg-emerald-400/10', verb: 'started following you' },
  SAVE_PROJECT:    { Icon: Bookmark,       color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  verb: 'bookmarked your project' },
  SAVE_BLOG:       { Icon: Bookmark,       color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  verb: 'bookmarked your journal' },
};

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
        // Mark all as read
        api.post('/notifications/read').catch(() => {});
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  if (isLoading) return (
    <div className="w-full min-h-screen bg-kernel-950">
      <div className="sticky top-0 z-40 bg-kernel-950/90 backdrop-blur-md border-b border-kernel-800 px-4 py-3.5">
        <h1 className="font-bold text-kernel-100 text-base">Notifications</h1>
      </div>
      <div className="divide-y divide-kernel-800 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-kernel-800 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-kernel-800 rounded w-2/3" />
              <div className="h-3 bg-kernel-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-kernel-950">
      <div className="sticky top-0 z-40 bg-kernel-950/90 backdrop-blur-md border-b border-kernel-800 px-4 py-3.5">
        <h1 className="font-bold text-kernel-100 text-base">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-kernel-900 border border-kernel-800 flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-kernel-600" />
          </div>
          <p className="font-bold text-kernel-300 mb-1">All quiet here</p>
          <p className="font-mono text-xs text-kernel-600">
            When someone likes, comments, or follows you, it'll show up here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-kernel-800/60">
          {notifications.map(notif => {
            const meta = TYPE_MAP[notif.type] || TYPE_MAP.FOLLOW;
            const { Icon, color, bg, verb } = meta;

            return (
              <div
                key={notif._id}
                className={`flex gap-3 px-4 py-3.5 transition-colors ${
                  !notif.read ? 'bg-blue-950/20 border-l-2 border-l-blue-600' : 'hover:bg-kernel-900/20'
                }`}
              >
                {/* Icon */}
                <div className={`mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon size={16} className={color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <Link to={`/profile/${notif.sender._id}`} className="shrink-0">
                      {notif.sender.profilePicture ? (
                        <img
                          src={notif.sender.profilePicture}
                          alt={notif.sender.name}
                          className="w-8 h-8 rounded-full object-cover border border-kernel-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-xs text-kernel-300">
                          {notif.sender.name?.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <Link
                          to={`/profile/${notif.sender._id}`}
                          className="font-bold text-kernel-100 hover:underline"
                        >
                          {notif.sender.name}
                        </Link>
                        {' '}
                        <span className="text-kernel-400">{verb}</span>
                      </p>
                      <p className="font-mono text-[10px] text-kernel-600 mt-0.5">
                        {moment(notif.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-24 sm:h-6" />
    </div>
  );
}
