const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const meRoute = require('./me.route');
const postRoute = require('./post.route');


function route(app) {
    app.use('/auth', authRoute);
    app.use('/me', meRoute);
    app.use('/user', userRoute);
    app.use('/post', postRoute);
}

module.exports = route;