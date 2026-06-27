const express = require('express');
const { recordRound, getStats } = require('../controllers/trainerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', recordRound);
router.get('/:userId', getStats);

module.exports = router;
