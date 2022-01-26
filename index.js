require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./models/database')
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash')

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
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');


app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const connection = mysql.createConnection(db.connection);
    connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
        done(err, rows[0]);
    });
});

app.get('/', (req, res) => res.send('under constructions, fuck off'));

app.use('/auth', authRoutes);

app.listen(process.env.PORT || 3000, () => console.log(`Server is up and running on port ${process.env.PORT || 3000}`));