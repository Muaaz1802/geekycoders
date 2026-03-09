const router = require('express').Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.list);
router.get('/:id', templateController.getOne);

module.exports = router;
