const {
    validateComment
} = require('../validation');
const {
    mongooseToObject
} = require('../util/mongoose');
const Comment = require('../models/Comment');

const mongoose = require('mongoose');
const Post = require('../models/Post');
const ObjectId = mongoose.Types.ObjectId;
const notifyController = require('./notifyController');

const commentController = {
    // [POST] /comment/
    pushComment: async (req, res) => {
        const url = req.protocol + '://' + req.get('host');
        const io = req.app.get('socketio');
        const body = {
            authorID: req.body.authorID,
            postID: req.body.postID,
            // image: url + '/uploads/' + req.file.filename,
            content: req.body.content
        }

        const {value, error} = validateComment(body)
        if(error){
            console.log(error.details[0].message);
            return res.status(400).json(error.details[0].message);
        }
        try {
            const comment = new Comment(value);
            const commentSaved = await comment.save();

            const rootComment = await Comment.aggregate()
            .match({'_id': commentSaved._id})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'author'
            })
            .lookup({
                from: 'comments',
                localField: '_id',
                foreignField: 'postID',
                as: 'replies'
            })

            const replyComment = await Comment.aggregate()
            .match({'postID': commentSaved.postID, 'replyTo': {'$ne': null}})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                pipeline: [
                    {$project: {
                        'firstname': 1, 
                        'lastname': 1, 
                        'userImage': 1, 
                        '_id': 0
                    }}
                ],
                as: 'author'
            })

            for (const ro of rootComment) {
                for (const re of replyComment) {
                    if(ro._id.toString() === re.replyTo.toString()){
                        ro['replies'].push(re);
                    }else{
                        continue;
                    }
                }
            }

            
            const getPost = await Post.findById({_id: new ObjectId(body.postID)});
            const authorCmt = rootComment[0].author[0];
            // body.authorID là id của ngưỜi gửi comment
            // getPost.authorID là id của chủ post
            // nếu author của comment và post khác nhau 
            // thì mới gửi thông báo
            if(getPost.authorID.toString() != body.authorID){
                // Khác thì gửi thông báo về chủ post
                notifyController.sendNotify(
                    io, 
                    'COMMENT', 
                    authorCmt, 
                    getPost.authorID, 
                    getPost.postID
                );
                // Sau đó lưu vào db
                notifyController.saveNotify(
                    'COMMENT', 
                    rootComment[0].author[0], 
                    {
                        from: rootComment[0].authorID, 
                        to: getPost.authorID,
                        postID: getPost._id
                    }
                )
            }

            res.status(200).json(rootComment);
        } catch (error) {
            console.log(error);
            return res.status(400).json("Đã có lỗi xảy ra!");
        }
    },

    // [GET] /comment/
    loadComment: async (req, res) => {
        try {
            const rootComment = await Comment.aggregate()
            .match({'postID': ObjectId(req.params.idPost), 'replyTo': null})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'author'
            })
            .lookup({
                from: 'comments',
                localField: '_id',
                foreignField: 'postID',
                as: 'replies'
            })

            const replyComment = await Comment.aggregate()
            .match({'postID': ObjectId(req.params.idPost), 'replyTo': {'$ne': null}})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'author'
            })

            for (const ro of rootComment) {
                for (const re of replyComment) {
                    if(ro._id.toString() === re.replyTo.toString()){
                        ro['replies'].push(re);
                    }else{
                        continue;
                    }
                }
            }

            // console.log(rootComment);
            // TỚI ĐÂY RỒI, 
            // DUYỆT DANH SÁCH REPLIES SAU ĐÓ PUSH VÀO CHỖ COMMENT CẦN PUSH LÀ XONG :))))
            res.status(200).json(rootComment);
        } catch (error) {
            console.log(error);
            return res.status(400).json("Đã có lỗi xảy ra!");
        }
    },

    // [POST] /comment/:idComment
    reply: async (req, res) => {
        const io = req.app.get('socketio');
        const url = req.protocol + '://' + req.get('host');
        const body = {
            authorID: req.body.authorID,
            postID: req.body.postID,
            // image: url + '/uploads/' + req.file.filename,
            content: req.body.content,
            replyTo: req.params.idComment
        }

        const {value, error} = validateComment(body)
        if(error){
            console.log(error.details[0].message);
            return res.status(400).json(error.details[0].message);
        }
        try {
            const comment = new Comment(value);
            const commentSaved = await comment.save();

            const rootComment = await Comment.aggregate()
            .match({'_id': commentSaved.replyTo})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'author'
            })
            .lookup({
                from: 'comments',
                localField: '_id',
                foreignField: 'postID',
                as: 'replies'
            })

            const replyComment = await Comment.aggregate()
            .match({'postID': commentSaved.postID, 'replyTo': {'$ne': null}})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'author'
            })

            for (const ro of rootComment) {
                for (const re of replyComment) {
                    if(ro._id.toString() === re.replyTo.toString()){
                        ro['replies'].push(re);
                    }else{
                        continue;
                    }
                }
            }

            
            const getPost = await Post.findById({_id: new ObjectId(body.postID)});
            const au = await Comment.aggregate()
            .match({'_id': commentSaved._id})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'author'
            })

            if(rootComment[0].authorID != body.authorID){
                // Khác thì gửi thông báo về chủ post
                notifyController.sendNotify(
                    io, 
                    'REPLY_COMMENT', 
                    au[0].author[0], 
                    rootComment[0].authorID, 
                    getPost.postID
                );
                // Sau đó lưu vào db
                notifyController.saveNotify(
                    'REPLY_COMMENT', 
                    au[0].author[0],
                    {
                        from: body.authorID, 
                        to: rootComment[0].authorID,
                        postID: body.postID
                    }
                )
            }

            res.status(200).json(rootComment);
        } catch (error) {
            console.log(error);
            return res.status(400).json("Đã có lỗi xảy ra!");
        }
    },
}

module.exports = commentController;