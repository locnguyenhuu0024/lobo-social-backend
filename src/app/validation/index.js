const {schemaUser, schemaLoginInfo, schemaPost, schemaComment, schemaUpdateInfo, schemaUpdatePost} = require('../schema');

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

function validateComment(body){
    const result = schemaComment.validate(body);
    return result;
}

function validateUpdateInfo(body){
    const result = schemaUpdateInfo.validate(body);
    return result;
}

function validateUpdatePost(body){
    const result = schemaUpdatePost.validate(body);
    return result;
}

module.exports = {
    validateUserRegister, 
    validateUserLogin,
    validatePost,
    validateComment,
    validateUpdateInfo,
    validateUpdatePost
};