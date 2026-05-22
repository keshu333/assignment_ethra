const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Load env variables
dotenv.config({ path: `${__dirname}/../.env` });

const usersData = [
  {
    name: 'keshu',
    email: 'keshu77@gmail.com',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    name: 'John Doe',
    email: 'member@test.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    name: 'Alex Rivera',
    email: 'alex@test.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  },
  {
    name: 'Emily Chen',
    email: 'emily@test.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  },
  {
    name: 'Marcus Brody',
    email: 'marcus@test.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager');
    console.log('Seed: Connected to Database...');

    // Clean existing tables
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('Seed: Cleaned existing collections.');

    // 1. Create Users
    // We use .create() to trigger password hashing pre-save hooks
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`Seed: Created ${createdUsers.length} users successfully.`);

    const admin = createdUsers.find(u => u.role === 'admin');
    const member = createdUsers.find(u => u.email === 'member@test.com');
    const alex = createdUsers.find(u => u.email === 'alex@test.com');
    const emily = createdUsers.find(u => u.email === 'emily@test.com');
    const marcus = createdUsers.find(u => u.email === 'marcus@test.com');

    // 2. Create Projects
    const projectsData = [
      {
        title: 'Project Apollo (SaaS Web App)',
        description: 'Redesign and re-engineer our flagship SaaS dashboard for maximum speed, dark theme, and custom widgets.',
        createdBy: admin._id,
        members: [admin._id, member._id, alex._id, emily._id],
        status: 'active',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        title: 'Project Hermes (Mobile App)',
        description: 'React Native iOS/Android app companion for tracking tasks, projects, and collaborating on-the-go.',
        createdBy: admin._id,
        members: [admin._id, member._id, emily._id, marcus._id],
        status: 'onhold',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        title: 'Project Athena (Q2 Marketing)',
        description: 'Landing page launch, product hunt prep, blog posts, and viral social media campaign design.',
        createdBy: admin._id,
        members: [admin._id, alex._id, marcus._id],
        status: 'completed',
        deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    const projects = await Project.create(projectsData);
    console.log(`Seed: Created ${projects.length} projects successfully.`);

    const pApollo = projects[0];
    const pHermes = projects[1];
    const pAthena = projects[2];

    // 3. Create Tasks
    const tasksData = [
      // Project Apollo (Active)
      {
        title: 'Design UI Layout Wireframes',
        description: 'Draft initial glassmorphic light/dark Figma layouts for dashboard widgets.',
        priority: 'high',
        status: 'completed',
        assignedTo: emily._id,
        projectId: pApollo._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        comments: [
          { user: admin._id, text: 'This looks stunning, Emily! Make sure to align the grid spacing.' },
          { user: emily._id, text: 'Thanks! I updated the design according to your feedback.' }
        ],
        activities: [
          { text: 'Task created', user: admin._id },
          { text: 'Assigned to Emily Chen', user: admin._id },
          { text: 'Status updated to completed', user: emily._id }
        ]
      },
      {
        title: 'Implement Authentication Context',
        description: 'Integrate JWT auth with secure HTTP Axios headers and local storage session persistence.',
        priority: 'high',
        status: 'inprogress',
        assignedTo: member._id,
        projectId: pApollo._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        comments: [
          { user: member._id, text: 'Authentication is working, just wrapping up the role-based route protections.' }
        ],
        activities: [
          { text: 'Task created', user: admin._id },
          { text: 'Assigned to John Doe', user: admin._id },
          { text: 'Status updated to inprogress', user: member._id }
        ]
      },
      {
        title: 'Build Analytics Visualizations',
        description: 'Integrate Recharts curves showing completed tasks, overdue stats, and team workloads.',
        priority: 'medium',
        status: 'todo',
        assignedTo: alex._id,
        projectId: pApollo._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        activities: [
          { text: 'Task created', user: admin._id },
          { text: 'Assigned to Alex Rivera', user: admin._id }
        ]
      },
      {
        title: 'Setup Database Indexes',
        description: 'Benchmark search queries on task details and add MongoDB compound indexes.',
        priority: 'low',
        status: 'todo',
        assignedTo: member._id,
        projectId: pApollo._id,
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        activities: [
          { text: 'Task created', user: admin._id },
          { text: 'Assigned to John Doe', user: admin._id }
        ]
      },
      {
        title: 'CRITICAL: Fix CORS Headers',
        description: 'Urgent production blocker: API returning CORS errors on login submission.',
        priority: 'high',
        status: 'todo',
        assignedTo: admin._id,
        projectId: pApollo._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // OVERDUE
        activities: [
          { text: 'Task created', user: admin._id },
          { text: 'Assigned to Sarah Connor', user: admin._id }
        ]
      },

      // Project Hermes (On Hold)
      {
        title: 'Configure React Native Expo Build',
        description: 'Initialize bare workflow and verify iOS/Android bundle ids.',
        priority: 'medium',
        status: 'todo',
        assignedTo: marcus._id,
        projectId: pHermes._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        activities: [
          { text: 'Task created', user: admin._id }
        ]
      },
      {
        title: 'API Integrations for Mobile Notifications',
        description: 'Research Firebase Push Notifications and format payload headers.',
        priority: 'low',
        status: 'todo',
        assignedTo: emily._id,
        projectId: pHermes._id,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        activities: [
          { text: 'Task created', user: admin._id }
        ]
      },

      // Project Athena (Completed)
      {
        title: 'Prepare Product Hunt Launch Deck',
        description: 'Design the banner, promotional screenshots, tagline, and schedule hunter post.',
        priority: 'high',
        status: 'completed',
        assignedTo: alex._id,
        projectId: pAthena._id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        comments: [
          { user: alex._id, text: 'Draft layout is approved by hunt sponsors. Listing scheduled!' }
        ],
        activities: [
          { text: 'Task created', user: admin._id },
          { text: 'Assigned to Alex Rivera', user: admin._id },
          { text: 'Status updated to completed', user: alex._id }
        ]
      },
      {
        title: 'Publish Launch Article',
        description: 'Draft launch blog post explaining team task coordination benefits and embed landing page gifs.',
        priority: 'medium',
        status: 'completed',
        assignedTo: marcus._id,
        projectId: pAthena._id,
        dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        activities: [
          { text: 'Task created', user: admin._id },
          { text: 'Assigned to Marcus Brody', user: admin._id },
          { text: 'Status updated to completed', user: marcus._id }
        ]
      }
    ];

    const tasks = await Task.create(tasksData);
    console.log(`Seed: Created ${tasks.length} tasks successfully.`);

    console.log('Seed: Database completely seeded!');
    process.exit(0);
  } catch (error) {
    console.error(`Seed: Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
