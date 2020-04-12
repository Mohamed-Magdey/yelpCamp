const express    = require('express'),
      router     = express.Router(),
      Campground = require('../models/campground'),
      middleware = require('../middleware');

router
  .route("/")
    .get(function(req, res) { // INDEX - show all campgrounds
        Campground.find({}, function(err, campgrounds) {
          if (err) return console.log(err);
          res.render("campgrounds/index", {campgrounds});
        });
    })
  .post(middleware.isLoggedIn, function(req, res) { // CREATE - add new campground
      let name = req.body.name,
          image = req.body.image,
          price = req.body.price,
          desc = req.body.description,
          author = {
              id: req.user._id,
              username: req.user.username
            },
          newCampground = { name: name, image: image, price: price, description: desc, author};

      Campground.create(newCampground, function(err, newlyCreated) {
          if(err) return console.log(err);
          res.redirect("/campgrounds");
        });
     });

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
  Campground.findById(req.params.id).populate("comments").exec(function(err, campground) {
    if(err || !campground) {
      req.flash("error", "Campground not found");
       return res.redirect("back");
    }
    res.render("campgrounds/show", {campground})
  });
});

// EDIT - campground route
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render("campgrounds/edit", {campground: foundCampground});
  });
});

// UPDATE - campground route
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
    if(err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id)
    }
  });
});

// DESTROY - campground route
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if(err) return res.redirect('/campgrounds');
    
    res.redirect('/campgrounds');
  })
});


module.exports= router;
