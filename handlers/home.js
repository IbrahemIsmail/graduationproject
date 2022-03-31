require('dotenv').config();

const { query } = require('express');
const mysql = require('mysql');
const db = require('../models/database');

pool = mysql.createPool(db.conn);
pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('USE ' + db.conn.database);
    connection.release();
});


exports.getPosts = (req, res, next) => {
    let query = 'SELECT * FROM posts';
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(query, (err, rows) => {
            if (err) return next(err);
            //console.log(rows);
            //res.send("ur mom is hot");
            res.render('home', {posts: rows});
        });
        connection.release();
    });
};