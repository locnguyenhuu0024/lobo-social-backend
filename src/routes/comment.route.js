const express = require('express');
const router = express.Router();
const {verifyToken} = require('../app/middlewares');
const commentController = require('../app/controllers/commentController');
const uploadMulter = require('../app/util/multer')


// reply comment
router.post(
    '/:idComment', 
    verifyToken, 
    uploadMulter.single('commentImage'), 
    commentController.reply
);

// load comment của post
router.get(
    '/:idPost', 
    verifyToken, 
    commentController.loadComment
);

// đăng comment
router.post(
    '/', 
    verifyToken, 
    uploadMulter.single('commentImage'), 
    commentController.pushComment
);


module.exports = router;