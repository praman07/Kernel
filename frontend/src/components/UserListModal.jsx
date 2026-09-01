import { useEffect } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import TextWithHashtags from './TextWithHashtags';

export default function UserListModal({ isOpen, onClose, title, users, currentUser, onFollowToggle }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-kernel-950 border border-kernel-800 shadow-hard overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-kernel-900 border-b border-kernel-800 px-4 py-3 flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold text-kernel-100 uppercase tracking-widest">
            {title} ({users?.length || 0})
          </h3>
          <button onClick={onClose} className="text-kernel-500 hover:text-kernel-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* User List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {users?.length > 0 ? (
            <div className="space-y-1">
              {users.map((u) => {
                const isFollowing = currentUser?.following?.some(id => id.toString() === u._id.toString());
                const isSelf = currentUser?._id === u._id;

                return (
                  <div key={u._id} className="flex items-center gap-3 p-2 hover:bg-kernel-900 transition-colors group">
                    <Link to={`/profile/${u._id}`} onClick={onClose} className="shrink-0">
                      {u.profilePicture ? (
                        <img src={u.profilePicture} alt={u.name} className="w-10 h-10 border border-kernel-700 object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-kernel-800 border border-kernel-700 flex items-center justify-center font-mono text-sm text-kernel-400">
                          {u.name?.charAt(0)}
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${u._id}`} onClick={onClose} className="block font-bold text-kernel-100 text-sm hover:underline truncate">
                        {u.name}
                      </Link>
                      <p className="text-kernel-500 text-[10px] font-mono truncate">
                        <TextWithHashtags text={u.bio || 'no bio provided'} />
                      </p>
                    </div>

                    {!isSelf && (
                      <button
                        onClick={() => onFollowToggle(u._id)}
                        className={`shrink-0 px-3 py-1 rounded-none font-mono text-[10px] font-bold transition-all ${
                          isFollowing 
                            ? 'bg-kernel-800 text-kernel-400 hover:text-red-500 hover:bg-red-500/10' 
                            : 'bg-kernel-100 text-kernel-950 hover:bg-white'
                        }`}
                      >
                        {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="font-mono text-xs text-kernel-600">no_data_found.exe</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-kernel-900 border-t border-kernel-800 p-2 text-center">
          <p className="font-mono text-[9px] text-kernel-700 uppercase">kernel v1.0.4 · social_module</p>
        </div>
      </div>
    </div>
  );
}
