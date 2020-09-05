const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      User          = require("../models/user"),
      upload        = require("../handlers/multer");
    

router.get("/patient",(req,res)=>{

    res.render("patient/patient_landing_page");
});

router.get("/patient/signup",(req,res)=>{

    res.render("patient/patient_signup");
});

router.get("/patient/login", (req, res) =>{
    
    res.render("patient/patient_login");
});

router.get("/patient/profile", isPatientLoggedIn, (req,res)=>{
    User.findById(req.user._id).populate("meetings").populate("payments").exec((err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            res.render("patient/patient_profile", {User: foundUser});
        }
    });
});

router.get("/patient/profile/viewalldoctors", isPatientLoggedIn, (req, res) => {
    User.find({userType:'doctor'},(err,doctors)=>{

        if(err){
            console.log(err)
        }else{
            res.render("patient/all_doctors",{doctors:doctors});
        }
    });
});

// -----------Auth Routes for patient-------------------------------------
router.post("/patient/signup",upload.single('profileImage'), (req, res) => {


    let newPatient=new User({
        // First attribute has to be the username for proper registration of the user
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender, 
        age: req.body.age,
        phoneNumber: req.body.phoneNumber,
        userType: req.body.userType,
        profileImage:req.file.filename,
    });

    User.register(newPatient, req.body.password, (err, patient) =>{
        if(err){
            console.log(err);
            res.redirect("/patient/failure");
        }else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/patient/profile");
            });
        }
    });
});

router.post("/patient/login", passport.authenticate("local",{
    successRedirect: "/patient/profile",
    failureRedirect: "/patient/failure"
}), (req, res) => {
        
});

router.get("/patient/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
});

router.get("/patient/failure", (req, res)=>{
    console.log("Login failed");
    res.redirect("/");
});

// ------------------------------Auth Routes Ends------------------------------



// ---------------------Middleware------------
function isPatientLoggedIn(req, res, next){
    // console.log(req.user);
    if(req.isAuthenticated() && req.user.userType === 'patient'){
        return next();
    }
    req.logout();
    res.redirect("/patient/login");
}



module.exports = router;