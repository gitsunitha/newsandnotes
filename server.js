const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

//express stuff
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//db stuff

const db = require("./models");

const PORT = process.env.PORT || 3001;

var MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

//scrape route

app.get("/scrape", function(req, res) {
    axios.get("https://www.tampabay.com/").then(function(response) {
        let cherioselector = cheerio.load(response.data);
        cherioselector(".story-item").each(function(i, element) {
            console.log(i);
            var result = {};
            if (
                cherioselector(this)
                .children("div.group")
                .children("div.headline")
                .children("a")
                .text()
            ) {
                result.title = cherioselector(this)
                    .children("div.group")
                    .children("div.headline")
                    .children("a")
                    .text();

                result.link = cherioselector(this)
                    .children("div.group")
                    .children("div.headline")
                    .children("a")
                    .attr("href");
                if (
                    cherioselector(this)
                    .children("div.group")
                    .children("div.subheadline")
                    .children("a")
                    .text()
                ) {
                    result.summary = cherioselector(this)
                        .children("div.group")
                        .children("div.subheadline")
                        .children("a")
                        .text();
                } else {
                    result.summary = "No Summary";
                }
                console.log("----------------");
                console.log(result.title);
                console.log(result.link);
                //Insert into db
                db.Article.create(result)
                    .then(function(dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function(err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            }
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function(dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});