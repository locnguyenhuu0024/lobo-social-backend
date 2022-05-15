const {verifyAccessToken} = require('../util/jwt');
const dotenv = require('dotenv');
dotenv.config();

const middlewares = {
    verifyToken: (req, res, next) => {
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
                res.status(401).json("Access denied!");
            }
        }else{
            res.status(401).json("Access denied!");
        }
    
        
    },
    verifyTokenAndMeAuth: (req, res, next) => {
        middlewares.verifyToken(req, res, () => {
            if(req.user.username == req.params.username){
                next();
            }else{
                res.status(401).json("Access denied!");
            }
        })
    },
    
}

module.exports = middlewares;