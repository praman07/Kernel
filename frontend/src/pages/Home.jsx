import { Link } from 'react-router-dom';
import { Terminal, GitPullRequest, Code2, Users, Activity, Star } from 'lucide-react';
import moment from 'moment';

export default function Home() {
  // Dummy activity data
  const activity = [
    { id: 1, user: 'alex_dev', action: 'shipped v2.0 of', target: 'quantum-router', time: '2m ago' },
    { id: 2, user: 'sarah.js', action: 'starred', target: 'nexus-ui', time: '15m ago' },
    { id: 3, user: 'mike_h', action: 'published', target: 'Why I moved from React to Rust', time: '1h ago' },
    { id: 4, user: 'lena_codes', action: 'forked', target: 'kernel-core', time: '2h ago' },
  ];

  const trendingProjects = [
    { id: '1', title: 'nexus-ui', author: 'sarah.js', tags: ['react', 'tailwind', 'framer-motion'], stars: 128 },
    { id: '2', title: 'quantum-router', author: 'alex_dev', tags: ['rust', 'networking', 'wasm'], stars: 89 },
    { id: '3', title: 'git-analyzer', author: 'mike_h', tags: ['python', 'cli', 'git'], stars: 56 },
  ];

  return (
    <div className="relative min-h-[85vh] bg-dot-pattern flex flex-col pt-12 pb-24 px-4 sm:px-6">
      {/* Background radial gradient overlay to fade out the dots */}
      <div className="absolute inset-0 bg-kernel-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Dense Pitch & Activity */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-kernel-900 border border-kernel-700 text-xs font-mono text-kernel-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              v0.9.4 online
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-kernel-100 leading-tight">
              Where developers <br className="hidden sm:block" />
              build in public.
            </h1>
            
            <p className="text-kernel-400 text-lg max-w-md">
              Kernel is the social network for builders. Ship projects, write raw technical journals, and connect with a dense community of developers.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <Link to="/signup" className="px-6 py-2.5 bg-kernel-100 text-kernel-950 font-bold font-mono text-sm hover:bg-white transition-colors flex items-center gap-2">
                <Terminal size={16} />
                init_profile
              </Link>
              <Link to="/explore" className="px-6 py-2.5 bg-kernel-900 border border-kernel-700 text-kernel-300 font-mono text-sm hover:bg-kernel-800 transition-colors">
                browse_network
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-kernel-800">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={16} className="text-kernel-500" />
              <h2 className="text-xs font-mono font-bold text-kernel-500 uppercase tracking-widest">Live Network Activity</h2>
            </div>
            
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm border-l-2 border-kernel-800 pl-3">
                  <div className="font-mono text-kernel-400 mt-0.5">{item.time}</div>
                  <div>
                    <span className="font-medium text-kernel-200">{item.user}</span>{' '}
                    <span className="text-kernel-500">{item.action}</span>{' '}
                    <span className="font-mono text-kernel-300">{item.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Trending / Showcase */}
        <div className="lg:col-span-7 lg:pl-8">
          <div className="bg-kernel-900/50 backdrop-blur-sm border border-kernel-800 shadow-hard p-6">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-kernel-800">
              <h2 className="font-mono text-sm font-bold text-kernel-100 flex items-center gap-2">
                <GitPullRequest size={16} />
                trending_repositories
              </h2>
              <Link to="/explore" className="text-xs font-mono text-kernel-500 hover:text-kernel-300 transition-colors">
                view_all -&gt;
              </Link>
            </div>

            <div className="grid gap-4">
              {trendingProjects.map((project) => (
                <div key={project.id} className="group border border-kernel-800 bg-kernel-950 p-4 hover:border-kernel-600 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link to="/signup" className="font-mono font-bold text-kernel-100 hover:underline text-lg group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </Link>
                      <div className="text-xs text-kernel-500 mt-1">
                        maintained by <span className="text-kernel-400">{project.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-kernel-900 border border-kernel-800 text-xs font-mono text-kernel-300">
                      <Star size={12} className="text-kernel-400" />
                      {project.stars}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-kernel-900 border border-kernel-800 text-kernel-400 font-mono text-[10px] uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-kernel-800 grid grid-cols-3 gap-4">
               <div className="text-center">
                 <div className="font-mono text-2xl font-bold text-kernel-100">1.2k</div>
                 <div className="text-xs text-kernel-500 uppercase tracking-widest mt-1">Projects</div>
               </div>
               <div className="text-center border-l border-kernel-800">
                 <div className="font-mono text-2xl font-bold text-kernel-100">8.4k</div>
                 <div className="text-xs text-kernel-500 uppercase tracking-widest mt-1">Commits</div>
               </div>
               <div className="text-center border-l border-kernel-800">
                 <div className="font-mono text-2xl font-bold text-kernel-100">450</div>
                 <div className="text-xs text-kernel-500 uppercase tracking-widest mt-1">Hackers</div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
