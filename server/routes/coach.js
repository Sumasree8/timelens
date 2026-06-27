const express = require('express');
const { getCoaching } = require('../controllers/coachController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/:userId', getCoaching);

module.exports = router;
