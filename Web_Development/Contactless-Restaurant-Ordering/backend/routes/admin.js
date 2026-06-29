const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, updateUserRole } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize(['admin']));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
