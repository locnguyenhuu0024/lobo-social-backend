const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        author: {
            type: String,
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
        like: {
            type: Array,
            default: []
        },
        comments: {
            type: Array,
            default: []
        },
        deleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;