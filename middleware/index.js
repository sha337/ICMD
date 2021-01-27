let middlewareObj = {};

middlewareObj.isPatientLoggedIn = function(req, res, next){
    if(req.isAuthenticated() && req.user.userType === 'patient'){
        return next();
    }
    console.log("Patient was not logged in");
    req.logout();
    res.redirect("/patient/login");
}

middlewareObj.isDoctorLoggedIn = function(req, res, next){
    if(req.isAuthenticated() && req.user.userType === 'doctor'){
        return next();
    }
    req.logout();
    res.redirect("/doctor/login");
}



module.exports = middlewareObj;