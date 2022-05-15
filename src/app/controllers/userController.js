const User = require('../models/User');
const {
    mongooseToObject,
    isDeleted,
} = require('../util/mongoose');

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

                const {password, refreshToken, ...user} 
                    = mongooseToObject(await User.findById({_id: userID}));
                res.status(200).json(user);
            }else{
                res.status(404).json({message: "Không thể tìm thấy tài khoản!"});
            }
        } catch (error) {
            res.status(401).json({message: "Đã có lỗi xảy ra!"});
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

                // Lấy danh sách đang theo dõi của mình
                const {following} = mongooseToObject(
                    await User.findById({_id: meID})
                );

                // Check xem có tồn tại userID và meID 
                // trong hai danh sách following và followers chưa
                if(followers.includes(meID) == false && following.includes(userID) == false){
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

            if(isDeletedUser){
                const {blockList} = mongooseToObject(
                    await User.findById({_id: meID})
                );
                if(blockList.includes(userID) == false){
                    await User.findByIdAndUpdate(
                        {_id: meID}, 
                        {$push: {blockList: userID}}
                    );
                    res.status(200).json({message: "Đã chặn người dùng."});
                }else{
                    await User.findByIdAndUpdate(
                        {_id: meID}, 
                        {$pull: {blockList: userID}}
                    );
                    res.status(200).json({message: "Đã bỏ chặn người dùng."});
                }
            }else{
                res.status(404).json({message: "Không thể tìm thấy tài khoản!"});
            }
        } catch (error) {
            console.log(error);
            res.status(401).json({message: "Đã có lỗi xảy ra!"});
        }
    }
}

module.exports = userController;