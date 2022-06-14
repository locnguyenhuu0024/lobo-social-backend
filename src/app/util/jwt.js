const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const moment = require('moment');

const optionAccessToken = {
    expiresIn: '2h',
    algorithm: 'HS256',
    audience: process.env.JWT_AUDIENCE,
    subject: process.env.JWT_SUBJECT
};

const optionRefreshToken = {
    expiresIn: '365d',
    algorithm: 'HS256',
    audience: process.env.JWT_AUDIENCE,
    subject: process.env.JWT_SUBJECT
};

module.exports = {
    genAccessToken: function(data){
        // Xoá hết option cũ
        delete data.exp;
        delete data.iat;
        delete data.aud;
        delete data.sub;

        return jwt.sign(data, process.env.SECRET_ACCESS_KEY, optionAccessToken);
    },
    genRefreshToken: function(data){
        // Xoá hết option cũ
        delete data.exp;
        delete data.iat;
        delete data.aud;
        delete data.sub;

        return jwt.sign(data, process.env.SECRET_REFRESH_KEY, optionRefreshToken);
    },
    verifyAccessToken: function(token){
        try {
            return jwt.verify(
                token, 
                process.env.SECRET_ACCESS_KEY, 
                {
                    audience: optionAccessToken.audience, 
                    subject: optionAccessToken.subject
                }
            );
        } catch (error) {
            return {error};
        }
    },
    verifyRefreshToken: function(token){
        try {
            return jwt.verify(
                token, 
                process.env.SECRET_REFRESH_KEY, 
                {
                    audience: optionRefreshToken.audience, 
                    subject: optionRefreshToken.subject
                }
            );
        } catch (error) {
            return {error};
        }
    },
    isExpiredToken: function(token){
        const payload = jwt.verify(
            token, process.env.SECRET_ACCESS_KEY, 
            {audience: option.audience, subject: option.subject}
        );
        
        if(Date.now() >= payload.exp*1000){
            // Thời gian hiên tại lớn hơn hết hạn token => trả về true
            // Đã hết hạn
            return true;
        }else{
            // Thời gian hiện tại nhỏ hơn hết hạn token => trả về false
            // Còn hạn
            return false;
        }
    }
}