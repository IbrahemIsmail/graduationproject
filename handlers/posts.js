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
            if(err) return next(err);
        });
    });
    req.flash('sucess', 'Your post is live!');
    res.redirect('/shop')
};

exports.updatePost = (req, res, next) => {
    let post = {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
    }
    let query = 'UPDATE posts (title, price, description) values (?,?,?)';
}

