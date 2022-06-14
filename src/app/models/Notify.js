const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const notifySchema = new mongoose.Schema(
    {
        from: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        postID: {
            type: ObjectId,
            ref: 'Post',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        seen: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
);

const NotifyModel = mongoose.model('Notify', notifySchema);
module.exports = NotifyModel;