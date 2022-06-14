const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const socketSchema = new mongoose.Schema(
    {
        socketIDs: [
            {
                type: String,
                required: true
            }
        ],
        userID: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
    }, { timestamps: true }
);

const SocketModel = mongoose.model('Socket', socketSchema);
module.exports = SocketModel;