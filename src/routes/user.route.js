const express = require('express');
const router = express.Router();
const {verifyToken} = require('../app/middlewares');
const userController = require('../app/controllers/userController');


router.patch('/follow/:id', verifyToken, userController.follow);
router.patch('/block/:id', verifyToken, userController.block);
router.get('/:id', verifyToken, userController.getInfo);


module.exports = router;