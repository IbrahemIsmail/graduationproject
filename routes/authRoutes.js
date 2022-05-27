const express = require('express');
var passport = require('passport');
const router = express.Router();

router.get('/signup', (req, res) => {
    res.render('authentication/signup', {message: req.flash('error'), currentUser: req.user});
});

router.get('/login', (req, res) => {
    res.render('authentication/signin', {message: req.flash('error'), currentUser: req.user});
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    if (req.body.remember-me) req.session.maxAge = 2629743833.3334;
    else req.session.expire = false;
    res.redirect(`/`);
});


router.get('/logout', (req, res) =>{
    req.logout();
    res.redirect('/');
});

module.exports = router;