require('dotenv').config();

const LocalStrategy = require('passport-local').Strategy;

const mysql = require('mysql');
const bcrypt = require('bcrypt');
const db = require('../models/database');


pool = mysql.createPool(db.conn);
pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('USE ' + db.conn.database);
    connection.release();
    //  // breaks for some reason. 
});




module.exports = (passport) => {
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query("SELECT * FROM users WHERE id = ? ", [id], (err, rows) => done(err, rows[0]));
            connection.release();

        });
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, password, done) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query('SELECT * FROM users WHERE username = ? OR email = ?', [req.body.username, req.body.email], (err, rows) => {
                console.log(err);
                if (err) return done(err);
                if (req.body.username == '' || req.body.password == '') {
                    req.flash('error', 'Empty fields please insert the requested information');
                    return done();
                }
                if (rows.length) {
                    console.log("user taken"); //change to flash
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
                    connection.query(query, [newUser.username, newUser.email, newUser.password], (err, rows) => {
                        console.log(err);
                        if (err) return done(err);
                        newUser.id = rows.insertId;
                        return done(null, newUser);
                    });
                }
            });
            connection.release();

        });
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, password, done) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
                if (err) return done(err);
                if (req.body.username == '' || req.body.password == '') {
                    req.flash('error', 'Empty fields please insert the requested information');
                    return done();
                }
                if (!rows.length) {
                    console.log('no user found'); //change to flash
                    req.flash('error', 'User does not exist');
                    return done();
                }

                if (!bcrypt.compareSync(password, rows[0].password)) {
                    console.log('wrong user or password'); //change to flash
                    req.flash('error', 'Wrong username or password'); // do something here
                    return done();
                }

                console.log(rows[0]);
                return done(null, rows[0])
            });
            connection.release();
        });

    }));

    //connection.end() //bro this breaks it, it times out on its own so we'll fix it once we can redirect 
}