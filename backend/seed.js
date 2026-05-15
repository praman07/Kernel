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

    // 3. Create Specific Projects for Praman
    const pramanProjects = [
      {
        title: "Personal Portfolio v1",
        description: "My first official portfolio showcasing all my freelance and personal work. Built with performance in mind. #Sheryians #SheryiansCodingSchool",
        liveLink: "https://pramanbhogal.vercel.app/",
        tags: ["React", "GSAP", "Locomotive"],
        creator: praman._id,
      },
      {
        title: "Open House Real Estate",
        description: "Fully finished real estate platform for a UK client. Features property listings, advanced search, and enquiry system. #Sheryians #RealEstate",
        liveLink: "https://open-house-real-estate.vercel.app/",
        tags: ["MERN", "Tailwind", "Redux"],
        creator: praman._id,
      },
      {
        title: "Heathrow Park Hub",
        description: "Ongoing live client project for airport parking management. Real-time availability and booking engine. #ClientProject #Sheryians",
        liveLink: "https://heathrowparkhub.vercel.app/",
        tags: ["React", "Node.js", "MongoDB"],
        creator: praman._id
      },
      {
        title: "Bhogal Auto Service",
        description: "Auto service business platform. Customer data filling section intentionally incomplete for now. Rest of project completed. #BusinessSolution #Sheryians",
        liveLink: "https://bhogalautoservice.vercel.app/",
        tags: ["React", "Firebase"],
        creator: praman._id
      },
      {
        title: "Flutter Offline PDF Compressor",
        description: "High-performance mobile utility to compress PDF files offline. Zero server upload, maximum privacy. #Flutter #Dart #SheryiansCodingSchool",
        tags: ["Flutter", "Mobile", "PDF"],
        creator: praman._id
      },
      {
        title: "Mobile Motorbike Repair",
        description: "On-demand motorbike repair service platform. Connects mechanics with riders in distress. #MobileApp #ServicePlatform #Sheryians",
        tags: ["React Native", "Maps", "Socket.io"],
        creator: praman._id
      }
    ];

    const savedProjects = await Promise.all(pramanProjects.map(p => new Project(p).save()));

    // 4. Populate "Every Post" with high-profile comments
    for (const project of savedProjects) {
      project.comments.push({
        user: elon._id,
        text: Math.random() > 0.5 ? "this is peak." : "bro accidentally built a startup. 🚀",
        createdAt: new Date()
      });
      project.comments.push({
        user: sam._id,
        text: "the feed algo is getting scary good. compute looks high here.",
        createdAt: new Date()
      });
      project.comments.push({
        user: steve._id,
        text: "finally, gradients are disappearing. simplicity is the ultimate sophistication.",
        createdAt: new Date()
      });
      
      if (Math.random() > 0.7) {
        project.comments.push({
          user: dario._id,
          text: "Looks safe. We'll be monitoring this for emergent behaviors.",
          createdAt: new Date()
        });
      }
      
      await project.save();
    }

    // 5. Create standout activity moments
    const buildUpdate = new Blog({
      title: "How we scaled Heathrow Park Hub to 10k users",
      content: "Scaling a live client project like #HeathrowParkHub required a complete rethink of our caching strategy. Here is what we did... #Sheryians #SheryiansCodingSchool #Backend",
      author: praman._id,
      tags: ["Scaling", "Architecture", "Success"]
    });
    
    buildUpdate.comments.push({
      user: sundar._id,
      text: "Great insights on caching. Have you tried offloading this to Google Cloud Functions? #AIFirst",
      createdAt: new Date()
    });
    buildUpdate.comments.push({
      user: elon._id,
      text: "someone funded this immediately.",
      createdAt: new Date()
    });
    
    await buildUpdate.save();

    // 6. Social activity
    praman.followers.push(elon._id, sam._id, steve._id, sundar._id, dario._id);
    elon.following.push(praman._id);
    sam.following.push(praman._id);
    steve.following.push(praman._id);
    
    await praman.save();
    await elon.save();
    await sam.save();
    await steve.save();

    console.log('Seeding completed: High-profile active developer ecosystem launched.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
