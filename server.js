const bodyParser     = require("body-parser"),
      mongoose       = require("mongoose"),
      express        = require("express"),
      app            = express(),
      flash          = require('connect-flash'),
      helmet         = require('helmet'),
      passport       = require('passport'),
      LocalStrategy  = require('passport-local'),
      methodOverride = require('method-override'),
      session        = require('express-session'),
      User           = require('./models/user'),
      seedDB         = require('./seeds');

const authRoutes       = require('./routes/index'),
      campgroundRoutes = require('./routes/campgrounds'),
      commentRoutes    = require('./routes/comments');

// seedDB();
const url = process.env.DB || "mongodb://127.0.0.1:27017/yelp_camp";

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());

// Passport Config
app.use(session({
  secret: "Hello World",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.get("/", function(req, res) {
  res.render("landing");
});


app.use('/', authRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);


// listen for requests :)
let port = process.env.PORT || 8080;
const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
