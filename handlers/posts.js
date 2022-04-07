require('dotenv').config();

const mysql = require('mysql');
const db = require('../models/database');


pool = mysql.createPool(db.conn);
pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('USE ' + db.conn.database);
    connection.release();
});

promiseQuery = (sql, args, connection) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (err, rows) => {
            if (err)
                return reject(err);
            resolve(rows.insertId);
        });
    });
}


exports.getPosts = (req, res, next) => {
    let query = 'SELECT * FROM posts';
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(query, (err, rows) => {
            if (err) return next(err);
            //console.log(rows);
            //res.send("ur mom is hot");
            res.render('shop', { posts: rows, currentUser: req.user });
        });
        connection.release();
    });
};


exports.createForum = (req, res, next) => {
    res.render('posts/createPost', { message: req.flash('error'), currentUser: req.user});
}
exports.createPost = (req, res, next) => {
    pool.getConnection(async (err, connection) => {
        if (err) throw err;
        try {
            let img = req.file.buffer.toString("base64");
            let query1 = 'INSERT INTO posts (title, price, description, image) values (?,?,?,?)';
            // the database needs an extension fieled to render the correct extension (exten: req.file.mimetype)
            let post = {
                title: req.body.title,
                price: req.body.price,
                description: req.body.description,
                image: img,
            }
            if (post.title.length <= 0 || post.price.length <= 0 || post.description.length <= 0) {
                throw new Error('One or more empty fields');
            }
            let rows = await promiseQuery(query1, [post.title, post.price, post.description, post.image], connection);
            console.log(rows);
            let query2 = 'INSERT INTO postownership (studentID, postID) values (?,?)';
            let ids = {
                studentID: req.user.id,
                postID: rows,
            }
            try {
                await connection.query(query2, [ids.studentID, ids.postID]);
            }
            catch (err) { throw err; }
        }
        catch (err) {
            // console.log('ERROR WHILE POSTING');
            console.log(err)
            req.flash('error', err.message || 'Oops! something went wrong.');
            res.redirect('back');
            return;
        } finally {
            connection.release();
        }
        // console.log('BEFORE SUCCESS MESSAGE');
        req.flash('success', 'Your post is live!');
        res.redirect('/shop');
    });
};


exports.getPost = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        try {
            connection.query(`SELECT * FROM posts WHERE id = ${req.params.id}`, (err, rows) => {
                if (err) console.log(err); //change to next at some point
                console.log(rows);
                let post = {
                    id: rows[0].id,
                    title: rows[0].title,
                    price: rows[0].price,
                    description: rows[0].description,
                    image: rows[0].image,
                }
                console.log(post);
                res.render('posts/showPost', { post });
            });
        } catch (error) {
            console.log(error);
            req.flash('error', err.message || 'Oops! something went wrong.');
            res.redirect('back');
            return;
        } finally {
            connection.release
        }
    });
}

///////search for a post and insert it in the form to be edited query
exports.viewEdit = (req, res, next) => {
    pool.getConnection(async (err, connection) => {
        // if (err) throw err;
        // try{
        //     let rows = await promiseQuery(`SELECT * FROM posts WHERE id = ?`, [req.params.id], connection);
        //     // let rows = await connection.query(`SELECT * FROM posts WHERE id = ${req.params.id}`);
        //     console.log(rows);
        // } catch(err) {
        //     console.log(err);
        // } finally {
        //     connection.release();
        // }

        connection.query(`SELECT * FROM posts WHERE id = ${req.params.id}`, (err, rows) => {
            if (err) console.log(err); //change to next at some point
            // console.log(rows);
            let post = {
                id: rows[0].id,
                title: rows[0].title,
                price: rows[0].price,
                description: rows[0].description,
                image: rows[0].image,
            }
            // console.log(post);
            res.render('posts/editPost', { post, message: req.flash('error') });
        });
        connection.release();
    });

}


///////Edit the post query
exports.updatePost = (req, res, next) => {
    pool.getConnection(async (err, connection) => {
        if (err) throw err;
        try {
            let post = {
                title: req.body.title,
                price: req.body.price,
                description: req.body.description
            }
            let query = 'UPDATE posts SET ' + Object.keys(post).map(key => `${key} = ?`).join(', ') + ' WHERE id = ?';
            let params = [...Object.values(post), req.params.id];
            // console.log(query);
            // console.log(params);
            if (post.title.length <= 0 || post.price.length <= 0 || post.description.length <= 0) {
                throw new Error('One or more empty fields');
            }
            await promiseQuery(query, params, connection);
            // await connection.query(query, params);
        } catch (err) {
            console.log(err)
            req.flash('error', err.message || 'Oops! something went wrong.');
            res.redirect('back');
            return;
        } finally {
            connection.release();
        }
        req.flash('success', 'Your post is updated!');
        res.redirect('/shop'); // will eventually redirect to the post page
    });
}


///////delete the post query
exports.deletePost = (req, res, next) => {
    pool.getConnection(async (err, connection) => {
        if (err) throw err;
        try {
            await connection.query(`DELETE from posts WHERE id = ${req.params.id}`);
            req.flash('success', 'Your post is deleted!');
            res.redirect('/shop');
        } catch (err) {
            throw err;
        } finally {
            connection.release();
        }
    });
}

