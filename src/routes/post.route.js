const express = require('express');
const router = express.Router();
const {verifyToken} = require('../app/middlewares');
const postController = require('../app/controllers/postController');
const uploadMulter = require('../app/util/multer')


// Upload post
router.post('/', verifyToken, uploadMulter.array('postImages', 8), postController.upload);


module.exports = router;