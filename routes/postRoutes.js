const express = require('express');
const mw = require('../middleware')
const {createPost, updatePost, deletePost} = require('../handlers/posts');
const router = express.Router();
const multer  = require('multer');
// const upload = multer({ dest: 'uploads/' });

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.get('/shop', (req, res) => {
    res.send('this will be home page');
});


router.get('/shop/createPost', mw.isLoggedIn, (req, res) => {
    res.render('posts/createPost');    
});

 router.get('/shop/editPost/id=:id', mw.isLoggedIn, (req, res) => {
     res.render('posts/editPost', );    
 });

router.post('/shop/post', mw.isLoggedIn, upload.single('file') ,createPost);
router.put('/shop/id=:id', mw.isLoggedIn, upload.single('file') ,updatePost);
router.delete('/shop/id=:id', mw.isLoggedIn, deletePost);

module.exports = router;