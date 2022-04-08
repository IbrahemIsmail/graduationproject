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


exports.getCourses = async (req, res, next) => {
    try {
        let query = 'SELECT * FROM courses';
        let rows = await promisePool.query(query);
        res.render('coursesHome', { posts: rows[0], currentUser: req.user });
    } catch (err) {
        throw err;
    }
};





exports.getCourse = async (req, res, next) => {
    try {
        let rows = await promisePool.query(`SELECT * FROM courses WHERE id = ${req.params.id}`);
        let course = {
            id: rows[0][0].id,
            name: rows[0][0].name,
            teacherID: rows[0][0].teacherID,
            department: rows[0][0].department,
        }
        // console.log(post);
        res.render('courses/showCourse', { course, currentUser: req.user });
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
};

exports.searchPost = async (req, res) => {
    searchData = req.body.search;
    try {
        let query = `SELECT * FROM courses WHERE (title LIKE '%${searchData}%' OR department LIKE '%${searchData}%')`;
        let results = await promisePool.query(query);
        console.log(results[0]);
        res.render('coursesHome', { courses: results[0], currentUser: req.user });
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('/shop');
    }
};


