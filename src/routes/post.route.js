const express = require('express');
const router = express.Router();
const {verifyToken, verifyTokenAndMeAuth} = require('../app/middlewares');
const postController = require('../app/controllers/postController');
const uploadMulter = require('../app/util/multer')


router.patch('/update/:idPost', verifyTokenAndMeAuth, postController.update);
router.delete('/delete/:idPost', verifyTokenAndMeAuth, postController.delete);
router.put('/love/:idPost', verifyToken, postController.love);
router.get('/:id', verifyToken, postController.getPost);
router.post('/', verifyToken, uploadMulter.array('postImages', 8), postController.upload);
router.get('/', verifyToken, postController.getPosts);


module.exports = router;