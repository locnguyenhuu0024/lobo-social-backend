const {
    mongooseSaveModel,
    isDeleted,
    mongooseToObject,
    multipleMongooseToObject
} = require('../util/mongoose');
const {
    validatePost
} = require('../validation')
const Post = require('../models/Post');
const User = require('../models/User');

const getPosts = async () => {
    
}

const postController = {
    // [POST] /post/
    upload: async (req, res) => {
        const imageFiles = [];
        const url = req.protocol + '://' + req.get('host');
        for (var i = 0; i < req.files.length; i++) {
            imageFiles.push(url + '/uploads/' + req.files[i].filename);
        }

        const body = {
            authorID: req.body.authorID,
            contents: req.body.postContents,
            pathImages: imageFiles
        };

        const {error, value} = validatePost(body);
        if(error){
            return res.status(400).json(error.details[0].message);
        }

        try{
            const post = new Post(value);
            const postSaved = await post.save();

            const getPost = await Post.aggregate()
            .match({'_id': postSaved._id})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                as: 'author',
                pipeline: [
                    {$project: {
                        'firstname': 1, 
                        'lastname': 1, 
                        'userImage': 1, 
                        '_id': 0
                    }}
                ]
            })
            .lookup({
                from: 'users',
                localField: 'like',
                foreignField: '_id',
                pipeline: [
                    {$project: {
                        'firstname': 1, 
                        'lastname': 1, 
                        'userImage': 1, 
                        '_id': 1
                    }}
                ],
                as: 'like'
            })

            // console.log(getPost);
            return res.status(200).json(getPost);
        }catch(err){
            console.log(err);
            return res.status(400).json("Đã có lỗi xảy ra!");
        }
    },

    // [GET] /posts/
    getPosts: async (req, res) => {
        const userID = req.user.id;
        try {
            const user = await User.findById({_id: userID});

            const posts = await Post.aggregate()
            .match({'$or':[
                {'authorID': user._id}, 
                {'authorID': {'$in': user.following}}
            ]})
            .lookup({
                from: 'users',
                localField: 'authorID',
                foreignField: '_id',
                as: 'author',
                pipeline: [
                    {$project: {
                        'firstname': 1, 
                        'lastname': 1, 
                        'userImage': 1, 
                        '_id': 0
                    }}
                ]
            })
            .lookup({
                from: 'users',
                localField: 'like',
                foreignField: '_id',
                pipeline: [
                    {$project: {
                        'firstname': 1, 
                        'lastname': 1, 
                        'userImage': 1, 
                        '_id': 1
                    }}
                ],
                as: 'like'
            })
            
            // Test
            // console.log(posts);
            // res.status(200).json(posts)

            let newPosts = posts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            res.status(200).json(newPosts);
        } catch (error) {
            console.log(error);
            res.status(400).json('Có lỗi xảy ra!')
        }
    },

    // [PUT] /post/love/:idPost
    love: async (req, res) => {
        const idPost = req.params.idPost;
        const idUser = req.user.id;

        try {
            const {_id, like} = mongooseToObject(
                await Post.findByIdAndUpdate({_id: idPost})
            );

            // Hàm lấy post sau khi like hoặc unlike
            const getNewPost = async () => {
                const newPost = await Post.aggregate()
                .match({'$or':[
                    {'_id': _id},
                ]})
                .lookup({
                    from: 'users',
                    localField: 'like',
                    foreignField: '_id',
                    pipeline: [
                        {$project: {
                            'firstname': 1, 
                            'lastname': 1, 
                            'userImage': 1, 
                            '_id': 1
                        }}
                    ],
                    as: 'like'
                });
                return newPost;
            }

            // u = userID in list like
            const likeList = like.map(u => u.toString());


            if(likeList.includes(idUser.toString()) == false){
                await Post.findByIdAndUpdate(
                    {_id: idPost}, 
                    {$push: {like: idUser}}
                );
                const newPost = await getNewPost();
                console.log(newPost);
                return res.status(201).json(newPost);
            }else{
                await Post.findByIdAndUpdate(
                    {_id: idPost}, 
                    {$pull: {like: idUser}}
                );
                const newPost = await getNewPost();
                console.log(newPost);
                return res.status(201).json(newPost);
            }
        } catch (error) {
            console.log(error);
            return res.status(401).json("Đã có lỗi xảy ra!");
        }
    }
};

module.exports = postController;