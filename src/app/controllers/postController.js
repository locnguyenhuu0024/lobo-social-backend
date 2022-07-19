const {
    mongooseToObject,
} = require('../util/mongoose');
const {
    validatePost, validateUpdatePost
} = require('../validation');
const Post = require('../models/Post');
const User = require('../models/User');
const notifyController = require('./notifyController');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


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
            console.log(error.details[0].message);
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
            .match({'$and': [
                {'deleted': false}, 
                {'$or': [
                    {'authorID': user._id}, {'authorID': {$in: user.following}}
                ]}
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
        const io = req.app.get('socketio');

        try {
            const {_id, like} = mongooseToObject(
                await Post.findByIdAndUpdate({_id: idPost})
            );

            // Hàm lấy post sau khi like hoặc unlike
            const getNewPost = async () => {
                const newPost = await Post.aggregate()
                .match({'$and':[
                    {'_id': _id},
                    {'deleted': false}
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
                })
                .lookup({
                    from: 'users',
                    localField: 'authorID',
                    foreignField: '_id',
                    pipeline: [
                        {$project: {
                            'firstname': 1, 
                            'lastname': 1, 
                            'userImage': 1, 
                            '_id': 1
                        }}
                    ],
                    as: 'author'
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

                // Send thông báo có người thích bài đăng
                // Lấy thông tin người bấm thích
                const getUser = mongooseToObject(
                    await User.findById({'_id': new ObjectId(idUser)})
                );
                const author = {
                    userImage: getUser.userImage,
                    firstname: getUser.firstname,
                    lastname: getUser.lastname,
                    _id: getUser._id
                }
                // console.log(newPost[0].authorID);
                // console.log(author._id);
                if(author._id.toString() != newPost[0].authorID.toString()){
                    notifyController.sendNotify(
                        io, 
                        'LOVE_POST', 
                        author, 
                        newPost[0].authorID
                    );

                    notifyController.saveNotify(
                        'LOVE_POST', 
                        author, 
                        {
                            from: author._id,
                            to: newPost[0].authorID, 
                            postID: newPost[0]._id, 
                        }
                    )
                }
                return res.status(201).json(newPost);
            }else{
                await Post.findByIdAndUpdate(
                    {_id: idPost}, 
                    {$pull: {like: idUser}}
                );
                const newPost = await getNewPost();

                return res.status(201).json(newPost);
            }
        } catch (error) {
            console.log(error);
            return res.status(401).json("Đã có lỗi xảy ra!");
        }
    }, 

    getPost: async (req, res) => {
        const idPost = req.params.id;
        try {
            const post = await Post.aggregate()
            .match({$and: [{'_id': new ObjectId(idPost)}, {'deleted': false}]})
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
                        '_id': 1
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

            res.status(200).json(post[0]);
        } catch (error) {
            console.log(error);
            res.status(400).json('Có lỗi xảy ra!');
        }
    },

    update: async (req, res) => {
        try {
            const {body} = req;
            const {idPost} = req.params;

            const imageFiles = [];
            const url = req.protocol + '://' + req.get('host');
            for (var i = 0; i < req.files.length; i++) {
                imageFiles.push(url + '/uploads/' + req.files[i].filename);
            }

            body.updatedPath = body.updatedPath 
            ? [...body.updatedPath.split(','), ...imageFiles] 
            : [...imageFiles];
            
            const data = {
                contents: body.postContents,
                pathImages: body.updatedPath,
            }

            const {error, value} = validateUpdatePost(data);
            if(value){
                await Post.findByIdAndUpdate({'_id': idPost}, {$set: value});
                const post = await Post.aggregate()
                .match({$and: [{'_id': new ObjectId(idPost)}, {'deleted': false}]})
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
                            '_id': 1
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
                return res.status(200).json({msg: 'Cập nhật bài đăng thành công!', data: post[0]});
            }else{
                console.log(error);
                return res.status(400).json('Có lỗi xảy ra!');
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json('Có lỗi xảy ra!');
        }
    },

    delete: async (req, res) => {
        try {
            const {idPost} = req.params;
            await Post.findByIdAndUpdate({'_id': idPost}, {$set: {'deleted': true}});
            return res.status(200).json('Xoá bài đăng thành công!');
        } catch (error) {
            console.log(error);
            return res.status(400).json('Có lỗi xảy ra!');
        }
    },

    loadExplore: async (req, res) => {
        
    }
};

module.exports = postController;