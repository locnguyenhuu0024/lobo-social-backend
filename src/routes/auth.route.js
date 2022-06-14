const express = require('express');
const router = express.Router();
const middlewares = require('../app/middlewares');
const authController = require('../app/controllers/authController');
const uploadMulter = require('../app/util/multer')

router.put('/verify/:id', authController.verifyUser);
router.get('/verify/:id', authController.verifiedUser);
router.post('/register', uploadMulter.array('userImage', 1), authController.register);
router.post('/login', authController.login);
router.post('/loginGoogle', authController.loginWithGoogle);
router.post('/loginFacebook', authController.loginWithFacebook);
router.post('/logout', middlewares.verifyToken, authController.logout);
router.put('/refresh-token', authController.refreshToken);


module.exports = router;