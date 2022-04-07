require('dotenv').config();

const mysql = require('mysql2');
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


middlewareObj.authUserPost = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {

            let rows = await promisePool.query(`SELECT * FROM posts JOIN postownership on posts.id = postownership.postID where postownership.studentID = ${req.user.id} AND posts.id = ${req.params.id}`);
            if (!rows[0].length) {
                console.log('You Don\'t Have Permission To Do That');
                req.flash('error', 'You Don\'t Have Permission To Do That');
                res.redirect("back");
            }
            else return next();
        }
        else {
            req.flash("error", "Please Log In First");
            res.redirect("/login");
        }
    } catch (err) {
        throw err;
    }
}

module.exports = middlewareObj;