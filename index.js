require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./models/database');
const mysql = require('mysql');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const methodOverride = require("method-override");

const mw = require('./middleware');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

require('./handlers/auth')(passport);

app.use(cookieParser(process.env.COOKIESECRET));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    cookie: { maxAge: 60000 },
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

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    pool = mysql.createPool(db.conn);
    pool.getConnection((err, connection) => {
        if(err) throw err;
        connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
            done(err, rows[0]);
        });
        connection.release();
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
app.use('/', postRoutes);


// error handling
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(res.status || 500);
    console.log(err.message || 'Oops! something went wrong.');
    // return res.status(err.status || 500).json({
    //     error: {
    //         message: err.message || 'Oops! something went wrong.'
    //     }
    // });
});


app.listen(process.env.PORT || 3000, () => console.log(`Server is up and running on port ${process.env.PORT || 3000}`));