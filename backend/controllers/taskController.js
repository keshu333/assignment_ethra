const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { projectId, priority, status, search } = req.query;
    let queryObj = {};

    // 1. Project filtering & accessibility checks
    if (projectId) {
      queryObj.projectId = projectId;
      // Member access check
      if (req.user.role !== 'admin') {
        const project = await Project.findById(projectId);
        if (!project || (!project.members.includes(req.user.id) && project.createdBy.toString() !== req.user.id)) {
          return res.status(403).json({ success: false, message: 'Not authorized to view tasks in this project' });
        }
      }
    } else if (req.user.role !== 'admin') {
      // Member without explicit projectId: get tasks in projects they belong to, or assigned tasks
      const userProjects = await Project.find({
        $or: [{ members: req.user.id }, { createdBy: req.user.id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      queryObj.$or = [
        { projectId: { $in: projectIds } },
        { assignedTo: req.user.id }
      ];
    }

    // 2. Extra Filters
    if (priority) {
      queryObj.priority = priority;
    }
    if (status) {
      queryObj.status = status;
    }
    if (search) {
      queryObj.$and = queryObj.$and || [];
      queryObj.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const tasks = await Task.find(queryObj)
      .populate('assignedTo', 'name email role avatar')
      .populate('projectId', 'title status deadline')
      .populate('comments.user', 'name email role avatar')
      .populate('activities.user', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin Only)
exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    // Check project existence
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Create task
    const task = await Task.create(req.body);

    // Add activity log
    task.activities.push({
      text: `Task created: "${task.title}"`,
      user: req.user.id,
    });
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('projectId', 'title status deadline')
      .populate('comments.user', 'name email role avatar')
      .populate('activities.user', 'name email role avatar');

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Member: can ONLY update 'status'
    if (req.user.role !== 'admin') {
      const allowedKeys = ['status'];
      const updateKeys = Object.keys(req.body);
      const isOnlyStatusUpdate = updateKeys.every((key) => allowedKeys.includes(key));

      if (!isOnlyStatusUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status',
        });
      }

      // Track status change log
      if (req.body.status && req.body.status !== task.status) {
        task.activities.push({
          text: `Status updated from "${task.status}" to "${req.body.status}"`,
          user: req.user.id,
        });
      }

      task.status = req.body.status;
      await task.save();
    } else {
      // Admin: can update everything
      // Track logs for important changes
      if (req.body.status && req.body.status !== task.status) {
        task.activities.push({
          text: `Status updated from "${task.status}" to "${req.body.status}"`,
          user: req.user.id,
        });
      }
      if (req.body.assignedTo && req.body.assignedTo !== (task.assignedTo ? task.assignedTo.toString() : '')) {
        task.activities.push({
          text: `Assigned user updated`,
          user: req.user.id,
        });
      }

      // Update all fields
      Object.assign(task, req.body);
      await task.save();
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('projectId', 'title status deadline')
      .populate('comments.user', 'name email role avatar')
      .populate('activities.user', 'name email role avatar');

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin Only)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Task successfully deleted',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const newComment = {
      user: req.user.id,
      text: req.body.text,
    };

    task.comments.push(newComment);
    
    // Add activity log
    task.activities.push({
      text: `Added a comment`,
      user: req.user.id,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('projectId', 'title status deadline')
      .populate('comments.user', 'name email role avatar')
      .populate('activities.user', 'name email role avatar');

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add file attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
exports.addAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Please provide attachment name and URL' });
    }

    task.attachments.push({ name, url });

    // Add activity log
    task.activities.push({
      text: `Attached file: "${name}"`,
      user: req.user.id,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('projectId', 'title status deadline')
      .populate('comments.user', 'name email role avatar')
      .populate('activities.user', 'name email role avatar');

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};
