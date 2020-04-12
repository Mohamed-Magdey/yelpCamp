const express    = require('express'),
      router     = express.Router(),
      Campground = require('../models/campground'),
      middleware = require('../middleware');

router
  .route("/")
  .get(function(req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function(err, campgrounds) {
      if (err) return console.log(err);
      res.render("campgrounds/index", {campgrounds});
    });
  })
  .post(middleware.isLoggedIn, function(req, res) {
    let name = req.body.name;
    let image = req.body.image;
    let price = req.body.price;
    let desc = req.body.description;
    let author = {
      id: req.user._id,
      username: req.user.username
    } 
    let newCampground = { name: name, image: image, price: price, description: desc, author};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
      if(err) return console.log(err);
      res.redirect("/campgrounds");
    });
  });

router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

router.get("/:id", function(req, res) {
  Campground.findById(req.params.id).populate("comments").exec(function(err, campground) {
    if(err || !campground) {
      req.flash("error", "Campground not found");
       return res.redirect("back");
    }
    res.render("campgrounds/show", {campground})
  });
});

router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render("campgrounds/edit", {campground: foundCampground});
  });
});

router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
    if(err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id)
    }
  });
});

router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if(err) return res.redirect('/campgrounds');
    
    res.redirect('/campgrounds');
  })
});


module.exports= router;