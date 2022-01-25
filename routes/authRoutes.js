const express = require('express');
var passport = require('passport');
const router = express.Router();

router.get('/signup', (req, res)=>{
    
});

router.get('/login', (req, res)=>{
    
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = router;