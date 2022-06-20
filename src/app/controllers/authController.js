const User = require('../models/User');
const {
    mongooseSaveModel, mongooseToObject
} = require('../util/mongoose');
const {
    validateUserRegister, 
    validateUserLogin
} = require('../validation');
const {bcryptHashPass, comparePass} = require('../util/bcrypt');
const {
    genAccessToken, 
    genRefreshToken, 
    verifyRefreshToken
} = require('../util/jwt');
const {sendVerifyEmail, verifyByEmail} = require('../util/nodemailer');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const authController = {
    // [POST] /auth/register
    register: async (req, res) => {
        try {
            const {body} = req;
            const url = req.protocol + '://' + req.get('host');
            body.userImage = url + '/uploads/' + req.files[0].filename;

            // Kiểm tra hợp lệ của thông tin gửi về
            const dataAfterValidate = validateUserRegister(body);
            if(dataAfterValidate.error){
                console.log(dataAfterValidate.error);
                return res.status(400).json(dataAfterValidate.error.details[0].message);
            }

            // // Kiểm tra xem email đã được đăng ký chưa
            // const hasUser = await User.findOne({email: body.email});
            // if(hasUser){
            //     return res.status(400).json(
            //         `Email ${hasUser.email} đã tồn tại, vui lòng dùng email khác!`
            //     );
            // }
            
            const user = new User(dataAfterValidate.value);

            // Thay mật khẩu đã mã hoá vào thành phần
            user['password'] = bcryptHashPass(user.password);
            const savedUser = await mongooseSaveModel(user);

            sendVerifyEmail({id: savedUser._id, name: savedUser.name, email: savedUser.email})
                .then(() => 
                    res.status(200).json(`Email xác thực đã được gửi về ${savedUser.email}. Vui lòng kiểm tra!`)
                )
                .catch((err) => console.log(err))
            
        } catch (error) {
            console.log(error);
            return res.status(400).json('Đã có lỗi!');            
        }
    },


    // [POST] /auth/login
    login: async (req, res) => {
        const dataAfterValidate = validateUserLogin(req.body);
        if(dataAfterValidate.error){
            return res.status(401).json("Tên tài khoản hoặc mật khẩu không đúng.");
        }
        try {
            // lưu dữ liệu sau khi validate vào biến data cho gọn
            const data = dataAfterValidate.value;
            const getUser = await User.findOne({
                email: data.email, 
                googleID: null, 
                facebookID: null
            });
            if(getUser){
                const {password, refreshToken, deleted, ...user} = mongooseToObject(getUser);
                if(getUser.deleted == false){
                    if(getUser.verified){
                        if(comparePass(data.password, getUser.password)){
                            
                            const payload = {
                                id: getUser._id,
                                admin: getUser.admin,
                                username: getUser.username
                            };
                            const refreshToken = genRefreshToken(payload);
                            const accessToken = genAccessToken(payload);
                            // Lưu refresh token vao db
                            await User.findByIdAndUpdate({_id: getUser._id}, {refreshToken}, {new: true});

                            res.cookie(
                                'refreshToken', 
                                refreshToken,
                                {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    //sameSite: 'strict',
                                }
                            );
                            res.cookie(
                                'userID', 
                                getUser._id,
                                {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    //sameSite: 'strict',
                                }
                            );
                            res.status(200).json({
                                user,
                                accessToken
                            });
                        }else{
                            return res.status(401).json("Tên tài khoản hoặc mật khẩu không đúng.");
                        }
                    }else{
                        return res.status(401).json("Tài khoản chưa được kích hoạt, vui lòng kiểm tra email.");
                    }
                }else{
                    return res.status(401).json("Tài khoản không tồn tại!");
                }
            }else{
                return res.status(401).json("Tên tài khoản hoặc mật khẩu không đúng.");
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json("Đã có lỗi xảy ra.");
        }
    },


    // [POST] /auth/verify/:id
    verifyUser: (req, res) => {
        if(verifyByEmail(req.params.id)){
            res.redirect(`/api/auth/verify/${req.params.id}`);
        }else{
            res.redirect(`/api/auth/verify/${req.params.id}`);
        }
    },

    // [GET] /auth/verify/:id
    verifiedUser: (req, res) => {
        res.render( 'email-verified' );
    },

    // [POST] /auth/refresh-token
    refreshToken: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        const userID = req.cookies.userID;

        if(!refreshToken){
            return res.status(401).json("Bạn không được xác thực!");
        }
        try {
            const user = await User.findById({_id: userID});
            const payloadReToken = verifyRefreshToken(refreshToken);

            if(payloadReToken.error){
                res.status(401).json("Lỗi xác thực!");
            }else{
                if(user._id.toString() === payloadReToken.id.toString()){
                    const newAccessToken = genAccessToken(payloadReToken);
                    const newRefreshToken = genRefreshToken(payloadReToken);
                    
                    if(user.refreshToken == refreshToken){

                        // Lưu refresh token vao db
                        await User.findByIdAndUpdate(
                            {_id: user._id}, 
                            {refreshToken: newRefreshToken}
                        );
                        
                        res.cookie(
                            'refreshToken', 
                            newRefreshToken,
                            {
                                httpOnly: true,
                                secure: false,
                                path: '/',
                                //sameSite: 'strict',
                            }
                        );
                        res.cookie(
                            'userID', 
                            user._id,
                            {
                                httpOnly: true,
                                secure: false,
                                path: '/',
                                //sameSite: 'strict',
                            }
                        );
                        res.status(200).json({
                            accessToken: newAccessToken
                        });
                    }else{
                        res.status(401).json("Refresh Token không hợp lệ!")
                    }
                }else{
                    res.status(401).json("Lỗi xác thực!");
                }
            }
        } catch (error) {
            return res.status(401).json("Bạn không được xác thực!");
        }
    },

    loginWithGoogle: async (req, res) => {
        try {
            const {body} = req;
            const checkUser = await User.findOne({'googleID': body.googleID});
            if(!checkUser){
                // tao user moi
                body.password = '12345678';
                body.verified = true;
                const u = new User(body);
                const userSaved = await mongooseSaveModel(u);
                const payload = {
                    id: userSaved._id,
                    admin: userSaved.admin,
                    username: userSaved.username
                };

                const refreshToken = genRefreshToken(payload);
                const accessToken = genAccessToken(payload);

                await User.findByIdAndUpdate(
                    {_id: userSaved._id}, 
                    {refreshToken}, 
                    {new: true}
                );
                
                const {password, deleted, ...user} = mongooseToObject(userSaved);
                delete user.refreshToken;

                res.cookie(
                    'refreshToken', 
                    refreshToken,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.cookie(
                    'userID', 
                    user._id,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.status(200).json({
                    user,
                    accessToken
                });
            }else{
                // lay du lieu roi tra ve
                const payload = {
                    id: checkUser._id,
                    admin: checkUser.admin,
                    username: checkUser.username
                };

                const refreshToken = genRefreshToken(payload);
                const accessToken = genAccessToken(payload);

                await User.findByIdAndUpdate(
                    {_id: checkUser._id}, 
                    {refreshToken}, 
                    {new: true}
                );
                
                const {password, deleted, ...user} = mongooseToObject(checkUser);
                delete user.refreshToken;

                res.cookie(
                    'refreshToken', 
                    refreshToken,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.cookie(
                    'userID', 
                    user._id,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.status(200).json({
                    user,
                    accessToken
                });
            }
        } catch (error) {
            res.status(400).json('Tài khoản có thể đã tồn tại trong hệ thống, vui lòng kiểm tra lại!')
        }
    },
    
    loginWithFacebook: async (req, res) => {
        try {
            const {body} = req;
            const checkUser = await User.findOne({'facebookID': body.facebookID});
            if(!checkUser){
                // tao user moi
                body.password = '12345678';
                body.verified = true;
                const u = new User(body);
                const userSaved = await mongooseSaveModel(u);
                const payload = {
                    id: userSaved._id,
                    admin: userSaved.admin,
                    username: userSaved.username
                };

                const refreshToken = genRefreshToken(payload);
                const accessToken = genAccessToken(payload);

                await User.findByIdAndUpdate(
                    {_id: userSaved._id}, 
                    {refreshToken}, 
                    {new: true}
                );
                
                const {password, deleted, ...user} = mongooseToObject(userSaved);
                delete user.refreshToken;

                res.cookie(
                    'refreshToken', 
                    refreshToken,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.cookie(
                    'userID', 
                    user._id,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.status(200).json({
                    user,
                    accessToken
                });
            }else{
                // lay du lieu roi tra ve
                const payload = {
                    id: checkUser._id,
                    admin: checkUser.admin,
                    username: checkUser.username
                };

                const refreshToken = genRefreshToken(payload);
                const accessToken = genAccessToken(payload);

                await User.findByIdAndUpdate(
                    {_id: checkUser._id}, 
                    {refreshToken}, 
                    {new: true}
                );
                
                const {password, deleted, ...user} = mongooseToObject(checkUser);
                delete user.refreshToken;

                res.cookie(
                    'refreshToken', 
                    refreshToken,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.cookie(
                    'userID', 
                    user._id,
                    {
                        httpOnly: true,
                        secure: false,
                        path: '/',
                        //sameSite: 'strict',
                    }
                );
                res.status(200).json({
                    user,
                    accessToken
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json('Tài khoản có thể đã tồn tại trong hệ thống, vui lòng kiểm tra lại!')
        }
    },

    // [POST] /auth/logout
    logout: (req, res) => {
        res.clearCookie('refreshToken');
        res.clearCookie('userID');
        res.status(200).json("Bạn đã đăng xuất!")
    }


    
}

module.exports = authController;