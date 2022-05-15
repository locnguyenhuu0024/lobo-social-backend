const express = require('express');
const router = express.Router();
const {verifyToken} = require('../app/middlewares');
const postController = require('../app/controllers/postController');
const uploadMulter = require('../app/util/multer')


// Upload post
router.put('/love/:idPost', verifyToken, postController.love);
router.post('/', verifyToken, uploadMulter.array('postImages', 8), postController.upload);
router.get('/', verifyToken, postController.getPosts);


module.exports = router;