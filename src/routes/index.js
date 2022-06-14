const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const meRoute = require('./me.route');
const postRoute = require('./post.route');
const commentRoute = require('./comment.route');
const notifyRoute = require('./notify.route');


function route(app) {
    app.use('/api/auth', authRoute);
    app.use('/api/me', meRoute);
    app.use('/api/user', userRoute);
    app.use('/api/post', postRoute);
    app.use('/api/comment', commentRoute);
    app.use('/api/notify', notifyRoute);
}

module.exports = route;