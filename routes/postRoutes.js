const express = require('express');
const mw = require('../middleware')
const { createPost, updatePost, deletePost, viewEdit, getPost, getPosts, createForum} = require('../handlers/posts');
const router = express.Router();
const multer = require('multer');


var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.get('/shop', getPosts);


router.get('/shop/createpost', mw.isLoggedIn, createForum);

router.get('/shop/editpost/id=:id', mw.authUserPost, viewEdit);

router.get('/shop/id=:id', getPost);

router.post('/shop/createpost', mw.isLoggedIn, upload.single('file'), createPost);
router.put('/shop/id=:id', mw.authUserPost, upload.single('file'), updatePost);
router.delete('/shop/id=:id', mw.authUserPost, deletePost);

module.exports = router;