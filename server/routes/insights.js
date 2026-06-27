const express = require('express');
const { getInsights } = require('../controllers/insightController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.get('/:userId', getInsights);

module.exports = router;
