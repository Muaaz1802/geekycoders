const router = require('express').Router();
const auth = require('../middleware/auth');
const jobTrackerController = require('../controllers/jobTrackerController');

router.use(auth);
router.get('/', jobTrackerController.list);
router.get('/:id', jobTrackerController.getOne);
router.post('/', jobTrackerController.create);
router.patch('/:id', jobTrackerController.update);
router.delete('/:id', jobTrackerController.remove);

module.exports = router;
