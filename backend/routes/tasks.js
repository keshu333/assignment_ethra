const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  addAttachment,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router
  .route('/:id')
  .put(updateTask) // both member (only status) and admin can put, logic is in controller
  .delete(authorize('admin'), deleteTask);

router.route('/:id/comments').post(addComment);
router.route('/:id/attachments').post(addAttachment);

module.exports = router;
