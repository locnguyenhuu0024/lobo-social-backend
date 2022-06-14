const Notify = require('../models/Notify');
const { mongooseSaveModel } = require('../util/mongoose');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const notifyController = {
    saveNotify: async (type, from, data) => {
        try {
            switch (type) {
                case 'COMMENT':{
                    data.content = `
                        ${from.firstname} 
                        ${from.lastname} 
                        vừa bình luận bài đăng của bạn.
                    `;
                    const notify = new Notify(data);
                    await mongooseSaveModel(notify);
                } break;
        
                case 'REPLY_COMMENT': {
                    data.content = `
                        ${from.firstname} 
                        ${from.lastname} 
                        vừa trả lời bình luận của bạn.
                    `;
                    const notify = new Notify(data);
                    await mongooseSaveModel(notify);
                } break;

                case 'LOVE_POST': {
                    data.content = `
                        ${from.firstname} 
                        ${from.lastname}
                        vừa thích bài đăng của bạn.
                    `;
                    //console.log(data);
                    const notify = new Notify(data);
                    await mongooseSaveModel(notify);
                } break;
            
                default:
                    break;
            }
        } catch (error) {
            console.log('error notify');
            console.log(error);
        }
    },

    sendNotify: (io, type, from, to, postID) => {
        switch (type) {
            case 'COMMENT':{
                io.emit(`send-notify-${to}`, {
                    from,
                    postID,
                    content: `
                        ${from.firstname} 
                        ${from.lastname} 
                        vừa bình luận bài đăng của bạn.
                    `,
                    at: Date.now()
                });
            } break;
    
            case 'REPLY_COMMENT': {
                io.emit(`send-notify-${to}`, {
                    from,
                    postID,
                    content: `
                        ${from.firstname} 
                        ${from.lastname} 
                        vừa trả lời bình luận của bạn.
                    `,
                    at: Date.now()
                });
            } break;
        
            case 'LOVE_POST': {
                io.emit(`send-notify-${to}`, {
                    from,
                    postID,
                    content: `
                        ${from.firstname} 
                        ${from.lastname} 
                        vừa thích bài đăng của bạn.
                    `,
                    at: Date.now()
                });
            } break;

            default:
                break;
        }
    },

    // [GET]: 
    getNotify: async (req, res) => {
        try {
            const userID = req.user.id;
            console.log(userID);
            const getNotify = await Notify.aggregate()
            .match({'to': new ObjectId(userID)})
            .lookup({
                from: 'users',
                localField: 'from',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 0}}
                ],
                as: 'from'
            })

            let sortedNoti = getNotify.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
    
            res.status(200).json(sortedNoti);
        } catch (error) {
            console.log('Issue at load notify!');
            res.status(400).json('Đã có lỗi xảy ra.')
        }
    }
};

module.exports = notifyController