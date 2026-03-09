const router = require('express').Router();
const auth = require('../middleware/auth');
const coverLetterController = require('../controllers/coverLetterController');

router.use(auth);
router.get('/', coverLetterController.list);
router.get('/:id', coverLetterController.getOne);
router.post('/', coverLetterController.create);
router.patch('/:id', coverLetterController.update);
router.delete('/:id', coverLetterController.remove);

module.exports = router;
