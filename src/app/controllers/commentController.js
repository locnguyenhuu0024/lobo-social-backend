const {
    validateComment
} = require('../validation');
const {
    mongooseToObject
} = require('../util/mongoose');
const Comment = require('../models/Comment');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


const commentController = {
    // [POST] /comment/
    pushComment: async (req, res) => {
        const url = req.protocol + '://' + req.get('host');
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

            const fullComment = await Comment.aggregate()
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

            res.status(200).json(fullComment);
        } catch (error) {
            console.log(err);
            return res.status(400).json("Đã có lỗi xảy ra!");
        }
    },

    // [GET] /comment/
    loadComment: async (req, res) => {
        try {
            const fullComment = await Comment.aggregate()
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
                foreignField: 'replyTo',
                as: 'replies'
            })
            .lookup({
                from: 'users',
                localField: 'replies.authorID',
                foreignField: '_id',
                pipeline: [
                    
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'authorReplies'
            })

            // TỚI ĐÂY RỒI, 
            // DUYỆT DANH SÁCH REPLIES SAU ĐÓ PUSH VÀO CHỖ COMMENT CẦN PUSH LÀ XONG :))))
            res.status(200).json(fullComment);
        } catch (error) {
            console.log(error);
            return res.status(400).json("Đã có lỗi xảy ra!");
        }
    },

    // [POST] /comment/:idComment
    reply: async (req, res) => {
        const url = req.protocol + '://' + req.get('host');
        const body = {
            authorID: req.body.authorID,
            postID: req.body.postID,
            // image: url + '/uploads/' + req.file.filename,
            content: req.body.content,
            replyTo: req.params.idComment
        }

        console.log(req.body);

        const {value, error} = validateComment(body)
        if(error){
            console.log(error.details[0].message);
            return res.status(400).json(error.details[0].message);
        }
        try {
            const comment = new Comment(value);
            const commentSaved = await comment.save();

            const fullComment = await Comment.aggregate()
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
                foreignField: 'replyTo',
                as: 'replies'
            })

            res.status(200).json(fullComment);
        } catch (error) {
            console.log(err);
            return res.status(400).json("Đã có lỗi xảy ra!");
        }
    },
}

module.exports = commentController;