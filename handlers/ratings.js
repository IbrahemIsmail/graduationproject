require('dotenv').config();

const { parse } = require('dotenv');
const { relativeTimeRounding } = require('moment');
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
        // console.log('here');
        // console.log(req.body);
        rating = {
            userID: userID[0][0].id,
            courseID: parseInt(req.params.id),
            curriculum: parseFloat(checkDouble(req.body.curriculum)),
            teacher: parseFloat(checkDouble(req.body.teacher)),
            teachingMethods: parseFloat(checkDouble(req.body.teachingMethods)),
            expectations: parseFloat(checkDouble(req.body.expectations)),
            exams: parseFloat(checkDouble(req.body.exams)),
            difficulty: parseFloat(checkDouble(req.body.exams)),
            description: req.body.description
        }
        let i = checkDouble((rating.curriculum + rating.teacher + rating.teachingMethods + rating.expectations + rating.exams + rating.exams) / 6);
        let query = "INSERT INTO ratings (userID, courseInstanceID, curriculum, teacher, teachingMethods, expectations, exams, difficulty, description, rating) VALUES (?,?,?,?,?,?,?,?,?,?)";
        await promisePool.query(query, [rating.userID, rating.courseID, rating.curriculum, rating.teacher, rating.teachingMethods, rating.expectations, rating.exams, rating.difficulty, rating.description, i]);

    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    req.flash('success', 'You have successfully rated this course!');
    res.redirect('back');
}


exports.showRatings = async (req, res) => {
    try {      
        ratings = await promisePool.query(`Select ratings.id as id, username, courseInstanceID, curriculum, teacher, teachingMethods, expectations, exams, 
        difficulty, Description, rating, year, createdAt, name from ratings  INNER JOIN courseInstances on courseInstances.courseID = ${req.params.id} 
        and ratings.courseInstanceID = courseInstances.id INNER JOIN teachers on teachers.id=courseInstances.teacherID
        INNER JOIN users on users.id = ratings.userID`);
        let currUserVotes;
        let userVotes = [];
        if(req.user){
            currUserVotes = await promisePool.query(`select v.vote, vo.ratingID 
            from votes v 
            inner join voteownership vo on v.id = vo.voteID 
            inner join ratings r on vo.ratingID = r.id 
            inner join courseinstances ci on r.courseInstanceID = ci.id
            where v.userID = ${req.user.id} and ci.courseID = ${req.params.id};`);

            ratings[0].forEach((rating, i) => {
                for (let vote of currUserVotes[0]){
                    if(rating.id == vote.ratingID) {
                        ratings[0][i] = {...rating, vote: vote.vote};
                        break;
                    }
                };
            });
        }
        avg = 0.0;
        numb = 0;
        ratings[0].forEach((rating) => {
            avg = (avg + rating.rating)
            numb++;
        });        
        // let avg2 = avg / numb;
        // let ratings= ratings[0];
        return ratings[0];
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}
//add another table since this's a many to many relationship, figure out the rest of this function

exports.upOrDownVote = async (req, res) => {
    try {
        userID = await promisePool.query(`SELECT id FROM users WHERE username = '${req.user.username}'`);
        let voteNum = checkVote(req.body.vote);
        // this checks if the current user upvoted the same review before and is trying to update their vote
        let checkUserVote = await promisePool.query(`select v.id as voteID, v.userID, r.id, v.vote from votes v inner join voteownership vo on v.id = vo.voteID inner join ratings r on r.id = vo.ratingID WHERE (v.userID = ${userID[0][0].id} And r.id = ${req.params.id})`);
        
        if(checkUserVote[0][0]){
            if (checkUserVote[0][0].userID == userID[0][0].id && checkUserVote[0][0].id == req.params.id) {
                if (checkUserVote[0][0].vote == voteNum) {
                    await promisePool.query(`DELETE FROM votes WHERE id = ${checkUserVote[0][0].voteID}`);
                }
                else if (checkUserVote[0][0].vote == 1 && voteNum == -1) {
                    await promisePool.query(`UPDATE votes SET vote = -1 WHERE id = ${checkUserVote[0][0].voteID}`);
                }
                else if (checkUserVote[0][0].vote == -1 && voteNum == 1) {
                    await promisePool.query(`UPDATE votes SET vote = 1 WHERE id = ${checkUserVote[0][0].voteID}`);
                }
                else if (checkUserVote[0][0].vote == 0) {
                    await promisePool.query(`UPDATE votes SET vote = ${voteNum} WHERE id = ${checkUserVote[0][0].voteID}`);
                }
                return;
            }
        }

        let voteQuery = 'INSERT INTO votes (userID, vote) VALUES (?,?)';
        let vote = await promisePool.query(voteQuery, [userID[0][0].id, voteNum]);

        let voteOwnershipQuery = "INSERT INTO voteownership (ratingID, voteID) VALUES (?,?)";
        await promisePool.query(voteOwnershipQuery, [req.params.id, vote[0].insertId]);
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    } finally {
        res.redirect('back');
    }
}


// //here's a table for getting the up/down votes of a rating
// exports.getUpDown = async(req, res, ratings)=>{
//     ratings.forEach((rating)=>{
//         let vote = await promisePool.query(`SELECT v.id, v.vote FROM votes as v INNER JOIN ON voteownership WHERE ratingID=rating.id AND voteID = v.id ;`); 
           
//     });
//     let course = await promisePool.query(`SELECT * FROM courses WHERE id = ${req.params.id}`);
// }
