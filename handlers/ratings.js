require('dotenv').config();

const { parse } = require('dotenv');
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

exports.giveRating = async (req, res) =>{
    try {
        userID = await promisePool.query(`SELECT id FROM users WHERE username = '${req.user.username}'`);
        rating = {
            userID: userID[0][0].id,
            courseID: parseInt(req.params.id),
            curriculum: req.body.curriculum,
            teacher: req.body.teacher,
            teachingMethods: req.body.teachingMethods,
            expectations: req.body.expectations,
            exams: req.body.exams,
            difficulty: req.body.difficulty,
            description: req.body.description
        }
        let query = "INSERT INTO ratings (userID, courseInstanceID, curriculum, teacher, teachingMethods, expectations, exams, difficulty, description) VALUES (?,?,?,?,?,?,?,?,?)";
        await promisePool.query(query, [rating.userID, rating.courseID, rating.curriculum, rating.teacher, rating.teachingMethods, rating.expectations, rating.exams, rating.difficulty, rating.description]);
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}