require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./models/database')
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash')

const mw = require('./middleware');

const authRoutes = require('./routes/authRoutes');

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

app.use(express.static(__dirname + "/public"));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const connection = mysql.createConnection(db.connection);
    connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
        done(err, rows[0]);
    });
});

///////////////////flash message middleware
app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.get('/', (req, res) => res.send('under constructions, fuck off'));
app.get('/account/:username', mw.authUser, (req, res) => {
   res.render('authentication/userPage', {currUser: req.user}); 
});
app.use('/auth', authRoutes);

app.listen(process.env.PORT || 3000, () => console.log(`Server is up and running on port ${process.env.PORT || 3000}`));