const puppeteer = require("puppeteer");
const { USERNAME, PASSWORD } = require('./const');
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
module.exports = {
  initBrowser,
  validateURL
};
