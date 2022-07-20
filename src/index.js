const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const route = require('./routes');
const db = require('./config/db');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const socketIO = require('./app/util/socketio');
const dotenv = require('dotenv');
dotenv.config();

const port = 4000;

// Middlewares

// Check cookie
// Chèn url của front-end vào đây
var whitelist = ['https://lobo.today', 'http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(morgan('combined'));
app.use(methodOverride('_method'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Setup view engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    helpers: {
      sum: (a, b) => a + b,
    },
  }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Setup Socket.io
const server = require('http').createServer(app);
app.set('socketio', socketIO(server)); // Gắn socketio vào app để dùng ở các route

db.connect();
route(app);




server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

