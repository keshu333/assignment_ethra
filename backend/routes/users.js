const express = require('express');
const {
  getUsers,
  updateUserRole,
  removeUser,
  updateProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getUsers);
router.route('/profile').put(updateProfile);

router.route('/role/:id').put(authorize('admin'), updateUserRole);
router.route('/:id').delete(authorize('admin'), removeUser);

module.exports = router;
