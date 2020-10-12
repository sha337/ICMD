const   express               = require("express"),
        app                   = express(),
        bodyparser            =  require("body-parser"),
        mongoose              = require("mongoose"),
        passport              = require("passport"),
        LocalStrategy         = require("passport-local"),
        passportLocalMongoose = require('passport-local-mongoose'),
        User                  = require("./models/user"),
        request               = require('request'),
        methodOverride        = require("method-override"),
        tokenRefresh          = require('./utils/tokenRefresh');

// Basic setup
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// mongoose.connect("mongodb://localhost:27017/ICMD", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect("mongodb+srv://Ali:12345@shabz.1fu7s.mongodb.net/ICMD?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});



//passport configuration
app.use(require("express-session")({
    secret: "ICMD",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


// Requiring routes
const doctorRoutes        = require("./routes/doctor");
const patientRoutes       = require("./routes/patient");
const meetingRoutes       = require("./routes/meeting");
const paymentRoutes       = require("./routes/payment");
const tokenRoutes         = require("./routes/token");
const forgotPasswordRotes = require("./routes/forgotpassword");

// using routes
app.use(tokenRoutes);
app.use(doctorRoutes);
app.use(patientRoutes);
app.use(meetingRoutes);
app.use(paymentRoutes);
app.use(forgotPasswordRotes);


// Home page route
app.get('/', (req, res) =>{
    tokenRefresh();
    res.render("home");
});

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("server started on port 3000 ....");
});


