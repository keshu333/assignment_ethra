const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all users (Team Members)
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/role/:id
// @access  Private (Admin Only)
exports.updateUserRole = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { role } = req.body;
    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user
// @route   DELETE /api/users/:id
// @access  Private (Admin Only)
exports.removeUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself' });
    }

    // Update projects: remove user from members lists
    await Project.updateMany(
      { members: req.params.id },
      { $pull: { members: req.params.id } }
    );

    // Update tasks: unassign user
    await Task.updateMany(
      { assignedTo: req.params.id },
      { $unset: { assignedTo: 1 } }
    );

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User removed from system successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, avatar, password } = req.body;

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
