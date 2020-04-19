const express    = require('express'),
      router     = express.Router(),
      passport   = require('passport'),
      User       = require('../models/user'),
      Campground = require('../models/campground'),
      async      = require('async'),
      nodemailer = require('nodemailer'),
      crypto     = require('crypto');


router.get("/", function(req, res) {
  res.render("landing");
});


router
  .route("/register")
  .get(function(req, res) {
    res.render("register", {page: 'register'});
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
    res.render("login", {page: 'login'});
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

//Forgot password
router
  .route('/forgot')
  .get(function(req, res) {
    res.render("forgot")
  })
  .post(function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          let token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({email: req.body.email}, function(err, user) {
          if(err || !user) {
            req.flash('error', 'No account with that email adress exists.');
            return res.redirect('/forgot');
          }
          user.reserPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        let smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'ragabmohame6@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        let mailOptions = {
          to: user.email,
          from: 'ragabmohame6@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
        if (err) return next(err);
          res.redirect('/forgot');
        });
  });

router
  .route('/reset/:token')
  .get(function(req, res) {
    User.findOne({ reserPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (err || !user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  })
  .post(function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ reserPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (err || !user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'ragabmohame6@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'ragabmohame6@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campgrounds');
    });
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
      res.render('users/show', {user: foundUser, campgrounds, page: 'users/show'});
    })
  });
});

module.exports= router;