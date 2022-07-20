const User = require('../models/User');
const {
    mongooseToObject,
    isDeleted,
} = require('../util/mongoose');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Post = require('../models/Post');
const {validateUpdateInfo} = require('../validation');

const userController = {
    // [GET] /user/:username
    getInfo: async (req, res) => {
        const userID = req.params.id;

        try {
            // Check xem user bị xoá hay chưa
            const isDeletedUser = await isDeleted(userID, 'user');

            if(isDeletedUser == false){
                // Lấy thông tin của người dùng, loại trừ password và refreshToken.
                // Sau đó gửi thông tin còn lại về client.

                // const {password, refreshToken, ...user} 
                //     = mongooseToObject(await User.findById({_id: userID}));

                const user = await User.aggregate()
                .match({'_id': new ObjectId(userID)})
                .project({'password': 0, 'refreshToken': 0})
                .lookup({
                    from: 'users',
                    localField: 'following',
                    foreignField: '_id',
                    pipeline: [
                        {$project: {
                            'firstname': 1, 
                            'lastname': 1, 
                            'userImage': 1, 
                            '_id': 1
                        }}
                    ],
                    as: 'following'
                })
                .lookup({
                    from: 'users',
                    localField: 'followers',
                    foreignField: '_id',
                    pipeline: [
                        {$project: {
                            'firstname': 1, 
                            'lastname': 1, 
                            'userImage': 1, 
                            '_id': 1
                        }}
                    ],
                    as: 'followers'
                })

                const posts = await Post.aggregate()
                .match({$and: [{'authorID': new ObjectId(userID)}, {'deleted': false}]})
                .lookup({
                    from: 'users',
                    localField: 'authorID',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        {$project: {
                            'firstname': 1, 
                            'lastname': 1, 
                            'userImage': 1, 
                            '_id': 0
                        }}
                    ]
                })
                .lookup({
                    from: 'users',
                    localField: 'like',
                    foreignField: '_id',
                    pipeline: [
                        {$project: {
                            'firstname': 1, 
                            'lastname': 1, 
                            'userImage': 1, 
                            '_id': 1
                        }}
                    ],
                    as: 'like'
                })

                user[0].posts = posts;
                

                res.status(200).json(user[0]);
            }else{
                res.status(404).json("Không thể tìm thấy tài khoản!");
            }
        } catch (error) {
            console.log(error);
            res.status(401).json("Đã có lỗi xảy ra!");
        }
    },

    // [GET] /user/follow/
    loadFollow: async (req, res) => {
        const id = req.user.id;
        try {
            const list = await User.aggregate()
            .match({'_id': new ObjectId(id)})
            .lookup({
                from: 'users',
                localField: 'following',
                foreignField: '_id',
                pipeline: [
                    {$project: {'firstname': 1, 'lastname': 1, 'userImage': 1, '_id': 1}}
                ],
                as: 'following'
            })

            const {following} = list[0];

            res.status(201).json(following)
        } catch (error) {
            res.status(400).json('Đã có lỗi xảy ra.');
            console.log(error);
        }
    },

    // [POST] /user/follow/:id
    // Xử lý cả follow và unfollow
    follow: async (req, res) => {
        const userID = req.params.id;
        const meID = req.user.id;

        try {
            // Check xem user bị xoá hay chưa
            const isDeletedUser = await isDeleted(userID, 'user');

            if(isDeletedUser == false){
                // Lấy danh sách followers của user
                const {followers} = mongooseToObject(
                    await User.findById({_id: userID})
                );
                // u = userID in list like
                const stringFollowers = followers.map(u => u.toString());

                // Lấy danh sách đang theo dõi của mình
                const {following} = mongooseToObject(
                    await User.findById({_id: meID})
                );
                // u = userID in list like
                const stringFollowing = following.map(u => u.toString());


                // Check xem có tồn tại userID và meID 
                // trong hai danh sách following và followers chưa
                if(
                    stringFollowers.includes(meID) 
                    == false && stringFollowing.includes(userID) 
                    == false
                ){
                    // Nếu chưa thì thêm vào

                    // Thêm meID vào danh sách người theo dõi của user kia
                    await User.findByIdAndUpdate({_id: userID}, {$push: {followers: meID}});

                    // Thêm userID vào danh sách đang theo dõi của mình
                    await User.findByIdAndUpdate({_id: meID}, {$push: {following: userID}});

                    return res.status(200).json({message: "Đã theo dõi."})
                }else{
                    // Nếu có rồi thì xoá đi

                    // Xoá id của mình trong danh sách người theo dõi của user
                    await User.findByIdAndUpdate({_id: userID}, {$pull: {followers: meID}});

                    // Xoá id của user trong danh sách đang theo dõi của mình
                    await User.findByIdAndUpdate({_id: meID}, {$pull: {following: userID}});

                    return res.status(200).json("Đã bỏ theo dõi.")
                }
            }else{
                return res.status(404).json("Không thể tìm thấy tài khoản!");
            }
        } catch (error) {
            console.log(error);
            return res.status(401).json("Đã có lỗi xảy ra!");
        }
    },

    // [Put] /user/block/:id
    // Xử lý cả block và unblock
    block: async (req, res) => {
        const userID = req.params.id;
        const meID = req.user.id;

        try {
            // Check xem user bị xoá hay chưa
            const isDeletedUser = await isDeleted(userID, 'user');

            if(isDeletedUser == false){
                const {blockList} = mongooseToObject(
                    await User.findById({_id: meID})
                );
                // u = userID in list like
                const stringBlocklist = blockList.map(u => u.toString());
                if(stringBlocklist.includes(userID) == false){
                    await User.findByIdAndUpdate(
                        {_id: meID}, 
                        {$push: {blockList: userID}}
                    );

                    await User.findByIdAndUpdate(
                        {_id: userID}, 
                        {$push: {blockBy: meID}}
                    );
                    
                    // Xoá id của mình trong danh sách người theo dõi của user
                    await User.findByIdAndUpdate(
                        {_id: userID}, 
                        {$pull: {followers: meID}}
                    );

                    // Xoá id của user trong danh sách đang theo dõi của mình
                    await User.findByIdAndUpdate(
                        {_id: meID}, 
                        {$pull: {following: userID}}
                    );
                    res.status(200).json("Đã chặn người dùng.");
                }else{
                    await User.findByIdAndUpdate(
                        {_id: meID}, 
                        {$pull: {blockList: userID}}
                    );
                    res.status(200).json("Đã bỏ chặn người dùng.");
                }
            }else{
                res.status(404).json("Không thể tìm thấy tài khoản!");
            }
        } catch (error) {
            console.log(error);
            res.status(401).json("Đã có lỗi xảy ra!");
        }
    },

    // [GET] /find/?name=...
    find: async (req, res) => {
        try {
            const name = (req.query.name);
            const user = await User.findById({_id: req.user.id});
            
            const listUser = await User.aggregate()
            .match({$and: [
                {$text: {$search: name}},
                {'_id': {$nin: user.blockList}},
                {'_id': {$nin: user.blockBy}}
            ]})
            .project({lastname: 1, firstname: 1, userImage: 1, _id: 1, followers: 1})

            res.status(200).json(listUser);
        } catch (error) {
            console.log('find error');
            console.log(error);
            res.status(400).json('Đã có lỗi xảy ra!');
        }
    },

    // [PATCH] /update/
    update: async (req, res) => {
        try {
            const {body} = req;
            const userID = req.user.id;
            const {error, value} = validateUpdateInfo(body);
            if(!error){
                await User.findByIdAndUpdate({'_id': userID}, {$set: value});
                res.status(200).json('Cập nhật thành công!');
            }else{
                res.status(400).json('Đã có lỗi xảy ra!');
                console.log(error);
            }
        } catch (error) {
            console.log(error);
            res.status(400).json('Đã có lỗi xảy ra!');
        }
    }
}

module.exports = userController;