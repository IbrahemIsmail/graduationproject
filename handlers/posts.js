require('dotenv').config();

const mysql = require('mysql2');
const db = require('../models/database');
var pluralize = require('pluralize');

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


////////query to find/search similar books
const search = async (req, searchData, sameID) => {
    try {
        let query = `SELECT * FROM posts WHERE (title LIKE '%${searchData}%' AND id!=${sameID})`;
        let results = await promisePool.query(query);
        return results[0];
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        return;
    }
}






///////gets all avialable posts for home page
exports.getPosts = async (req, res, next) => {
    try {
        let query = 'select * from posts where posts.status = 0 order by posts.createdAt desc';
        let rows = await promisePool.query(query);
        res.render('shop', { error: req.flash('error'), success: req.flash('success'), posts: rows[0], currentUser: req.user, path: "posts" });
    } catch (err) {
        throw err;
    }
};


exports.createForum = (req, res, next) => {
    res.render('posts/createPost', { error: req.flash('error'), success: req.flash('success'), currentUser: req.user, path: "posts" });
}


//////////
exports.createPost = async (req, res, next) => {
    try {
        let img = req.file.buffer.toString("base64");
        let query1 = 'INSERT INTO posts (title, price, description, status, image) values (?,?,?,?,?)';
        // the database needs an extension fieled to render the correct extension (exten: req.file.mimetype)
        let post = {
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            status: req.body.status,
            image: img,
        }
        if (post.title.length <= 0 || post.price.length <= 0 || post.description.length <= 0) {
            throw new Error('One or more empty fields');
        }
        let rows = await promisePool.query(query1, [post.title, post.price, post.description, post.status ,post.image]);
        let query2 = 'INSERT INTO postownership (studentID, postID) values (?,?)';
        let ids = {
            studentID: req.user.id,
            postID: rows[0].insertId,
        }
        try {
            await promisePool.query(query2, [ids.studentID, ids.postID]);
        }
        catch (err) { throw err; }
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
    req.flash('success', 'Your post is live!');
    res.redirect('/shop');
};


///////select the clicked on post to show more info about it
exports.getPost = async (req, res, next) => {
    try {
        let rows = await promisePool.query(`SELECT * FROM posts INNER JOIN postownership ON posts.id = postID WHERE posts.id = ${req.params.id}`);
        let email = await promisePool.query(`SELECT email FROM users WHERE id = ${rows[0][0].studentID}`);
        let post = {
            id: rows[0][0].id,
            title: rows[0][0].title,
            price: rows[0][0].price,
            description: rows[0][0].description,
            status: rows[0][0].status,
            image: rows[0][0].image,
            createdAt: rows[0][0].createdAt,
            updatedAt: rows[0][0].updatedAt,
            userEmail: email[0][0].email
        }
        // console.log(post);
        title = pluralize.singular(post.title);
        let similarPosts = await search(req, title, req.params.id);
        //console.log(similarPosts);
        if (similarPosts != null && similarPosts.length > 0) {
            res.render('posts/showPost', { error: req.flash('error'), success: req.flash('success'), post, currentUser: req.user, similarPosts, path: "posts" });
        }
        else {
            res.render('posts/showPost', { error: req.flash('error'), success: req.flash('success'), post, currentUser: req.user, similarPosts: null, path: "posts" });
        }
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}



////////get all the owned books
exports.ownedBooks = async (req, res) => {
    try {
        posts = await promisePool.query(`SELECT * FROM posts INNER JOIN postownership ON posts.id=postownership.postID and postownership.studentID= '${req.user.id}'`);
        res.render('posts/myPost', { error: req.flash('error'), success: req.flash('success'), posts: posts[0], currentUser: req.user, message: req.flash('success'), path: "mybooks" });
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}





/////// the search forum 
exports.searchPost = async (req, res) => {
    searchData = req.body.search;
    try {
        let query = `SELECT * FROM posts WHERE (title LIKE '%${searchData}%' OR description LIKE '%${searchData}%')`;
        let results = await promisePool.query(query);
        console.log(results[0]);
        res.render('shop', { error: req.flash('error'), success: req.flash('success'), posts: results[0], currentUser: req.user, path: "posts" });
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('/shop');
    }
}

///////search for a post and insert it in the form to be edited query
exports.viewEdit = async (req, res, next) => {
    try {
        let rows = await promisePool.query(`SELECT * FROM posts WHERE id = ?`, [req.params.id]);
        let post = {
            id: rows[0][0].id,
            title: rows[0][0].title,
            price: rows[0][0].price,
            description: rows[0][0].description,
            status: rows[0][0].status,
            image: rows[0][0].image,
        }
        res.render('posts/editPost', { error: req.flash('error'), success: req.flash('success'), post, message: req.flash('error'), currentUser: req.user, path: "posts" });
    } catch (err) {
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}


///////Edit the post query
exports.updatePost = async (req, res, next) => {
    try {
        let img = req.file ? req.file.buffer.toString("base64") : null;
        console.log(img);
        let post = {
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            status: req.body.status,
        }

        img? post.image = img : delete post.img;
        let query = 'UPDATE posts SET ' + Object.keys(post).map(key => `${key} = ?`).join(', ') + ' WHERE id = ?';
        let params = [...Object.values(post), req.params.id];
        if (post.title.length <= 0 || post.price.length <= 0 || post.description.length <= 0) {
            throw new Error('One or more empty fields');
        }
        let result = await promisePool.query(query, params);
        req.flash('success', 'Your post is updated!');
        res.redirect(`/shop/id=${req.params.id}`);
    } catch (err) {
        console.log(err)
        req.flash('error', err.message || 'Oops! something went wrong.');
        res.redirect('back');
        return;
    }
}


///////delete the post query
exports.deletePost = async (req, res, next) => {
    try {
        await promisePool.query(`DELETE from posts WHERE id = ${req.params.id}`);
        req.flash('success', 'Your post is deleted!');
        res.redirect('/shop');
    } catch (err) {
        throw err;
    }
}

