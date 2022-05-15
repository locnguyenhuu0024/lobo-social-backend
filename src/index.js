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

const port = 4000;

// Middlewares

// Check cookie
app.use(cors({ origin: true, credentials: true }));
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

db.connect();
route(app);




app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

