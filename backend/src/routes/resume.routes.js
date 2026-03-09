const router = require('express').Router();
const auth = require('../middleware/auth');
const uploadPdfMiddleware = require('../middleware/upload');
const resumeController = require('../controllers/resumeController');
const uploadController = require('../controllers/uploadController');

router.use(auth);

router.get('/', resumeController.list);
router.get('/:id/pdf-url', resumeController.getPdfUrl);
router.get('/:id', resumeController.getOne);
router.post('/upload-pdf', uploadPdfMiddleware, uploadController.uploadPdf);
router.post('/', resumeController.create);
router.patch('/:id', resumeController.update);
router.delete('/:id', resumeController.remove);

module.exports = router;
