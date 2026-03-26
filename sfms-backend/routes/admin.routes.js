const express = require('express');
const router = express.Router();
const { getDashboard, getReports, getTechnicians } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/reports', getReports);
router.get('/technicians', getTechnicians);

module.exports = router;
