const User = require('../models/User');
const {
    mongooseToObject,
    isDeleted
} = require('../util/mongoose');

const meController = {
    // [GET] /me/:username
    getInfo: (req, res) => {
        isDeleted(req.user.id, 'user')
        .then(deleted => {
            console.log(deleted);
            if(deleted == false){
                User.findById({_id: req.user.id})
                .then(result => {
                    const {password, refreshToken, ...me} = mongooseToObject(result);
                    res.status(200).json(me);
                })
                .catch(err => {
                    res.status(404).json({message: "Không thể tìm thấy tài khoản"});
                })
            }else{
                res.status(404).json({message: "Không thể tìm thấy tài khoản!"});
            }
        })
        .catch(err => res.status(401).json({message: "Đã có lỗi xảy ra!"}));
    },

    // [PATCH] /me/update/:username
    updateInfo: (req, res) => {
        const {admin, deleted, ...body} = req.body;
        isDeleted(req.user.id, 'user')
        .then(deleted => {
            if(deleted == false){
                User.findByIdAndUpdate(
                    {_id: req.user.id}, 
                    body, {new: true}
                ).then(newResult => {
                    const {password, refreshToken, ...me} = mongooseToObject(newResult);
                    res.status(200).json(me)
                }).catch(err => res.status(404).json({message: "Không thể cập nhật thông tin"}))
            }else{
                res.status(404).json({message: "Không thể tìm thấy tài khoản!"});
            }
        })
        .catch(err => res.status(401).json({message: "Đã có lỗi xảy ra!"}));
    },

    // [DELETE] /me/delete/:username
    deleteUser: (req, res) => {
        User.findByIdAndUpdate(
            {_id: req.user.id}, 
            {deleted: true}, {new: true}
        ).then(newResult => {
            res.status(200).json({message: "Đã xoá tài khoản thành công"})
        }).catch(err => res.status(404).json({message: "Không thể cập nhật thông tin"}))
    }
}

module.exports = meController;