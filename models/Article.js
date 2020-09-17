var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({
  // `title` is required and of type String
  newspaper: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  summary: {
    type: String,
    required: false,
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true,
    unique: true,
  },
  //timestamp is the string Date that is stored on the article
  //telling us where it was found
  timestamp: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: false,
    default: new Date(),
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note",
  },
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
