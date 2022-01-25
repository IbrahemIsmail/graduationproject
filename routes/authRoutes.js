const express = require('express');
var passport = require('passport');
const router = express.Router();

router.get('/signup', (req, res) => {
    //res.render here dumbasses
});

router.get('/login', (req, res) => {
    //res.render here dumbasses
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/auth/signup',
    failureFlash: true
}));

router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}), (req, res) => {
    console.log('hello?'); //i dont know what this is dumbasses
    res.redirect('/');
});


router.get('/logout', (req, res) =>{
    req.logout();
    res.redirect('/');
});

module.exports = router;