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

const authController = {
    // [POST] /auth/register
    register: async (req, res) => {

        // Kiểm tra hợp lệ của thông tin gửi về
        const dataAfterValidate = validateUserRegister(req.body);
        if(dataAfterValidate.error){
            return res.status(400).json(dataAfterValidate.error.details[0].message);
        }
        try {
            // Kiểm tra xem email đã được đăng ký chưa
            const hasUser = await User.findOne({email: req.body.email});
            if(hasUser){
                return res.status(400).json(
                    `Email ${user.email} đã tồn tại, vui lòng dùng email khác!`
                );
            }
            
            const user = new User(dataAfterValidate.value);

            // Thay mật khẩu đã mã hoá vào thành phần
            user['password'] = bcryptHashPass(user.password);
            const savedUser = await mongooseSaveModel(user);
            console.log(savedUser._id);

            sendVerifyEmail({id: savedUser._id, name: savedUser.name, email: savedUser.email})
                .then(() => 
                    res.status(200).json(`Email xác thực đã được gửi về ${savedUser.email}. Vui lòng kiểm tra!`)
                )
                .catch((err) => console.log(err))
            
        } catch (error) {
            return res.status(400).json('Đã có lỗi!');            
        }
    },


    // [POST] /auth/login
    login: async (req, res) => {
        const dataAfterValidate = validateUserLogin(req.body);
        if(dataAfterValidate.error){
            return res.status(400).json("Tên tài khoản hoặc mật khẩu không đúng.");
        }
        try {
            // lưu dữ liệu sau khi validate vào biến data cho gọn
            const data = dataAfterValidate.value;
            const getUser = await User.findOne({email: data.email});
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

                            // Lưu refresh token vao db
                            await User.findByIdAndUpdate({_id: getUser._id}, {refreshToken}, {new: true});

                            res.cookie(
                                'refreshToken', 
                                refreshToken,
                                {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    sameSite: 'strict',
                                }
                            );
                            res.cookie(
                                'userID', 
                                getUser._id,
                                {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    sameSite: 'strict',
                                }
                            );
                            res.status(200).json({
                                user: user,
                                accessToken: genAccessToken(payload)
                            });
                        }else{
                            res.status(401).json({message: "Tên tài khoản hoặc mật khẩu không đúng."});
                        }
                    }else{
                        res.status(401).json({message: "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email."});
                    }
                }else{
                    res.status(401).json({message: "Tài khoản không tồn tại!"});
                }
            }else{
                res.status(401).json({message: "Tên tài khoản hoặc mật khẩu không đúng."});
            }
        } catch (error) {
            console.log(error);
            res.status(400).json("Đã có lỗi xảy ra.");
        }
    },

    // [POST] /auth/verify/:id
    verifyUser: (req, res) => {
        if(verifyByEmail(req.params.id)){
            res.redirect(`/auth/verify/${req.params.id}`);
        }else{
            res.redirect(`/auth/verify/${req.params.id}`);
        }
    },

    // [GET] /auth/verify/:id
    verifiedUser: (req, res) => {
        res.render( 'email-verified' );
    },

    // [POST] /auth/refresh-token
    refreshToken: (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        const userID = req.cookies.userID;

        console.log(refreshToken);
        if(!refreshToken){
            res.status(200).json({message: "Bạn không được xác thực!"});
        }else{
            User.findById({_id: userID})
            .then(user => {
                const payloadRefreshToken = verifyRefreshToken(refreshToken);
                if(payloadRefreshToken.error){
                    res.status(401).json("Lỗi xác thực!");
                }else{
                    if(user._id == payloadRefreshToken.id){
                        const newAccessToken = genAccessToken(payloadRefreshToken);
                        const newRefreshToken = genRefreshToken(payloadRefreshToken);

                        if(user.refreshToken == refreshToken){

                            // Lưu refresh token vao db
                            User.findByIdAndUpdate({_id: user._id}, {refreshToken}, {new: true});
                            
                            res.cookie(
                                'refreshToken', 
                                newRefreshToken,
                                {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    sameSite: 'strict',
                                }
                            );
                            res.cookie(
                                'userID', 
                                user._id,
                                {
                                    httpOnly: true,
                                    secure: false,
                                    path: '/',
                                    sameSite: 'strict',
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
            })
            .catch(err => console.log(err))
        }
    },
    
    // [POST] /auth/logout
    logout: (req, res) => {
        res.clearCookie('refreshToken');
        res.clearCookie('userID');
        res.status(200).json({message: "Bạn đã đăng xuất!"})
    }
}

module.exports = authController;