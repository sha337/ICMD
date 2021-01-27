const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      User          = require("../models/user"),
      Prescription  = require("../models/prescription"),
      upload        = require("../handlers/multer"),
      middleware    = require("../middleware"),
      utilfunction  = require("../utils");
      


// displays doctors landing page with login and signup option ( discontinued - currently login page opens directly)
router.get("/doctor", (req, res) => {
    res.render("doctor/doctor_landing_page");
});

// displays signup form for doctor
router.get("/doctor/signup", (req, res) => {
    res.render("doctor/doctor_signup");
});

// displays login form for doctor
router.get("/doctor/login", (req, res) =>{
    res.render("doctor/doctor_login");
});

// displays profile page for doctor after login
router.get("/doctor/profile", middleware.isDoctorLoggedIn, (req,res)=>{
    
    // finding the doctor form database, populating meetings and payments
    User.findById(req.user._id).populate("meetings").populate("payments").populate("prescriptions").exec((err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            res.render("doctor/doctor_profile", {User: foundUser});
        }
    });
});


// Display all Doctors before the login ( includes before login navbar and redirects to login when clicked on get appointment)
router.get("/doctor/viewall",(req,res)=>{

    User.find({userType:'doctor'},(err,doctors)=>{
        if(err){
            console.log(err)
        }else{
            res.render("doctor/doctor_view_all",{doctors:doctors});
        }
    });
});



// Prescribe medicine 
router.post("/doctor/prescribe_medicine/:id", middleware.isDoctorLoggedIn, async(req, res)=>{
    // converting req.body object containing medicines names to an array of medicines
    let medicinesArray = Object.values(req.body);
    
    let pat_id = req.params.id;
    let doc_id = req.user._id;
    let date = await utilfunction.getDate();
    // Finding the doctor & patient from database
    let doctor = await User.findById(doc_id);
    let patient = await User.findById(pat_id);

    let prescriptiondetails = {
        medicines: medicinesArray,
        date: date
    };

    // creating a prescription in my database
    let prescription = await new Prescription(prescriptiondetails);

    // adding patient details
    prescription.patient.id        = patient._id;
    prescription.patient.firstName = patient.firstName;
    prescription.patient.lastName  = patient.lastName;

    // adding doctor details
    prescription.doctor.id        = doctor._id;
    prescription.doctor.firstName = doctor.firstName;
    prescription.doctor.lastName  = doctor.lastName;

    // update prescription
    await prescription.save();

    // push prescription in doctors database
    doctor.prescriptions.push(prescription);
    await doctor.save();
    
    // push prescription in patient database
    patient.prescriptions.push(prescription);
    await patient.save();

    res.redirect("/doctor/profile");
});




// -----------Auth Routes for doctor-------------------------------------

// Signup Route for doctor
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
        profileImage:req.file.filename,
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
        availableSlots: utilfunction.intervals(req.body.startTime, req.body.endTime, parseInt(req.body.duration))
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

// login route 
router.post("/doctor/login",passport.authenticate("local",
    {
        successRedirect: "/doctor/profile",
        failureRedirect: "/doctor/failure"
    }), (req, res) => {

});

// logout route
router.get("/doctor/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
});

// login failure route
router.get("/doctor/failure", (req, res)=>{
    console.log("doctor login failed");
    res.redirect("/");
});
// ------------------------------Auth Routes Ends------------------------------

module.exports = router;


