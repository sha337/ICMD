const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      User          = require("../models/user"),
      upload        = require("../handlers/multer"),
      moment        = require('moment');

      
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
    User.findById(req.user._id).populate("meetings").populate("payments").exec((err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            res.render("doctor/doctor_profile", {User: foundUser});
        }
    });
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
        // phoneNumber: req.body.phoneNumber,
        // gender: req.body.gender, 
        // age: req.body.age,
        userType: req.body.userType,
        // profileImage:req.file.filename
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
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        duration: req.body.duration,
        availableSlots: intervals(req.body.startTime, req.body.endTime, parseInt(req.body.duration))
    });
    console.log(newDoctor);
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
    console.log("doctor login failed");
    res.redirect("/");
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

// divide time in intervals
function intervals(startString, endString, duration) {
    var start = moment(startString, 'hh:mm a');
    var end = moment(endString, 'hh:mm a');

    // round starting minutes up to nearest 15 (12 --> 15, 17 --> 30)
    // note that 59 will round up to 60, and moment.js handles that correctly
    start.minutes(Math.ceil(start.minutes() / 15) * 15);

    var result = [];

    var current = moment(start);

    while (current <= end) {
        result.push(current.format('HH:mm'));
        current.add(duration, 'minutes');
    }

    return result;
}

module.exports = router;