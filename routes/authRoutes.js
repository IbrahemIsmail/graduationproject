const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const db = require('./database');
var passport = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const router = express.Router();

router.get('/signup', (req, res)=>{
    
});

router.post('/signup', (req, res)=>{
    const connection = mysql.createConnection(db.connection);
    connection.query('USE ' + db.database);
    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true
    }, (request, username, password, done) => {
        connection.query('SELECT * FROM users WHERE username = ?',[username], (err, rows) =>{
            if (err) return done(err);
            if (rows.length) res.send("user taken");
            else {
                let newUser = {
                    username,
                    password: bcrypt.hashSync(password, null, null)
                };
            }
            let query = "INSERT INTO users (username, password) values (?,?)";
            connection.query(query, [newUser.username, newUser.password], (err, rows) => {
                if(err) return done(err);
                newUser.id = rows.insertId;
                return done(null, newUser);
            })
        })
    }));
    connection.end()
});