// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const fsLibrary = require("fs");
// Requiring our  model
var db = require("../models");

// Routes
// =============================================================
module.exports = function (app) {
  app.get("/scrape", function (req, res) {
    // db.Article.deleteMany({}).then(function (dbArticle) {
    //   console.log(dbArticle);
    // });
    // db.Note.deleteMany({}).then(function (dbNote) {
    //   console.log(dbNote);
    // });
    let countArticles = 0;
    axios.get("https://www.reuters.com/news/world").then(function (response) {
      fsLibrary.writeFileSync(
        "newFilenews.txt",
        response.data,
        (writeerror) => {
          if (writeerror) {
            console.log(error);
          }
        }
      );
      let cherioselector = cheerio.load(response.data);

      //first select the headlines
      //cherioselector("div.")
      //then the rest of the lines
      //cherioselector(".story-item").each(function (i, element) {
      //story-item vertical-horizontal-right
      cherioselector(".story-content").each(function (i, element) {
        console.log("got one");
        var result = {};
        if (cherioselector(this).children("a")) {
          console.log(cherioselector(this).children("a"));
          console.log("\n-------------------\n");
          let linkstr = "";
          result.newspaper = "Rueters";

          result.title = cherioselector(this)
            .children("a")
            .children(".story-title")
            .text();
          result.summary = cherioselector(this).children("p").text();
          result.timestamp = cherioselector(this)
            .children("time.article-time")
            .children(".timestamp")
            .text();

          linkstr = cherioselector(this).children("a").attr("href");

          if (!linkstr.includes("https://www.reuters.com")) {
            linkstr = "https://www.reuters.com" + linkstr;
          }
          result.link = linkstr;

          if (cherioselector(this).siblings(".story-photo")) {
            console.log("found photo");
            console.log(cherioselector(this).siblings(".story-photo"));
            result.image = cherioselector(this)
              .siblings(".story-photo")
              .children("a")
              .children("img")
              .attr("org-src");
          } else {
            result.image = "No Photo Available";
            //show no image photo
          }

          result.date = new Date();
          console.log("----------------");
          console.log(result);
          countArticles++;
          //Insert into db
          db.Article.create(result)
            .then(function (dbArticle) {
              // View the added result in the console
              //console.log(dbArticle);
            })
            .catch(function (err) {
              // If an error occurred, log it
              console.log(err);
            });
        }

        // Send a message to the client
        //res.send("Scrape Complete");
      });
      console.log({ ArticlesScraped: countArticles });
      res.json({ ArticlesScraped: countArticles });
    });
  });

  app.get("/scrapelocal", function (req, res) {
    // db.Article.deleteMany({}).then(function (dbArticle) {
    //   console.log(dbArticle);
    // });
    // db.Note.deleteMany({}).then(function (dbNote) {
    //   console.log(dbNote);
    // });
    let countArticles = 0;
    axios
      .get("https://www.tampabay.com/news")
      .then(function (response) {
        fsLibrary.writeFileSync(
          "tampabaynews.txt",
          response.data,
          (writeerror) => {
            if (writeerror) {
              console.log(error);
            }
          }
        );
        let cherioselector = cheerio.load(response.data);

        //first select the headlines
        //cherioselector("div.")
        //then the rest of the lines
        //cherioselector(".story-item").each(function (i, element) {
        //story-item vertical-horizontal-right
        cherioselector(".story-item").each(function (i, element) {
          console.log("got one");
          var result = {};
          if (
            cherioselector(this)
              .children("div.group")
              .children("div.headline")
              .children("a")
              .text()
          ) {
            countArticles++;
            let linkstr = "";

            result.title = cherioselector(this)
              .children("div.group")
              .children("div.headline")
              .children("a")
              .text();

            linkstr = cherioselector(this)
              .children("div.group")
              .children("div.headline")
              .children("a")
              .attr("href");

            if (!linkstr.includes("https://www.tampabay.com")) {
              linkstr = "https://www.tampabay.com" + linkstr;
            }
            result.link = linkstr;

            if (cherioselector(this).children("img")) {
              result.image = cherioselector(this).children("img").attr("src");
              result.imageSrcSet = cherioselector(this)
                .children("img")
                .attr("srcset");
            }

            result.date = new Date();
            console.log("----------------");
            console.log(result.title);
            console.log(result.link);
            //Insert into db
            db.Article.create(result)
              .then(function (dbArticle) {
                console.log(dbArticle);
              })
              .catch(function (err) {
                // If an error occurred, log it
                console.log(err);
              });
          }
        });
      })
      .catch(function (err) {
        console.log("TEST");
        console.log(err);
      });

    // Send a message to the client
    //res.send("Scrape Complete");
    console.log({ ArticlesScraped: countArticles });
    res.json({ ArticlesScraped: countArticles });
  });

  app.post("/clearOldArticles", function (req, res) {
    console.log("Entered function clearOldArticles");
    db.Article.deleteMany({})
      .then(function (dbArticle) {
        console.log(`removed ${dbArticle}`);
        console.log(dbArticle);
        return db.Note.deleteMany({})

          .then(function (dbNote) {
            console.log(`removed notes ${dbNote}`);
          })
          .catch(function (err) {
            res.json({ message: "Annotations may not have been cleared" });
          });

        res.json({ message: "Articles cleared" });
      })
      .catch(function (err) {
        res.json({ message: "Articles may not have been cleared" });
      });
  });

  // Route for getting all Articles from the db
  app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    //ISODate("2020-08-10T00:00:00Z")
    db.Article.find({ date: { $lte: new Date() } })
      .sort({ date: 1 })
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for getting all Articles from the db
  app.get("/annonatedarticles", function (req, res) {
    // Grab every document in the Articles collection
    //ISODate("2020-08-10T00:00:00Z")
    debugger;
    db.Article.find({ note: { $exists: true } })
      .sort({ date: 1 })
      .populate("note")
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    debugger;
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function (dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function (dbNote) {
<<<<<<< HEAD
=======
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
>>>>>>> 417dacd7bfdef543aa36728140e5ab585c7bc7a7
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { note: dbNote._id },
          { new: true }
        );
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};
