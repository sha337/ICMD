const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      User          = require("../models/user"),
      Meeting       = require("../models/meeting"),
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

    res.render("patient/patient_profile");
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

    res.send("Unsuccessful attempt patient");
});

// ------------------------------Auth Routes Ends------------------------------


// ------------------------------Generate Meeting Route------------------------

router.post("/patient/:id/meeting", (req,res) =>{
    // Finding the doctor from database
    User.findById(req.params.id, (err, doctor)=>{
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            Meeting.create(req.body.meeting, (err, meeting)=>{
                if(err){
                    counsole.log(err);
                    res.redirect("/");
                }else{
                    // adding patient details
                    meeting.patient.id = req.user._id;
                    meeting.patient.firstName = req.user.firstName;
                    meeting.patient.lastName = req.user.lastName;

                    // adding doctor details
                    meeting.doctor.id = doctor._id;
                    meeting.doctor.firstName = doctor.firstName;
                    meeting.doctor.lastName = doctor.lastName;

                    // update meeting
                    meeting.save();

                    // push meeting in doctors database
                    doctor.meetings.push(meeting);
                    doctor.save();

                    // push meeting in patient database
                    User.findById(req.user._id, (err, patient)=>{
                        patient.meetings.push(meeting);
                        patient.save();
                    });

                    res.redirect("/patient/profile");
                }
            });
        }
    });
});


// ---------------------Middleware------------
function isPatientLoggedIn(req, res, next){
    // console.log(req.user);
    if(req.isAuthenticated() && req.user.userType === 'patient'){
        return next();
    }
    res.redirect("/patient/logout");
}



module.exports = router;