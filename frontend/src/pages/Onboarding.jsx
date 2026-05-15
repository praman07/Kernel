import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Terminal, Cpu, Code, Globe, ArrowRight, Check } from 'lucide-react';

export default function Onboarding() {
  const { user, updateUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    github: user?.socialLinks?.github || '',
    twitter: user?.socialLinks?.twitter || '',
    website: user?.socialLinks?.website || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      
      const updateData = {
        bio: formData.bio,
        skills: skillsArray,
        socialLinks: {
          github: formData.github,
          twitter: formData.twitter,
          website: formData.website
        }
      };

      const { data } = await api.put('/users/profile', updateData);

      // Update local context
      updateUserInfo({ ...user, ...data });
      
      toast.success('System configuration complete');
      setTimeout(() => navigate('/feed'), 1000);
    } catch (error) {
      toast.error('Failed to update configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-xl bg-kernel-950 border border-kernel-800 shadow-hard overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-kernel-900 border-b border-kernel-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
            <span className="ml-2 font-mono text-[10px] text-kernel-500 uppercase tracking-widest">Setup_Wizard.exe</span>
          </div>
          <span className="font-mono text-[10px] text-kernel-600">Step 0{step} / 03</span>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-kernel-900 border border-kernel-800 flex items-center justify-center mb-6 shadow-hard-sm">
                <Cpu className="text-blue-500" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight">Initialising Developer Profile...</h1>
              <p className="text-kernel-400 font-mono text-sm leading-relaxed">
                Welcome to Kernel. To provide the best experience for the network, we need to configure your identity parameters. 
                Tell us about your mission.
              </p>
              
              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-mono font-bold text-kernel-500 uppercase tracking-widest">Mission Description (Bio)</label>
                <textarea
                  name="bio"
                  rows="4"
                  className="w-full bg-kernel-900 border border-kernel-800 p-4 text-kernel-100 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="What are you building? What is your stack?"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-kernel-100 hover:bg-white text-kernel-950 py-3 font-mono font-bold text-sm shadow-hard-sm transition-all flex items-center justify-center gap-2 group"
              >
                PROCEED <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-16 h-16 bg-kernel-900 border border-kernel-800 flex items-center justify-center mb-6 shadow-hard-sm">
                <Globe className="text-emerald-500" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight">External Links</h1>
              <p className="text-kernel-400 font-mono text-sm leading-relaxed">
                Connect your external repositories and social nodes.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-kernel-600 uppercase tracking-tighter">github_handle</label>
                  <input
                    type="text"
                    name="github"
                    className="w-full bg-kernel-900 border border-kernel-800 p-3 text-kernel-100 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="username"
                    value={formData.github}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-kernel-600 uppercase tracking-tighter">twitter_handle</label>
                  <input
                    type="text"
                    name="twitter"
                    className="w-full bg-kernel-900 border border-kernel-800 p-3 text-kernel-100 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="@username"
                    value={formData.twitter}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-kernel-600 uppercase tracking-tighter">personal_website</label>
                  <input
                    type="text"
                    name="website"
                    className="w-full bg-kernel-900 border border-kernel-800 p-3 text-kernel-100 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-transparent border border-kernel-800 text-kernel-500 py-3 font-mono text-sm hover:text-kernel-200 transition-colors"
                >
                  BACK
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-[2] bg-kernel-100 hover:bg-white text-kernel-950 py-3 font-mono font-bold text-sm shadow-hard-sm transition-all flex items-center justify-center gap-2 group"
                >
                  CONTINUE <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-16 h-16 bg-kernel-900 border border-kernel-800 flex items-center justify-center mb-6 shadow-hard-sm">
                <Code className="text-purple-500" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-kernel-100 font-mono tracking-tight">Skill Matrix</h1>
              <p className="text-kernel-400 font-mono text-sm leading-relaxed">
                Define your technical expertise. This helps Kernel connect you with similar developers and trending projects.
              </p>
              
              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-mono font-bold text-kernel-500 uppercase tracking-widest">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  className="w-full bg-kernel-900 border border-kernel-800 p-4 text-kernel-100 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="rust, typescript, docker, postgres, nextjs"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 bg-transparent border border-kernel-800 text-kernel-500 py-3 font-mono text-sm hover:text-kernel-200 transition-colors"
                >
                  BACK
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3 font-mono font-bold text-sm shadow-hard-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? 'EXECUTING...' : 'FINISH SETUP'} <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-2 h-2 transition-all duration-300 ${step === i ? 'bg-blue-500 scale-125' : 'bg-kernel-800'}`} 
          />
        ))}
      </div>
    </div>
  );
}
