const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.use(auth);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

module.exports = router;
