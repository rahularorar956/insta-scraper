var mongoose = require("mongoose");

var PostDataSchema = new mongoose.Schema({
  id: String,
  likesCount: Number,
  commentCount: Number,
  likesList: [],
  commentList:[]
});

module.exports = mongoose.model("PostData", PostDataSchema);
