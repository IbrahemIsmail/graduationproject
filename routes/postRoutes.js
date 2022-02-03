const express = require('express');
const mw = require('../middleware')
const {createPost, updatePost, deletePost} = require('../handlers/posts');
const router = express.Router();

router.get('/shop', (req, res) => {
    res.send('this will be home page');
});

router.post('/shop/post', mw.isLoggedIn, createPost);
router.put('/shop/id=:id', mw.isLoggedIn, updatePost);
router.delete('/shop/id=:id', mw.isLoggedIn, deletePost);

module.exports = router;