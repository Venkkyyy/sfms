const express = require('express');
const router = express.Router();
const {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getResources);
router.post('/', authorize('admin'), createResource);
router.patch('/:id', authorize('admin'), updateResource);
router.delete('/:id', authorize('admin'), deleteResource);

module.exports = router;
