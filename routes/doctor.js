const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      User          = require("../models/user"),
      upload        = require("../handlers/multer");

      
router.get("/doctor", (req, res) => {
    res.render("doctor/doctor_landing_page");
});

router.get("/doctor/signup", (req, res) => {
    res.render("doctor/doctor_signup");
});

router.get("/doctor/login", (req, res) =>{
    res.render("doctor/doctor_login");
});

router.get("/doctor/profile", isDoctorLoggedIn, (req,res)=>{
    res.render("doctor/doctor_profile");
});


// Display all Doctors

router.get("/doctor/viewall",(req,res)=>{

    User.find({userType:'doctor'},(err,doctors)=>{

        if(err){
            console.log(err)
        }else{
            res.render("doctor/doctor_view_all",{doctors:doctors});
        }
    });
});



// -----------Auth Routes for doctor-------------------------------------

router.post("/doctor/signup",upload.single('profileImage'),(req, res) => {


    let newDoctor = new User({
        // First attribute has to be the username for proper registration of the user
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        gender: req.body.gender, 
        age: req.body.age,
        userType: req.body.userType,
        profileImage:req.file.filename
        // mciLicense: req.body.mciLicense,
        // specialization: req.body.specialization,
        // referenceFirstName1: req.body.referenceFirstName1,
        // referenceLastName1: req.body.referenceLastName1,
        // referenceEmail1: req.body.referenceEmail1,
        // referencePhoneNumber1: req.body.referencePhoneNumber1,
        // referenceFirstName2: req.body.referenceFirstName2,
        // referenceLastName2: req.body.referenceLastName2,
        // referenceEmail2: req.body.referenceEmail2,
        // referencePhoneNumber2: req.body.eferencePhoneNumber2
    });

    User.register(newDoctor, req.body.password, (err, doctor) =>{
        if(err){
            console.log(err);
            res.redirect("/doctor/failure");
        }else{
            console.log(doctor);
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/doctor/profile")
            });
        }
    });
});

router.post("/doctor/login",passport.authenticate("local",
    {
        successRedirect: "/doctor/profile",
        failureRedirect: "/doctor/failure"
    }), (req, res) => {

});

router.get("/doctor/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
});

router.get("/doctor/failure", (req, res)=>{
    res.send("Unsuccessful attempt doctor");
});
// ------------------------------Auth Routes Ends------------------------------



// ---------------------Middleware------------
function isDoctorLoggedIn(req, res, next){
    
    if(req.isAuthenticated() && req.user.userType === 'doctor'){
        return next();
    }
    req.logout();
    res.redirect("/doctor/login");
}

// --------------------------------------------


module.exports = router;