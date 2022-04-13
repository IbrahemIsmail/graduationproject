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




////////Selecting all courses
exports.getCourse = async (req, res, next) => {
    try {
        let rows = await promisePool.query(`SELECT * FROM Courses WHERE id = ${req.params.id}`);
        let course = {
            id: rows[0][0].id,
            courseCode: rows[0][0].courseCode,
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



////////create a parent course
exports.createCourse = async (req, res, next) => {
    try {
        let query = 'INSERT INTO Course (courseCode, name, departmentCode) values (?,?,?)';
        let post = {
            courseCode: req.body.courseCode,
            name: req.body.name,
            description: req.body.departmentCode,
        }
        if (post.courseCode.length <= 0 || post.name.length <= 0 || post.departmentCode.length <= 0) {
            throw new Error('One or more empty fields');
        }
        await promisePool.query(query1,[post.courseCode, post.name, post.departmentCode])
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    req.flash('success', 'Your course is live!');
    res.redirect('/shop');//fix this u dumbass
};


////////create a teacher
exports.createCourse = async (req, res, next) => {
    try {
        let query = 'INSERT INTO Teachers (name) values (?)';
        let post = {    
            price: req.body.name,
        }
        if (post.name.length <= 0 ) {
            throw new Error('One or more empty fields');
        }
        await promisePool.query(query,[post.name])
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    req.flash('success', 'Your course is live!');
    res.redirect('/shop');//fix this u dumbass
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


