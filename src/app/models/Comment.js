const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const commentSchema = new mongoose.Schema(
    {
        authorID: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        postID: {
            type: ObjectId,
            ref: 'Post',
            required: true
        },
        image: {
            type: String,
        },
        content: {
            type: String,
            required: true
        },
        like: [
            {
              type: ObjectId,
              ref: 'User'
            }
        ],
        replyTo: {
            type: ObjectId,
            ref: 'Comment',
            default: null
        },
    }, { timestamps: true }
);

const CommentModel = mongoose.model('Comment', commentSchema);
module.exports = CommentModel;