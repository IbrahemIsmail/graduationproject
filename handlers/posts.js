require('dotenv').config();

const { query } = require('express');
const mysql = require('mysql');
const db = require('../models/database');
// const multer = require("multer");

const connection = mysql.createConnection(db.connection);
connection.query('USE ' + db.database);

// const upload = multer({
//     dest: "/path/to/temporary/directory/to/store/uploaded/files"
//     // you might also want to set some limits: https://github.com/expressjs/multer#limits
//   });

exports.createPost = (req, res, next) => {
    let query = 'INSERT INTO posts (title, price, description) values (?,?,?)';
    let post = {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
    }
    connection.query(query, [post.title, post.price, post.description], (err, rows) => {
        if (err) return next(err);
        console.log(rows);
        let query = 'INSERT INTO postownership (studentID, postID) values (?,?)';
        let ids = {
            studentID: req.user.id,
            postID: rows.insertId,
        }
        connection.query(query, [ids.studentID, ids.postID], (err, rows) => {
            if (err) return next(err);
        });
    });
    req.flash('success', 'Your post is live!');
    res.redirect('/shop')
}

exports.updatePost = (req, res, next) => {
    connection.query(`SELECT * FROM posts JOIN postownership on posts.id = postownership.postID where postownership.studentID = ${req.user.id} AND posts.id = ${req.params.id}`, (err, rows) => {
        if (err) console.log(err); // change to flash
        if (rows.length) {
            let post = {
                title: req.body.title,
                price: req.body.price,
                description: req.body.description
            }
            let query = 'UPDATE posts SET ' + Object.keys(post).map(key => `${key} = ?`).join(', ') + ' WHERE id = ?';
            let params = [...Object.values(post), req.params.id];
            console.log(query);
            console.log(params);
            connection.query(query, params, (err, rows) => {
                if (err) console.log(err);
                req.flash('success', 'Your post is updated!');
                res.redirect('/shop'); // will eventually redirect to the post page
            });
        }
        else {
            console.log('You Don\'t Have Permission To Do That');
            req.flash('error', 'You Don\'t Have Permission To Do That');
            res.redirect("back");
        }
    });
}

exports.deletePost = (req, res, next) => {
    connection.query(`SELECT * FROM posts JOIN postownership on posts.id = postownership.postID where postownership.studentID = ${req.user.id} AND posts.id = ${req.params.id}`, (err, rows) => {
        if (err) console.log(err);
        if (rows.length) {
            connection.query(`DELETE from posts WHERE id = ${req.params.id}`, (err, rows) => {
                if (err) console.log(err);
                req.flash('success', 'Your post is deleted!');
                res.redirect('/shop'); // will eventually redirect to the post page
            });
        }
        else {
            console.log('You Don\'t Have Permission To Do That');
            req.flash('error', 'You Don\'t Have Permission To Do That');
            res.redirect("back");
        }
    });
}

