require('dotenv').config();

const mysql = require('mysql2/promise');
const db = require('../models/database');


pool = mysql.createPool(db.conn);
pool.getConnection(async (err, connection) => {
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


middlewareObj.authUserPost = (req, res, next) => {
    if (req.isAuthenticated()) {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            try {
                connection.query(`SELECT * FROM posts JOIN postownership on posts.id = postownership.postID where postownership.studentID = ${req.user.id} AND posts.id = ${req.params.id}`, (err, rows) => {
                    if (err) throw err;
                    if (!rows.length) {
                        console.log('You Don\'t Have Permission To Do That');
                        req.flash('error', 'You Don\'t Have Permission To Do That');
                        res.redirect("back");
                    }
                    else return next();
                });
            } catch (err) {
                throw err;
            } finally {
                connection.release();
            }
        });
    }
    else {
        req.flash("error", "Please Log In First");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;