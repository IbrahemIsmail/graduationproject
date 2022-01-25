const express = require('express');
var passport = require('passport');
const router = express.Router();

router.get('/signup', (req, res) => {

});

router.get('/login', (req, res) => {

});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/auth/signup',
    failureFlash: true
}));

router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/auth/login',
    failureFlash: true
}), (req, res) => {
    console.log('hello?');
    res.redirect('/');
});


router.get('/logout', (req, res) =>{
    req.logout();
    res.redirect('/');
});

module.exports = router;