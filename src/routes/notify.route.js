const express = require('express');
const router = express.Router();
const {verifyToken} = require('../app/middlewares');
const notifyController = require('../app/controllers/notifyController');

// load notify
router.get(
    '/', 
    verifyToken, 
    notifyController.getNotify

);

module.exports = router;