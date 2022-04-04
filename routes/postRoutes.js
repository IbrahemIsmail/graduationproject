const express = require('express');
const mw = require('../middleware')
const { createPost, updatePost, deletePost, viewEdit} = require('../handlers/posts');
const router = express.Router();
const multer = require('multer');
// const upload = multer({ dest: 'images/' });

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.get('/shop', (req, res) => {
    res.send('this will be home page');
});


router.get('/shop/createpost', mw.isLoggedIn, (req, res) => {
    res.render('posts/createPost', {message: req.flash('error')});
});

router.get('/shop/editpost/id=:id', mw.authUserPost, viewEdit);

router.post('/shop/createpost', mw.isLoggedIn, upload.single('file'), createPost);
router.put('/shop/id=:id', mw.authUserPost, upload.single('file'), updatePost);
router.delete('/shop/id=:id', mw.authUserPost, deletePost);

module.exports = router;