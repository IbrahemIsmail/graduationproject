const middlewareObj = {};

middlewareObj.authUser = (req, res, next) => {
    if(req.isAuthenticated() && req.user.username == req.params.username) return next();
    else{
        req.flash('error', 'You Don\'t Have Permission To Do That');
        res.redirect("back");
    }
};

module.exports = middlewareObj;