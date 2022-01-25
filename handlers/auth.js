require('dotenv').config();

const LocalStrategy = require('passport-local').Strategy;

const mysql = require('mysql');
const bcrypt = require('bcrypt');
const db = require('../models/database');

const connection = mysql.createConnection(db.connection);
connection.query('USE ' + db.database);

module.exports = (passport) => {
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        connection.query("SELECT * FROM users WHERE id = ? ", [id], (err, rows) => done(err, rows[0]));
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, password, done) => {
        connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
            console.log(err);
            if (err) return done(err);
            if (rows.length) console.log("user taken"); //change to flash
            else {
                let newUser = {
                    username,
                    password: bcrypt.hashSync(password, 10)
                };
                let query = "INSERT INTO users (username, password) values (?,?)";
                connection.query(query, [newUser.username, newUser.password], (err, rows) => {
                    console.log(err);
                    if (err) return done(err);
                    newUser.id = rows.insertId;
                    return done(null, newUser);
                });
            }
        });
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, password, done) =>{
        connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
            if (err) return done(err);

            if(!rows.length) console.log('no user found'); //change to flash

            if (!bcrypt.compareSync(password, rows[0].password)) console.log('wrong user or password'); //change to flash

            console.log(rows[0]);
            return done(null, rows[0])
        });
    }));

    // connection.end() bro this breaks it, it times out on its own so we'll fix it once we can redirect 
}