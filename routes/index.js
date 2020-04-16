const express    = require('express'),
      router     = express.Router(),
      passport   = require('passport'),
      User       = require('../models/user'),
      Campground = require('../models/campground');

router.get("/", function(req, res) {
  res.render("landing");
});


router
  .route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    let {username, firstName, lastName, avatar, email} = req.body;
    let newUser = new User({username, firstName, lastName, avatar, email});
    if(req.body.adminCode === 'testSecret') {
      newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
      if(err) {
        req.flash("error", err.message);
        return res.render("register");
      }
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect("/campgrounds");
      });
    });
  });

router
  .route("/login")
  .get(function(req, res) {
    res.render("login");
  })
  .post(passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: 'Welcome to YelpCamp!'
  }), function(req, res) {
  });

router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("campgrounds");
});


// User Profile
router.get('/users/:id', function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash('error', 'Something went wrong.');
      return res.redirect('/');
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash('error', 'Something went wrong.');
        return res.redirect('/');
      }
      res.render('users/show', {user: foundUser, campgrounds});
    })
  });
});

module.exports= router;