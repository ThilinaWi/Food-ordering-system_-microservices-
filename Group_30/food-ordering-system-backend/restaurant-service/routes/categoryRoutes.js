const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { adminAuth } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.post('/', adminAuth, categoryController.addCategory);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', adminAuth, categoryController.updateCategory);
router.delete('/:id', adminAuth, categoryController.deleteCategory);

module.exports = router;
