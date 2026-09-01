import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Settings } from 'lucide-react';

export default function EditProfile() {
  const { user, updateUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePicture: '',
    bannerImage: '',
    skills: '',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      website: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        bannerImage: user.bannerImage || '',
        skills: user.skills ? user.skills.join(', ') : '',
        socialLinks: {
          github: user.socialLinks?.github || '',
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          website: user.socialLinks?.website || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      
      // Clean GitHub & Twitter handles if full URLs or leading '@' were entered
      const cleanGithub = formData.socialLinks.github
        .replace(/^https?:\/\/(www\.)?github\.com\//, '')
        .replace(/^@/, '')
        .trim();

      const cleanTwitter = formData.socialLinks.twitter
        .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '')
        .replace(/^@/, '')
        .trim();

      const updateData = {
        ...formData,
        skills: skillsArray,
        socialLinks: {
          ...formData.socialLinks,
          github: cleanGithub,
          twitter: cleanTwitter
        }
      };

      const { data } = await api.put('/users/profile', updateData);
      updateUserInfo(data);
      toast.success('config updated');
      setTimeout(() => navigate('/profile', { replace: true }), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <Toaster position="top-right" />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
            <Settings className="text-kernel-500" />
            kernel_config
          </h1>
          <p className="text-kernel-500 font-mono text-xs mt-1">Configure your public identity and social pointers.</p>
        </div>
        <button onClick={() => navigate('/profile', { replace: true })} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-kernel-800 text-kernel-200 hover:bg-kernel-700 hover:text-white transition-colors font-mono text-xs font-bold rounded-lg border border-kernel-600 shadow-sm cursor-pointer shrink-0">
          cancel
        </button>
      </div>

      <div className="bg-kernel-900/60 border border-kernel-700 rounded-xl overflow-hidden shadow-lg">
        {/* Terminal Header */}
        <div className="bg-kernel-900 px-6 py-3.5 flex items-center justify-between border-b border-kernel-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="w-3 h-3 rounded-full border border-kernel-700 bg-kernel-800" />
            <div className="ml-4 font-mono text-xs text-kernel-400">kernel-cli --configure-user</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-kernel-500 animate-pulse">PROFILE_EDIT</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          
          <div className="space-y-4">
            <h2 className="font-mono text-xs font-bold text-kernel-400 uppercase tracking-widest border-b border-kernel-800/80 pb-2">Identity</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">Avatar URL</label>
              <input
                type="text"
                name="profilePicture"
                className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">Banner URL</label>
              <input
                type="text"
                name="bannerImage"
                className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.bannerImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="font-mono text-xs font-bold text-kernel-400 uppercase tracking-widest border-b border-kernel-800/80 pb-2">About</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">Bio</label>
              <textarea
                name="bio"
                rows="3"
                className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors resize-none leading-relaxed"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">Tech Stack</label>
              <input
                type="text"
                name="skills"
                className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.skills}
                onChange={handleChange}
                placeholder="react, node, go..."
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="font-mono text-xs font-bold text-kernel-400 uppercase tracking-widest border-b border-kernel-800/80 pb-2">Social Pointers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">GitHub Username</label>
                <input
                  type="text"
                  name="social_github"
                  className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                  value={formData.socialLinks.github}
                  onChange={handleChange}
                  placeholder="username (e.g. torvalds)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">X / Twitter Handle</label>
                <input
                  type="text"
                  name="social_twitter"
                  className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  placeholder="handle (e.g. elonmusk)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">LinkedIn</label>
                <input
                  type="text"
                  name="social_linkedin"
                  className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  placeholder="username or profile ID"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-kernel-400 uppercase tracking-wider">Personal Website</label>
                <input
                  type="text"
                  name="social_website"
                  className="w-full bg-kernel-950 border border-kernel-700 rounded-lg p-2.5 text-kernel-100 placeholder-kernel-600 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                  value={formData.socialLinks.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.dev"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-kernel-800/60">
            <button
              type="button"
              onClick={() => navigate('/profile', { replace: true })}
              className="px-5 py-2.5 font-mono text-xs font-bold text-kernel-300 hover:text-white bg-kernel-800 hover:bg-kernel-700 border border-kernel-600 rounded-lg transition-colors cursor-pointer"
            >
              abort
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white hover:bg-zinc-200 text-kernel-950 px-6 py-2.5 font-mono font-bold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isLoading ? 'writing...' : 'save_config'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
