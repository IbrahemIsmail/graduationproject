const express = require('express');
const mw = require('../middleware')
const { createPost, updatePost, deletePost, viewEdit, getPost, getPosts, createForum, searchPost, ownedBooks} = require('../handlers/posts');
const router = express.Router();
const multer = require('multer');


var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.get('/', getPosts);


router.get('/createpost', mw.isLoggedIn, createForum);
router.get('/editpost/id=:id', mw.authUserPost, viewEdit);
router.get('/id=:id', getPost);
router.get('/myposts', mw.isLoggedIn, ownedBooks);

router.post('/createpost', mw.isLoggedIn, upload.single('file'), createPost);
router.post('/searchData', searchPost);

router.put('/id=:id', mw.authUserPost, upload.single('file'), updatePost);

router.delete('/id=:id', mw.authUserPost, deletePost);

module.exports = router;