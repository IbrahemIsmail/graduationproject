require('dotenv').config();

const mysql = require('mysql2');
const db = require('../models/database');

const pool = mysql.createPool(db.conn);
const promisePool = pool.promise();

const { showRatings, getUpDown } = require('./ratings');


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

const getVotes = async (ratingID) => {
    let pos = await promisePool.query(`select count(*) as positiveVotes from votes inner join voteownership on votes.id = voteownership.voteID where voteownership.ratingID = ${ratingID} and vote = 1 group by ratingID`);
    let neg = await promisePool.query(`select count(*) as negativeVotes from votes inner join voteownership on votes.id = voteownership.voteID where voteownership.ratingID = ${ratingID} and vote = -1 group by ratingID`);
    if (pos[0][0] || neg[0][0]) {
        votes = (pos[0][0] ? pos[0][0].positiveVotes : 0) - (neg[0][0] ? neg[0][0].negativeVotes : 0);
        return votes;
    }
    else return 0;
}

exports.showforums = (req, res, next) => {
    res.render('courses/courseForums', { error: req.flash('error'), success: req.flash('success'), currentUser: req.user, path: "courses" });
}


exports.getCourses = async (req, res, next) => {
    try {
        let query = 'select c.id, c.courseCode, c.name, c.departmentCode, c.description, u.id as uniID, u.uniCode, u.name as uniName, u.logo from courses c inner join universities u on c.universityID = u.id;';
        let rows = await promisePool.query(query);
        //console.log(rows[0]);
        res.render('coursesHome', { error: req.flash('error'), success: req.flash('success'), courses: rows[0], currentUser: req.user, path: "courses" });
    } catch (err) {
        throw err;
    }
};

////////Selecting one course
exports.getCourse = async (req, res, next) => {
    try {
        let course = await promisePool.query(`SELECT * FROM courses WHERE id = ${req.params.id}`);
        let instances = await promisePool.query(`SELECT cs.year , cs.id as courseInstancesID , name FROM courseInstances cs INNER JOIN teachers ON cs.courseID = ${req.params.id} AND teachers.id=cs.teacherID ORDER BY cs.year DESC Limit 4`);
        let ratings = await showRatings(req);
        let newInstances = [];
        let newRatings = [];
        //  console.log(instances[0]);
        let k=instances[0];
        for (let i in k) {
            let score = await promisePool.query(`select AVG(rating) as average from ratings where courseInstanceID= ${k[i].courseInstancesID}`);
            newInstances.push({...k[i], score: score[0][0].average});
        }
        for (let i in ratings) {
            let votes = await getVotes(ratings[i].id);
            newRatings.push({...ratings[i], votes});
        }
        newRatings.sort((a,b) => (a.votes < b.votes) ? 1 : ((b.votes < a.votes) ? -1 : 0));
        res.render('courses/showCourse', { error: req.flash('error'), success: req.flash('success'), instances: newInstances, currentUser: req.user, course: course[0][0], i: 0, ratings: newRatings, path: "courses" });
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
        let query = 'INSERT INTO courses (courseCode, name, departmentCode, description, universityID) values (?,?,?,?,?)';
        let uniID = await search(req, req.body.uni, 'universities', 'name');
        let course = {
            courseCode: req.body.courseCode,
            name: req.body.name,
            departmentCode: req.body.departmentCode,
            description: req.body.description,
            uniID: uniID[0].id
        }
        if (course.courseCode.length <= 0 || course.name.length <= 0 || course.departmentCode.length <= 0 || course.uniID.length <= 0) {
            throw new Error('One or more empty fields');
        }
        await promisePool.query(query, [course.courseCode, course.name, course.departmentCode, course.description, course.uniID]);
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    console.log('Course Posted');
    req.flash('success', 'Your course is live!');
    res.redirect('/courses/addcourse');
};

////////create a university
exports.createUniversity = async (req, res) => {
    try {
        let logo = req.file.buffer.toString("base64");
        let query = 'INSERT INTO universities (uniCode, name, logo) values (?,?,?)';
        let university = {
            uniCode: req.body.unicode,
            name: req.body.name,
            logo
        }
        if (university.name.length <= 0 || university.uniCode.length <= 0) {
            throw new Error('One or more empty fields');
        }
        await promisePool.query(query, [university.uniCode, university.name, university.logo]);
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    console.log('University Posted');
    req.flash('success', 'Your university is live!');
    res.redirect('/courses/addcourses');
};
////////create a teacher
exports.createTeacher = async (req, res, next) => {
    try {
        let query = 'INSERT INTO Teachers (name) values (?)';
        let teacher = {
            name: req.body.name,
        }
        if (teacher.name.length <= 0) {
            throw new Error('One or more empty fields');
        }
        await promisePool.query(query, [teacher.name])
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    console.log('Teacher Posted');
    req.flash('success', 'Your teacher is live!');
    res.redirect('/courses/addcourse');
};

exports.searchCourse = async (req, res) => {
    searchData = req.body.search;
    try {
        let query = `SELECT c.id, c.courseCode, c.name, c.departmentCode, c.description, u.id as uniID, u.uniCode, u.name as uniName, u.logo from courses c inner join universities u on c.universityID = u.id WHERE (c.name LIKE '%${searchData}%' OR c.courseCode LIKE '%${searchData}%' OR departmentCode LIKE '%${searchData}%')`;
        let results = await promisePool.query(query);
        console.log(results[0]);
        res.render('coursesHome', { error: req.flash('error'), success: req.flash('success'), courses: results[0], currentUser: req.user, path: "courses" });
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('/courses');
    }
};

exports.searchCourseInstance = async (req, res) => {
    searchData = req.body.search;
    try {
        let query = `SELECT * FROM courseinstances left join courses c on courseinstances.courseID = c.id left join teachers t on courseinstances.teacherID = t.id WHERE (t.name LIKE '%${searchData}%' OR c.name LIKE '%${searchData}%')`;
        let results = await promisePool.query(query);
        console.log(results[0]);
        res.render('coursesHome', { error: req.flash('error'), success: req.flash('success'), courses: results[0], currentUser: req.user, path: "courses" });
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

