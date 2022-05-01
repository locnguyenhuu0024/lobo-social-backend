const express = require('express');
const router = express.Router();
const middlewares = require('../app/middlewares');
const authController = require('../app/controllers/authController');

router.put('/verify/:id', authController.verifyUser);
router.get('/verify/:id', authController.verifiedUser);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', middlewares.verifyToken, authController.logout);
router.patch('/refresh-token', authController.refreshToken);


module.exports = router;