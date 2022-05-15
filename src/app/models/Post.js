const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const postSchema = new mongoose.Schema(
    {
        authorID: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        pathImages: {
            type: Array,
            required: true
        },
        contents: {
            type: String,
            default: ''
        },
        like: [
            {
              type: ObjectId,
              ref: 'User'
            }
        ],
        comments: [
            {
              type: ObjectId,
              ref: 'Comment'
            }
        ],
        deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;