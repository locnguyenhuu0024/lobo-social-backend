const {
    mongooseSaveModel,
    isDeleted
} = require('../util/mongoose');
const {
    validatePost
} = require('../validation')
const Post = require('../models/Post');

const postController = {
    upload: async (req, res) => {
        const imageFiles = [];
        const url = req.protocol + '://' + req.get('host')
        for (var i = 0; i < req.files.length; i++) {
            imageFiles.push(url + '/uploads/' + req.files[i].filename)
        }

        const body = {
            author: req.user.id,
            contents: req.body.postContents,
            pathImages: imageFiles
        }

        const {error, value} = validatePost(body);
        if(error){
            return res.status(400).json(error.details[0].message);
        }

        try{
            const post = new Post(value);
            const postSaved = await post.save();
            
            return res.status(201).json(postSaved);
        }catch(err){
            return res.status(400).json({message: "Đã có lỗi xảy ra!"});
        }
    }
};

module.exports = postController;