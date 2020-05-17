const puppeteer = require("puppeteer");
const { USERNAME, PASSWORD } = require("./const");
const PostData = require("./models/PostData");
const initBrowser = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.instagram.com/accounts/login/");
  await page.waitForSelector('input[name="username"]');
  await page.waitForSelector('button[type="submit"]');
  await page.type('input[name="username"]', USERNAME);
  await page.type('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitFor(7000);
  return page;
};
const validateURL = url => {
  const re = new RegExp("(https?://(?:www.)?instagram.com/p/([^/?#&]+)).*");
  if (re.test(url)) {
    return true;
  }
  return false;
};

const saveInDB = data => {
  PostData.findOne({ id: data.id })
    .then(post => {
      if (post) {
          if(data.likesList){
            post.likesList = data.likesList
          }else if(data.commentList){
            post.commentList = data.commentList
          }else if(data.imageUrl){
            post.likesCount = data.likesList
            post.commentCount = data.commentCount
          }

          post.save().then(post=>{
            console.log("Saved !")
          })
      }else{
        PostData.create(data).then(post => {
          console.log("Created !");
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
};
module.exports = {
  initBrowser,
  validateURL,
  saveInDB
};
