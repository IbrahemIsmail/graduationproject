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

checkDouble = (num) => {
    if (num >= 0 && num <= 5) return num;
    else if (num < 0) return 0;
    else if (num > 5) return 5;
}

checkVote = (num) => {
    if (num == -1 || num == 1 || num == 0) return num;
    else if (num < -1) return -1;
    else if (num > 1) return 1;
}

exports.giveRating = async (req, res) => {
    try {
        userID = await promisePool.query(`SELECT id FROM users WHERE username = '${req.user.username}'`);
        let reviews = await promisePool.query(`SELECT * FROM ratings WHERE courseInstanceID = ${req.params.id}`);
        reviews[0].forEach((review) => {
            if (review.userID == userID[0][0].id) {
                throw Error("You can only give one review");
            }
        });
        rating = {
            userID: userID[0][0].id,
            courseID: parseInt(req.params.id),
            curriculum: checkDouble(req.body.curriculum),
            teacher: checkDouble(req.body.teacher),
            teachingMethods: checkDouble(req.body.teachingMethods),
            expectations: checkDouble(req.body.expectations),
            exams: checkDouble(req.body.exams),
            difficulty: checkDouble(req.body.exams),
            description: req.body.description,
            rating: 0
        }
        rating.rating = checkDouble((rating.curriculum + rating.teacher + rating.teachingMethods + rating.expectations + rating.exams + rating.exams) / 6);
        let query = "INSERT INTO ratings (userID, courseInstanceID, curriculum, teacher, teachingMethods, expectations, exams, difficulty, description, rating) VALUES (?,?,?,?,?,?,?,?,?,?)";
        await promisePool.query(query, [rating.userID, rating.courseID, rating.curriculum, rating.teacher, rating.teachingMethods, rating.expectations, rating.exams, rating.difficulty, rating.description, rating.rating]);
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}


exports.showRatings = async (req, res) => {
    try {
        ratings = await promisePool.query(`Select * from ratings where courseInstance = '${req.params.courseID}'`);
        courseInstance = await promisePool.query(`Select * from courseinstances where id = ${req.params.courseID}'`);
        avg = 0.0;
        numb = 0;
        ratings[0].forEach((rating) => {
            avg = (avg + rating.rating)
            numb++;
        });
        console.log(avg2 = avg / numb);

    }
    catch (err) {
        console.log(err);
    }
}
//add another table since this's a many to many relationship, figure out the rest of this function

exports.upOrDownVote = async (req, res) => {
    try {
        userID = await promisePool.query(`SELECT id FROM users WHERE username = '${req.user.username}'`);
        let voteNum = checkVote(req.body.vote);
        let checkData = await promisePool.query(`select v.id as voteID, v.userID, r.id, v.vote from votes v left join voteownership vo on v.id = vo.voteID left join ratings r on r.id = vo.ratingID WHERE (v.userID = ${userID[0][0].id} And r.id = ${req.params.id})`);

        if (checkData[0][0].userID == userID[0][0].id && checkData[0][0].id == req.params.id) {
            if (checkData[0][0].vote == voteNum) {
                await promisePool.query(`UPDATE votes SET vote = 0 WHERE id = ${checkData[0][0].voteID}`);
            }
            else if (checkData[0][0].vote == 1 && voteNum == -1) {
                await promisePool.query(`UPDATE votes SET vote = -1 WHERE id = ${checkData[0][0].voteID}`);
            }
            else if (checkData[0][0].vote == -1 && voteNum == 1) {
                await promisePool.query(`UPDATE votes SET vote = 1 WHERE id = ${checkData[0][0].voteID}`);
            }
            else if (checkData[0][0].vote == 0) {
                await promisePool.query(`UPDATE votes SET vote = ${voteNum} WHERE id = ${checkData[0][0].voteID}`);
            }
            return;
        }

        let voteQuery = 'INSERT INTO votes (userID, vote) VALUES (?,?)';
        let vote = await promisePool.query(voteQuery, [userID[0][0].id, voteNum]);

        let voteOwnershipQuery = "INSERT INTO voteownership (ratingID, voteID) VALUES (?,?)";
        await promisePool.query(voteOwnershipQuery, [req.params.id, vote[0].insertId]);
        res.redirect('back');
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}
