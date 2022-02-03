const express = require('express');
const mw = require('../middleware')
const {createPost} = require('../handlers/posts');
const router = express.Router();

router.get('/shop', (req, res) => {
    res.send('this will be home page');
});

router.post('/shop', mw.isLoggedIn, createPost);

module.exports = router;