const express = require('express');
const router = express.Router();
const {getPosts}= require('../handlers/home');


router.get('/home', getPosts);

module.exports = router;