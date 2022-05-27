require('dotenv').config();

const LocalStrategy = require('passport-local').Strategy;

const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const db = require('../models/database');


const pool = mysql.createPool(db.conn);
const promisePool = pool.promise();

promisePool.getConnection(async (err, connection) => {
    if (err) throw err;
    try {
        await connection.query('USE ' + db.conn.database);
    } catch (err) {
        throw err;
    } finally {
        connection.release();
    }
});




module.exports = (passport) => {
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser(async (id, done) => {
        try {
            let rows = await promisePool.query("SELECT * FROM users WHERE id = ? ", [id]);
            done(null, rows[0][0]);
        } catch (err) {
            throw err;
        }
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done) => {
        try {
            let rows = await promisePool.query('SELECT * FROM users WHERE username = ? OR email = ?', [req.body.username, req.body.email]);
            if (req.body.username == '' || req.body.password == '') {
                req.flash('error', 'Empty fields please insert the requested information');
                return done();
            }
            if (rows[0].length) {
                // console.log("user taken"); //change to flash
                req.flash('error', 'User taken');
                return done();
            }
            else {
                let newUser = {
                    username: username.trim() || req.body.username.trim(),
                    email: req.body.email.trim(),
                    password: bcrypt.hashSync(password || req.body.password, 10)
                };
                let query = "INSERT INTO users (username, email, password) values (?,?,?)";
                let rows = await promisePool.query(query, [newUser.username, newUser.email, newUser.password]);
                newUser.id = rows[0].insertId;
                return done(null, newUser);
            }
        } catch (err) {
            return done(err);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done) => {
        try {
            let rows = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
            if (req.body.username == '' || req.body.password == '') {
                req.flash('error', 'Empty fields please insert the requested information');
                return done();
            }
            if (!rows[0].length) {
                console.log('no user found'); //change to flash
                req.flash('error', 'User does not exist');
                return done();
            }

            if (!bcrypt.compareSync(password, rows[0][0].password)) {
                // console.log('wrong user or password'); //change to flash
                req.flash('error', 'Wrong username or password'); // do something here
                return done();
            }
            console.log(rows[0][0]);
            return done(null, rows[0][0]);
        } catch (err) {
            return done(err);
        }
    }));
}