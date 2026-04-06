const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', auth, userController.getMyProfile);
router.put('/me', auth, userController.updateMyProfile);
router.get('/', auth, userController.getAllUsers);
router.delete('/:id', auth, userController.deleteUser);
router.get('/:id', auth, userController.getProfile);

module.exports = router;
