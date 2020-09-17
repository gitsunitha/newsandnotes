const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const fsLibrary = require("fs");
const puppeteer = require("puppeteer");

//express stuff
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//db stuff

const db = require("./models");

const PORT = process.env.PORT || 3021;

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Routes
// =============================================================
require("./routes/api-routes.js")(app);

//scrape route
//WITH PUPPETEER
// app.get("/scrapepuppeteer", async function (req, res) {
//   // do not clear the db
//   // db.Article.deleteMany({}).then(function (dbArticle) {
//   //   console.log(dbArticle);
//   // });
//   // db.Note.deleteMany({}).then(function (dbNote) {
//   //   console.log(dbNote);
//   // });
//   let countArticles = 0;
//   //launch puppeteer
//   const browser = await puppeteer.launch({
//     headless: false,
//   });
//   //create new page
//   const page = await browser.newPage();
//   // process.on("unhandledRejection", (reason, p) => {
//   //   console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
//   //   browser.close();
//   // });

//   await page.goto("https://www.tampabay.com/", {
//     waitUntil: "domcontentloaded",
//   });

//   /**
//    * Get page content as HTML.
//    */
//   const content = await page.content();
//   await browser.close();
//   const $ = cheerio.load(content);
//   fsLibrary.writeFileSync("newFilePuppeteer.txt", content, (writeerror) => {
//     if (writeerror) {
//       console.log(writeerror);
//     }
//   });
// });

//WITHOUT PUPPETEER

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
