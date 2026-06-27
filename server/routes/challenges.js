const express = require('express');
const { create, getActive, abandon } = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', create);
router.get('/active', getActive);
router.post('/abandon', abandon);

module.exports = router;
