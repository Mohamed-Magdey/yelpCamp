const express  = require('express'),
      router   = express.Router(),
      passport = require('passport'),
      User     = require('../models/user');

router.get("/", function(req, res) {
  res.render("landing");
});


router
  .route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
      if(err) {
        req.flash("error", err.message);
        return res.render("register");
      }
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome to YelpCamp" + user.username);
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
    failureRedirect: "/login"
  }), function(req, res) {
  });

router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("campgrounds");
});

module.exports= router;