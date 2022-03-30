require('dotenv').config();

const { query } = require('express');
const mysql = require('mysql');
const db = require('../models/database');

const connection = mysql.createConnection(db.connection);
connection.query('USE ' + db.database);

exports.sendPosts = (req, res, next) => {
    let query = 'SELECT * FROM posts';
    connection.query(query, (err, rows) => {
        if (err) return next(err);
        console.log(rows);
    });
    res.redirect('/home');
    };