const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Blog = require('./models/Blog');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Project.deleteMany();
    await Blog.deleteMany();

    const password = await bcrypt.hash('password123', 10);

    const praman = await new User({
      name: "Praman Bhogal",
      email: "praman@kernel.dev",
      password,
      bio: "Freelance builder & MERN developer. Passionate about shipping clean UI/UX. #Sheryians #SheryiansCodingSchool",
      skills: ["React", "Node.js", "MongoDB", "Express", "TailwindCSS"],
      profilePicture: "https://mir-s3-cdn-cf.behance.net/projects/404/187f02162739611.Y3JvcCw5OTksNzgyLDAsMTk1.png",
      bannerImage: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200&h=400&fit=crop",
      isVerified: true
    }).save();

    // 2. Create High-Profile Parody Users
    const parodyUsersData = [
      {
        name: "Elon Musk",
        email: "elon@kernel.dev",
        password,
        bio: "Chief Meme Officer. X. Space. Tesla. Shipping rockets and code. #Mars",
        skills: ["Physics", "Memes", "Rockets"],
        profilePicture: "https://etedge-insights.com/wp-content/uploads/2025/08/musk-2.jpg",
        bannerImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop",
        isVerified: true
      },
      {
        name: "Sam Altman",
        email: "sam@kernel.dev",
        password,
        bio: "Working on AGI. Obsessed with clean code and high compute. #OpenAI",
        skills: ["AI", "Compute", "Leadership"],
        profilePicture: "https://ichef.bbci.co.uk/news/480/cpsprodpb/0005/production/_129750000_1dd1b383d243c38a83f27d131f562f525931fc1f.jpg.webp",
        isVerified: true
      },
      {
        name: "Dario Amodei",
        email: "dario@kernel.dev",
        password,
        bio: "Safety first. Anthropic vibes. Our models are more polite than yours. #Anthropic",
        skills: ["LLMs", "Safety", "Scaling"],
        profilePicture: "https://miro.medium.com/v2/resize:fit:1400/0*RFJd7J3DgYZI1Wll.png",
        isVerified: true
      },
      {
        name: "Sundar Pichai",
        email: "sundar@kernel.dev",
        password,
        bio: "AI First. Google Search. Workspace. Trying to ship Gemini faster. #Google",
        skills: ["Search", "AI", "Cloud"],
        profilePicture: "https://imageio.forbes.com/specials-images/imageserve/67e5cbc9823431a56b4ad600/0x0.jpg?format=jpg&crop=1072,1072,x1828,y0,safe&height=416&width=416&fit=bounds",
        isVerified: true
      },
      {
        name: "Steve Jobs",
        email: "steve@kernel.dev",
        password,
        bio: "Design is not just what it looks like and feels like. Design is how it works. (Tweeting from iHeaven)",
        skills: ["Design", "Vision", "Elegance"],
        profilePicture: "https://goinswriter.com/wp-content/uploads/2011/10/steve-jobs.jpg",
        isVerified: true
      }
    ];

    const savedParodyUsers = await Promise.all(parodyUsersData.map(u => new User(u).save()));
    const elon = savedParodyUsers[0];
    const sam = savedParodyUsers[1];
    const dario = savedParodyUsers[2];
    const sundar = savedParodyUsers[3];
    const steve = savedParodyUsers[4];

    // 3. Create Projects
    const projectsData = [
      {
        title: "Personal Portfolio v1",
        description: "My official portfolio showcasing freelance & fullstack work. Ultra responsive with GSAP animations & smooth page transitions. #Sheryians #SheryiansCodingSchool",
        liveLink: "https://pramanbhogal.vercel.app/",
        githubLink: "https://github.com/praman07/portfolio",
        tags: ["React", "GSAP", "Locomotive", "TailwindCSS"],
        creator: praman._id,
        likes: [elon._id, sam._id, steve._id, dario._id]
      },
      {
        title: "Open House Real Estate",
        description: "Full-stack real estate platform for a UK client. Features property management, interactive search filters, and direct scheduling. #Sheryians #RealEstate",
        liveLink: "https://open-house-real-estate.vercel.app/",
        githubLink: "https://github.com/praman07/open-house",
        tags: ["MERN", "Tailwind", "Redux", "Node.js"],
        creator: praman._id,
        likes: [sam._id, sundar._id]
      },
      {
        title: "Heathrow Park Hub",
        description: "Airport parking management platform. Features real-time spot reservations, payment gateway, and admin panel. #ClientProject #Sheryians",
        liveLink: "https://heathrowparkhub.vercel.app/",
        tags: ["React", "Node.js", "MongoDB", "Express"],
        creator: praman._id,
        likes: [elon._id, sundar._id, dario._id]
      },
      {
        title: "Bhogal Auto Service",
        description: "Auto repair shop digital platform. Complete service booking flow and client management dashboard. #BusinessSolution #Sheryians",
        liveLink: "https://bhogalautoservice.vercel.app/",
        tags: ["React", "Firebase", "TailwindCSS"],
        creator: praman._id,
        likes: [steve._id]
      },
      {
        title: "Flutter Offline PDF Compressor",
        description: "High-performance mobile utility to compress PDF files offline with zero server upload. Complete client privacy guaranteed. #Flutter #Dart #SheryiansCodingSchool",
        tags: ["Flutter", "Dart", "Mobile", "PDF"],
        creator: praman._id,
        likes: [elon._id, sam._id]
      },
      {
        title: "Starship Telemetry Dashboard v4",
        description: "Real-time WebSockets stream visualizer for SpaceX test flights. Processing 500k events/sec. Built in Rust and WebGPU. #SpaceX #Mars #Rust",
        liveLink: "https://starship.spacex.com",
        githubLink: "https://github.com/spacex/telemetry",
        tags: ["Rust", "WebGPU", "WebSockets", "Telemetry"],
        creator: elon._id,
        likes: [sam._id, praman._id, steve._id]
      },
      {
        title: "GPT-5 Inference Engine Core",
        description: "Custom C++20 CUDA kernels optimizing matrix multiplications for next-gen reasoning models. 40% memory bandwidth savings. #AI #CUDA #LLM",
        githubLink: "https://github.com/openai/inference-core",
        tags: ["C++", "CUDA", "PyTorch", "AI"],
        creator: sam._id,
        likes: [dario._id, sundar._id, elon._id, praman._id]
      },
      {
        title: "Claude Code CLI Subagent Swarm",
        description: "Orchestrating autonomous parallel subagents for massive multi-file codebases with automated verification loops. #Anthropic #CLI",
        githubLink: "https://github.com/anthropic/claude-cli",
        tags: ["TypeScript", "Node.js", "AI", "Agentic"],
        creator: dario._id,
        likes: [sam._id, praman._id, steve._id]
      },
      {
        title: "Gemini 2.5 Flash Multimodal Pipeline",
        description: "Ultra-low latency streaming audio & video understanding SDK. WebRTC Native integration with hardware acceleration. #Google #Gemini",
        githubLink: "https://github.com/google/gemini-sdk",
        tags: ["Go", "WebRTC", "Python", "Multimodal"],
        creator: sundar._id,
        likes: [sam._id, elon._id]
      },
      {
        title: "NeXTSTEP OS UI Component Library",
        description: "Pixel-perfect modern React reconstruction of the legendary NeXTSTEP desktop operating system. Absolute minimalism. #Design #Minimalism",
        liveLink: "https://nextstep-ui.dev",
        tags: ["React", "CSS", "UI/UX", "Design"],
        creator: steve._id,
        likes: [praman._id, elon._id, sam._id, dario._id]
      }
    ];

    const savedProjects = await Promise.all(projectsData.map(p => new Project(p).save()));

    // 4. Populate Comments across Projects
    const commentsPool = [
      { user: elon._id, text: "This is insanely good. Shipping this to production today. 🚀" },
      { user: sam._id, text: "The latency numbers here are impressive. Great architecture choices." },
      { user: steve._id, text: "Clean typography and immaculate execution. Simplicity wins." },
      { user: dario._id, text: "Well validated and structured. Appreciate the safety checks." },
      { user: sundar._id, text: "Excellent work! Have you thought about integrating Cloud Run for auto-scaling?" },
      { user: praman._id, text: "Thanks for the feedback! Built this with MERN & Tailwind stack. 🔥" }
    ];

    for (const project of savedProjects) {
      // Pick 2-4 random comments
      const shuffled = [...commentsPool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
      
      for (const c of selected) {
        project.comments.push({
          user: c.user,
          text: c.text,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
        });
      }
      await project.save();
    }

    // 5. Create Standout Journal Entries (Blogs)
    const blogsData = [
      {
        title: "How we scaled Heathrow Park Hub to handle 10k live bookings",
        content: "Scaling a live client project like #HeathrowParkHub required a complete overhaul of our MongoDB index strategies and Redis caching layer. In this journal, I break down the exact bottlenecks we hit and how we solved them... #Sheryians #MERN #Scaling",
        author: praman._id,
        tags: ["Scaling", "Architecture", "Node.js", "MongoDB"],
        likes: [sundar._id, elon._id, sam._id]
      },
      {
        title: "Why Memes and First Principles are the Best Debugging Tools",
        content: "When rockets explode or code throws 500 errors, you don't panic. You break down the system to atomic physics components. If the code is stupid, delete the code. Don't optimize a bad loop. #FirstPrinciples #SpaceX",
        author: elon._id,
        tags: ["Philosophy", "Engineering", "Leadership"],
        likes: [praman._id, sam._id, steve._id]
      },
      {
        title: "Building Software in the Age of Autonomous AI Agents",
        content: "We are rapidly transitioning from writing line-by-line syntax to managing intent and verification pipelines. The developer of 2026 is an architect directing AI swarms. Here is how to prepare... #OpenAI #AGI",
        author: sam._id,
        tags: ["AI", "Future", "Architecture"],
        likes: [dario._id, sundar._id, praman._id]
      },
      {
        title: "The Lost Art of Interface Tactility",
        content: "Software shouldn't feel like flat glass windows. It should feel responsive, alive, and crafted by human hands. Every pixel, drop shadow, and font weight must earn its right to exist. #NeXT #Design",
        author: steve._id,
        tags: ["Design", "UX", "Art"],
        likes: [praman._id, elon._id]
      }
    ];

    const savedBlogs = await Promise.all(blogsData.map(b => new Blog(b).save()));

    for (const blog of savedBlogs) {
      blog.comments.push({
        user: elon._id,
        text: "Solid read. Re-tweeting to 200M people.",
        createdAt: new Date()
      });
      blog.comments.push({
        user: praman._id,
        text: "Super insightful post!",
        createdAt: new Date()
      });
      await blog.save();
    }

    // 6. Network Connections
    praman.followers.push(elon._id, sam._id, steve._id, sundar._id, dario._id);
    praman.following.push(elon._id, sam._id, steve._id);
    elon.following.push(praman._id);
    sam.following.push(praman._id);
    steve.following.push(praman._id);
    sundar.following.push(praman._id);
    
    await praman.save();
    await elon.save();
    await sam.save();
    await steve.save();
    await sundar.save();

    console.log('Seeding completed: Extensive, rich developer network & project ecosystem seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
