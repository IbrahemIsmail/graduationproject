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

const search = async (req, searchData, table, feild) => {
    try {
        let query = `SELECT * FROM ${table} WHERE (${feild} LIKE '%${searchData}%')`;
        let results = await promisePool.query(query);
        return results[0];
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        return;
    }
}


exports.showforums = (req, res, next) =>{
    res.render('courses/courseForums', {message: req.flash('error'), currentUser: req.user});
}


exports.getCourses = async (req, res, next) => {
    try {
        let query = 'SELECT * FROM courseinstances';
        let rows = await promisePool.query(query);
        console.log(rows[0]);
        res.render('coursesHome', { posts: rows[0], currentUser: req.user });
    } catch (err) {
        throw err;
    }
};

////////Selecting one course
exports.getCourse = async (req, res, next) => {
    try {
        let rows = await promisePool.query(`SELECT * FROM courseinstances WHERE id = ${req.params.id}`);
        let teacherName = await promisePool.query(`SELECT name FROM teachers WHERE id=${rows[0][0].teacherID}`);
        let courseName = await promisePool.query(`SELECT name FROM courses WHERE id=${rows[0][0].courseID}`);
        let courseCode = await promisePool.query(`SELECT courseCode FROM courses WHERE id=${rows[0][0].courseID}`);
        let course = {
            id: rows[0][0].id,
            teacherName: teacherName[0][0].name,
            courseName: courseName[0][0].name,
            courseCode: courseCode[0][0].courseCode
        }
        console.log(course);
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
        let query = 'INSERT INTO courses (courseCode, name, departmentCode) values (?,?,?)';
        let post = {
            courseCode: req.body.courseCode,
            name: req.body.name,
            departmentCode: req.body.departmentCode,
        }
        if (post.courseCode.length <= 0 || post.name.length <= 0 || post.departmentCode.length <= 0) {
            throw new Error('One or more empty fields');
        }
        await promisePool.query(query, [post.courseCode, post.name, post.departmentCode]);
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back', {message: req.flash('error')});
        return;
    }
    console.log('Course Posted');
    req.flash('success', 'Your course is live!');
    res.redirect('/courses/addcourse');
};

////////create a teacher
exports.createTeacher = async (req, res, next) => {
    try {
        let query = 'INSERT INTO Teachers (name) values (?)';
        let teacher = {    
            name: req.body.name,
        }
        if (teacher.name.length <= 0 ) {
            throw new Error('One or more empty fields');
        }
        await promisePool.query(query, [teacher.name])
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back', {message: req.flash('error')});
        return;
    }
    console.log('Teacher Posted');
    req.flash('success', 'Your teacher is live!');
    res.redirect('/courses/addcourses');
};

exports.searchCourseInstance = async (req, res) => {
    searchData = req.body.search;
    try {
        let query = `SELECT * FROM courseinstances left join courses c on courseinstances.courseID = c.id left join teachers t on courseinstances.teacherID = t.id WHERE (t.name LIKE '%${searchData}%' OR c.name LIKE '%${searchData}%')`;
        let results = await promisePool.query(query);
        console.log(results[0]);
        res.render('coursesHome', { courses: results[0], currentUser: req.user });
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('/shop');
    }
};


exports.createCourseInstance = async (req, res) => {
    try {
        let query = "INSERT INTO courseInstances (year, teacherID, courseID) values (?,?,?)";
        let teacherID = await search(req, req.body.teacher, 'teachers', 'name');
        let courseID = await search(req, req.body.course, 'courses', 'courseCode');
        CI = {
            year: req.body.year,
            teacherID: teacherID[0].id,
            courseID: courseID[0].id
        }
        await promisePool.query(query, [CI.year, CI.teacherID, CI.courseID]);
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    console.log('Course instance created');
    req.flash('success', 'Your course instance is live!');
    res.redirect('back');
}

