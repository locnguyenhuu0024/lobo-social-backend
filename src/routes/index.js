const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const meRoute = require('./me.route');
const postRoute = require('./post.route');
const commentRoute = require('./comment.route')


function route(app) {
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/me', meRoute);
    app.use('/api/v1/user', userRoute);
    app.use('/api/v1/post', postRoute);
    app.use('/api/v1/comment', commentRoute);
}

module.exports = route;