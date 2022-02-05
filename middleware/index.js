require('dotenv').config();

const mysql = require('mysql');
const db = require('../models/database');

const connection = mysql.createConnection(db.connection);
connection.query('USE ' + db.database);

const middlewareObj = {};

middlewareObj.authUserPage = (req, res, next) => {
    if (req.isAuthenticated() && req.user.username == req.params.username) return next();
    else {
        req.flash('error', 'You Don\'t Have Permission To Do That');
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Log In First");
    res.redirect("/login");
}


middlewareObj.authUserPost = (req, res, next) => {
    if (req.isAuthenticated()) {
        connection.query(`SELECT * FROM posts JOIN postownership on posts.id = postownership.postID where postownership.studentID = ${req.user.id} AND posts.id = ${req.params.id}`, (err, rows) => {
            if(!rows.length){
                console.log('You Don\'t Have Permission To Do That');
                req.flash('error', 'You Don\'t Have Permission To Do That');
                res.redirect("back");
            }
            else return next();
        });
    }
    else {
        req.flash("error", "Please Log In First");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;