const {schemaUser, schemaLoginInfo, schemaPost} = require('../schema');

function validateUserRegister(body){
    const result = schemaUser.validate(body);
    return result;
}

function validateUserLogin(body){
    const result = schemaLoginInfo.validate(body);
    return result;
}

function validatePost(body){
    const result = schemaPost.validate(body);
    return result;
}

module.exports = {
    validateUserRegister, 
    validateUserLogin,
    validatePost
};