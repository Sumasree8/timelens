const express = require('express');
const { startSession, endSession, saveReflection, getUserSessions } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/start', startSession);
router.post('/end', endSession);
router.post('/reflection', saveReflection);
router.get('/user/:id', getUserSessions);

module.exports = router;
