const express = require('express');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

router
  .route('/:id')
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

module.exports = router;
