require('dotenv').config();

const { query } = require('express');
const mysql = require('mysql');
const db = require('../models/database');


const connection = mysql.createConnection(db.connection);
connection.query('USE ' + db.database);



exports.createPost = (req, res, next) => {
    // console.log(req.file);
    // console.log(req.body);
    // let img = req.file.buffer.toString("base64");
    let query = 'INSERT INTO posts (title, price, description, image) values (?,?,?,?)';
    // the database needs an extension fieled to render the correct extension (exten: req.file.mimetype)
    let post = {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        image: req.file,
    }
    console.log(post);
    connection.query(query, [post.title, post.price, post.description, post.image], (err, rows) => {
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
};

exports.viewEdit = (req, res, next) => {
    connection.query(`SELECT * FROM posts WHERE id = ${req.params.id}`, (err, rows) => {
        if (err) console.log(err); //change to next at some point
        console.log(rows);
        let post = {
            title: rows[0].title,
            price: rows[0].price,
            description: rows[0].description,
            image: rows[0].image,
        }
        console.log(post);
        res.render('posts/editPost', {post});
    });
}

exports.updatePost = (req, res, next) => {
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

exports.deletePost = (req, res, next) => {
    connection.query(`DELETE from posts WHERE id = ${req.params.id}`, (err, rows) => {
        if (err) console.log(err);
        req.flash('success', 'Your post is deleted!');
        res.redirect('/shop'); // will eventually redirect to the post page
    });
}

