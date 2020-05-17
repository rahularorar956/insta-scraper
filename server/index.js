const express = require("express");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
const { initBrowser } = require("./helpers");
const { fetchProfile, fetchLikes, fetchComments } = require("./api");
const cors = require("cors");
const app = express();

var uri = "mongodb://instagram:instagram1@ds263172.mlab.com:63172/insta-scraper";
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to DB");
  });

let page = null;
initBrowser().then(response => {
  page = response;
  console.log("Initialization successful");
});

app.use((req, res, next) => {
  res.locals.page = page;
  next();
});

app.post("/", fetchProfile);
app.post("/fetchLikes", fetchLikes);
app.post("/fetchComments", fetchComments);

app.listen(3001, () => console.log("Listening to port 3001"));

module.exports = app;
