require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./models/database');
const mysql = require('mysql2');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const methodOverride = require("method-override");

const mw = require('./middleware');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const courseRoutes = require('./routes/courseRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

require('./handlers/auth')(passport);

app.use(cookieParser(process.env.COOKIESECRET));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    cookie: { maxAge: 86400000 },
    saveUninitialized: false
}));

app.use(flash());

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(methodOverride("_method"));

app.use(express.static(__dirname + "/public"));

pool = mysql.createPool(db.conn);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    if (err) throw err;
    pool.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
        done(err, rows[0]);
    });
});

///////////////////flash message middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.get('/', (req, res) => res.send('under construction'));
app.get('/account/:username', mw.authUserPage, (req, res) => {
    res.render('authentication/userPage', { currUser: req.user });
});
app.use('/', authRoutes);
app.use('/shop', postRoutes);
app.use('/courses', courseRoutes);
app.use('/rating', ratingRoutes);



// error handling
app.use((req, res, next) => {
    // let err = new Error('Not Found');
    // err.status = 404;
    // next(err);
    res.status(404).send(
        "<h1>Page not found on the server</h1>");
});

app.use((err, req, res, next) => {
    console.log(err.status || 500);
    console.log(err.message || 'Oops! something went wrong.');
    req.flash('error', err.message || 'Oops! something went wrong.');
    res.redirect('back');
    return;
    // return res.status(err.status || 500).json({
    //     error: {
    //         message: err.message || 'Oops! something went wrong.'
    //     }
    // });
});


app.listen(process.env.PORT || 3000, () => console.log(`Server is up and running on port ${process.env.PORT || 3000}`));