const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');

const getProjects = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      $or: [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { tags: { $regex: req.query.keyword, $options: 'i' } }
      ]
    } : {};

    const projects = await Project.find(keyword)
      .populate('creator', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, tags, githubLink, liveLink, imageUrl } = req.body;

    const project = new Project({
      title,
      description,
      tags,
      githubLink,
      liveLink,
      imageUrl,
      creator: req.user._id
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, tags, githubLink, liveLink, imageUrl } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      if (project.creator.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this project' });
      }

      project.title = title || project.title;
      project.description = description || project.description;
      project.tags = tags || project.tags;
      project.githubLink = githubLink || project.githubLink;
      project.liveLink = liveLink || project.liveLink;
      project.imageUrl = imageUrl !== undefined ? imageUrl : project.imageUrl;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      if (project.creator.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this project' });
      }

      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleLikeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const isLiked = project.likes.includes(req.user._id);
    if (isLiked) {
      project.likes.pull(req.user._id);
    } else {
      project.likes.push(req.user._id);
      
      // Notify creator if it's not their own project
      if (project.creator.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: project.creator,
          sender: req.user._id,
          type: 'LIKE_PROJECT',
          entityId: project._id
        });
      }
    }
    await project.save();
    res.json({ isLiked: !isLiked, likesCount: project.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCommentProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const comment = {
      user: req.user._id,
      text: req.body.text
    };
    
    project.comments.push(comment);
    await project.save();
    
    if (project.creator.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: project.creator,
        sender: req.user._id,
        type: 'COMMENT_PROJECT',
        entityId: project._id
      });
    }

    // Populate user details for returning the new comment
    await project.populate('comments.user', 'name profilePicture');
    const newComment = project.comments[project.comments.length - 1];

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const CATEGORY_MAP = {
  react: 'Frontend',
  nextjs: 'Frontend',
  vue: 'Frontend',
  angular: 'Frontend',
  tailwind: 'Styling',
  gsap: 'Animation',
  node: 'Backend',
  express: 'Backend',
  python: 'AI / Data',
  fastapi: 'Backend',
  django: 'Backend',
  rust: 'Systems',
  go: 'Backend',
  golang: 'Backend',
  typescript: 'Language',
  javascript: 'Language',
  cpp: 'Language',
  c: 'Language',
  sheryians: 'Education',
  mern: 'Fullstack',
  indiehackers: 'Business',
  web3: 'Crypto',
  ai: 'Artificial Intelligence',
  ml: 'Machine Learning',
  devops: 'Infrastructure',
  docker: 'Container',
  kubernetes: 'Infrastructure'
};

const getTrends = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$tags' },
      {
        $project: {
          cleanTag: {
            $toLower: {
              $trim: {
                input: {
                  $replaceAll: { input: '$tags', find: '#', replacement: '' }
                }
              }
            }
          }
        }
      },
      { $match: { cleanTag: { $ne: '' } } },
      { $group: { _id: '$cleanTag', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ];

    const [projectTags, blogTags] = await Promise.all([
      Project.aggregate(pipeline),
      Blog.aggregate(pipeline)
    ]);

    const tagCounts = {};
    [...projectTags, ...blogTags].forEach(item => {
      if (item._id) {
        tagCounts[item._id] = (tagCounts[item._id] || 0) + item.count;
      }
    });

    // Default tech tags if database has few tags yet
    const fallbackTags = ['sheryians', 'mern', 'typescript', 'nextjs', 'react', 'python', 'rust', 'indiehackers', 'gsap', 'web3'];
    fallbackTags.forEach(tag => {
      if (!tagCounts[tag]) {
        tagCounts[tag] = Math.floor(Math.random() * 3) + 1;
      }
    });

    const sortedTrends = Object.entries(tagCounts)
      .map(([tag, count]) => {
        const category = CATEGORY_MAP[tag] || 'Tech';
        let postsFormatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
        return {
          tag,
          category,
          count,
          posts: postsFormatted
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(sortedTrends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicActivity = async (req, res) => {
  try {
    const [projects, blogs] = await Promise.all([
      Project.find().populate('creator', 'name').sort({ createdAt: -1 }).limit(5),
      Blog.find().populate('author', 'name').sort({ createdAt: -1 }).limit(5)
    ]);

    const activities = [
      ...projects.map(p => ({
        id: `p-${p._id}`,
        text: `${p.creator?.name || 'someone'} shipped "${p.title}"`,
        time: 'just now'
      })),
      ...blogs.map(b => ({
        id: `b-${b._id}`,
        text: `${b.author?.name || 'someone'} published a new journal`,
        time: 'just now'
      }))
    ].sort(() => 0.5 - Math.random()).slice(0, 8);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleLikeProject,
  addCommentProject,
  getTrends,
  getPublicActivity
};
