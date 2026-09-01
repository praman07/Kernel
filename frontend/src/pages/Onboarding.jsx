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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-kernel-950/85 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-xl bg-kernel-950 border-2 border-kernel-600 shadow-hard overflow-hidden relative z-10 my-auto">
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
              <div className="w-16 h-16 bg-kernel-900 border border-kernel-700 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Cpu className="text-blue-400" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-mono tracking-tight">System Identity Initialization</h1>
                <p className="text-kernel-400 font-mono text-sm mt-1 leading-relaxed">
                  Configure your core developer profile. Tell the network what primary role & domain you engineer in.
                </p>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-wider">Primary Engineering Role</label>
                  <select
                    name="role"
                    className="w-full bg-kernel-900 border border-kernel-700 rounded-lg p-3 text-white font-mono text-base focus:outline-none focus:border-blue-500 transition-colors"
                    value={formData.role || 'Full-Stack Developer'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Full-Stack Developer">Full-Stack Engineer</option>
                    <option value="Frontend Developer">Frontend Specialist</option>
                    <option value="Backend Developer">Backend / Systems Engineer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="DevOps / Infrastructure">DevOps & Infrastructure</option>
                    <option value="Mobile Developer">Mobile Application Developer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-wider">Developer Bio & Mission Statement</label>
                  <textarea
                    name="bio"
                    rows="3"
                    className="w-full bg-kernel-900 border border-kernel-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder-kernel-500"
                    placeholder="e.g. Building scalable MERN applications, real-time engines, & UI design systems..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-white hover:bg-zinc-200 text-kernel-950 py-3 font-mono font-bold text-base rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                PROCEED <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-16 h-16 bg-kernel-900 border border-kernel-700 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Code className="text-purple-400" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-mono tracking-tight">Core Tech Stack</h1>
                <p className="text-kernel-400 font-mono text-sm mt-1 leading-relaxed">
                  Specify your primary languages, frameworks, and databases for feed recommendations.
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-wider">Primary Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  className="w-full bg-kernel-900 border border-kernel-700 rounded-lg p-3.5 text-white font-mono text-base focus:outline-none focus:border-purple-500 transition-colors placeholder-kernel-500"
                  placeholder="React, Node.js, MongoDB, TypeScript, TailwindCSS"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-transparent border border-kernel-700 rounded-lg text-kernel-300 py-3 font-mono text-sm hover:text-white hover:border-kernel-500 transition-colors cursor-pointer"
                >
                  BACK
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-[2] bg-white hover:bg-zinc-200 text-kernel-950 py-3 font-mono font-bold text-base rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  CONTINUE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-16 h-16 bg-kernel-900 border border-kernel-700 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Globe className="text-emerald-400" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-mono tracking-tight">Network & External Nodes</h1>
                <p className="text-kernel-400 font-mono text-sm mt-1 leading-relaxed">
                  Link your repositories and public portfolio so other developers can view your work.
                </p>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-wider">GitHub Username</label>
                  <input
                    type="text"
                    name="github"
                    className="w-full bg-kernel-900 border border-kernel-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-kernel-500"
                    placeholder="e.g. praman07"
                    value={formData.github}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-wider">X / Twitter Handle</label>
                  <input
                    type="text"
                    name="twitter"
                    className="w-full bg-kernel-900 border border-kernel-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-kernel-500"
                    placeholder="e.g. @praman_dev"
                    value={formData.twitter}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-kernel-300 uppercase tracking-wider">Portfolio Website URL</label>
                  <input
                    type="text"
                    name="website"
                    className="w-full bg-kernel-900 border border-kernel-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-kernel-500"
                    placeholder="https://pramanbhogal.vercel.app/"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 bg-transparent border border-kernel-700 rounded-lg text-kernel-300 py-3 font-mono text-sm hover:text-white hover:border-kernel-500 transition-colors cursor-pointer"
                >
                  BACK
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3 font-mono font-bold text-base rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'EXECUTING...' : 'FINISH SETUP'} <Check size={18} />
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
