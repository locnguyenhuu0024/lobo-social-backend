const express = require('express');
const router = express.Router();
const {verifyToken, verifyTokenAndMeAuth} = require('../app/middlewares');
const userController = require('../app/controllers/userController');


router.patch('/update', verifyTokenAndMeAuth, userController.update);
router.patch('/follow/:id', verifyToken, userController.follow);
router.patch('/block/:id', verifyToken, userController.block);
router.get('/find/', verifyToken, userController.find);
router.get('/follow', verifyTokenAndMeAuth, userController.loadFollow);
router.get('/:id', verifyToken, userController.getInfo);


module.exports = router;