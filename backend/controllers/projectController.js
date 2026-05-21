const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query;

    // Admin can see all projects; Member can only see projects they are added to or created
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({
        $or: [{ members: req.user.id }, { createdBy: req.user.id }],
      });
    }

    const projects = await query.populate('members', 'name email role avatar').populate('createdBy', 'name email role avatar');

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin Only)
exports.createProject = async (req, res, next) => {
  try {
    // Add user as the creator
    req.body.createdBy = req.user.id;

    // By default, make creator a member of the project
    if (!req.body.members) {
      req.body.members = [req.user.id];
    } else if (!req.body.members.includes(req.user.id)) {
      req.body.members.push(req.user.id);
    }

    const project = await Project.create(req.body);

    const populatedProject = await Project.findById(project._id)
      .populate('members', 'name email role avatar')
      .populate('createdBy', 'name email role avatar');

    res.status(201).json({
      success: true,
      project: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin Only)
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.id || req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Perform update
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('members', 'name email role avatar')
      .populate('createdBy', 'name email role avatar');

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin Only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: req.params.id });

    // Use deleteOne instead of remove
    await Project.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks successfully deleted',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
