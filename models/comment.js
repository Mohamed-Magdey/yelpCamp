<<<<<<< HEAD
var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    text: String
});

module.exports = mongoose.model("Comment", commentSchema);
||||||| merged common ancestors
=======
const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
  text: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
})

module.exports = mongoose.model('Comment', commentSchema);
>>>>>>> b28c6304bb2ab56b8827ce28146d93842e8d6691
