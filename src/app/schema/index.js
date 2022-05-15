const Joi = require("joi");

const exampleUser = {
    "name": "Nguyen Huu Loc",
    "email": "locnguyen@gmail.com",
    "username": "nguyenloc2409",
    "password": "12345678",
    "userRole": 1,
    "phoneNumber": "0969422317",
}

const examplePost = {
    "author": "625cdf4d3335bf6280b14af8",
    "title": "Chao ngay moi",
    "pathImages": [
        "uploads/user.png",
        "uploads/user.png"
    ],
    "contents": "Troi hom nay dep the"
}

const exampleComment = {
    "author": "625cdf4d3335bf6280b14af8",
    "title": "Chao ngay moi",
    "pathImages": [
        "uploads/user.png",
        "uploads/user.png"
    ],
    "contents": "Troi hom nay dep the"
}

const schemaUser = Joi.object({
    lastname: Joi.string().required().max(32).min(2),
    firstname: Joi.string().required().max(32).min(2),
    email: Joi.string().email({
        minDomainSegments: 2, tlds: { allow: ['com', 'net'] } 
    }).required(),
    password: Joi.string().pattern(/^[a-zA-Z0-9]{8,16}$/).required(),
    
}).with('email', 'password');

const schemaLoginInfo = Joi.object({
    email: Joi.string().email({
        minDomainSegments: 2, tlds: { allow: ['com', 'net'] } 
    }).required(),
    password: Joi.string().pattern(/^[a-zA-Z0-9]{8,16}$/).required()
}).with('email', 'password');

const schemaPost = Joi.object({
    authorID: Joi.string().required(),
    title: Joi.string(),
    pathImages: Joi.array().required(),
    contents: Joi.string(),
});

const schemaComment = Joi.object({
    authorID: Joi.string().required(),
    postID: Joi.string().required(),
    image: Joi.array(),
    content: Joi.string().required(),
    replyTo: Joi.string(),
});

module.exports = {
    schemaUser, 
    schemaLoginInfo, 
    schemaPost, 
    schemaComment,
};