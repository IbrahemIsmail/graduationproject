const middlewareObj = {};

middlewareObj.authUser = (req, res, next) => {
    if (req.isAuthenticated() && req.user.username == req.params.username) return next();
    else {
        req.flash('error', 'You Don\'t Have Permission To Do That');
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Log In First");
    res.redirect("/auth/login");
}

module.exports = middlewareObj;