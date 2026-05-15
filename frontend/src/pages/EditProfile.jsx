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
      
      const updateData = {
        ...formData,
        skills: skillsArray
      };

      const { data } = await api.put('/users/profile', updateData);
      updateUserInfo(data);
      toast.success('config updated');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight flex items-center gap-2">
          <Settings className="text-kernel-500" />
          kernel_config
        </h1>
      </div>

      <div className="bg-kernel-950 border border-kernel-800 shadow-hard">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="space-y-4">
            <h2 className="font-mono text-xs font-bold text-kernel-500 uppercase tracking-widest border-b border-kernel-800 pb-2">Identity</h2>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-kernel-400 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-kernel-400 uppercase tracking-wider">Avatar URL</label>
              <input
                type="text"
                name="profilePicture"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-kernel-400 uppercase tracking-wider">Banner URL</label>
              <input
                type="text"
                name="bannerImage"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.bannerImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-mono text-xs font-bold text-kernel-500 uppercase tracking-widest border-b border-kernel-800 pb-2">About</h2>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-kernel-400 uppercase tracking-wider">Bio</label>
              <textarea
                name="bio"
                rows="3"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors resize-none"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-kernel-400 uppercase tracking-wider">Tech Stack</label>
              <input
                type="text"
                name="skills"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.skills}
                onChange={handleChange}
                placeholder="react, node, go..."
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-mono text-xs font-bold text-kernel-500 uppercase tracking-widest border-b border-kernel-800 pb-2">Social Pointers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="social_github"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.socialLinks.github}
                onChange={handleChange}
                placeholder="GitHub URL"
              />
              <input
                type="text"
                name="social_twitter"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="Twitter URL"
              />
              <input
                type="text"
                name="social_linkedin"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn URL"
              />
              <input
                type="text"
                name="social_website"
                className="w-full bg-kernel-900 border border-kernel-800 p-2 text-kernel-100 placeholder-kernel-700 focus:outline-none focus:border-kernel-500 font-mono text-sm transition-colors"
                value={formData.socialLinks.website}
                onChange={handleChange}
                placeholder="Website URL"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 font-mono text-xs text-kernel-500 hover:text-kernel-300 transition-colors"
            >
              abort
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-kernel-200 hover:bg-white text-kernel-950 px-6 py-2 font-mono font-bold text-sm shadow-hard-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'writing...' : 'save_config'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
