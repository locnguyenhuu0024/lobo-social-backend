const {verifyAccessToken, verifyRefreshToken} = require('../util/jwt');
const dotenv = require('dotenv');
dotenv.config();

const middlewares = {
    verifyToken: async (req, res, next) => {
        try {
            const authorizeHeader = req.headers['authorization'];
            if(authorizeHeader != undefined){
                const accessToken = authorizeHeader.split(" ")[1];
            
                // Kiểm tra xem có access token hay không
                if(accessToken){
                    // Nếu có thì xác thực
                    const result = verifyAccessToken(accessToken);
                    if(result.error){
                        res.status(403).json("Token không hợp lệ!");
                    }else{
                        req.user = result;
                        next();
                    }
                }else{
                    return res.status(401).json("Access denied!");
                }
            }else{
                return res.status(401).json("Access denied!");
            }
        } catch (error) {
            return res.status(401).json("Access denied!");
        }
    },

    verifyTokenAndMeAuth: async (req, res, next) => {
        middlewares.verifyToken(req, res, async () => {
            try {
                const result = verifyRefreshToken(req.cookies.refreshToken);
                setTimeout(() => {
                    if(req.user.id == result.id){
                        next();
                    }else{
                        console.log(result.error);
                        return res.status(401).json("Access denied!");
                    }
                }, 1000)
            } catch (error) {
                console.log(error);
                return res.status(401).json("Access denied!");
            }
        })
    },
    
}

module.exports = middlewares;