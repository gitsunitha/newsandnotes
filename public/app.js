//Grab the articles as a json
$.getJSON("/articles", function (data) {
  debugger;
  // For each one
  $("#article").empty();
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page

    //build the string to append
    let cardString =
      "<div class='card mb-2 newsCard' data-id='" + data[i]._id + "'>";
    if (data[i].image) {
      cardString =
        cardString +
        "<img src='" +
        data[i].image +
        "' class='card-img-top' ></img>";
    }
    cardString =
      cardString +
      "<div class='card-header'><h5>" +
      data[i].title +
      "</h5></div>" +
      "<div class='card-body'>";
    if (data[i].summary) {
      cardString = cardString + "<p>" + data[i].summary + "</p>";
    }
    if (data[i].timestamp) {
      cardString =
        cardString + "<p class='text-muted'>" + data[i].timestamp + "</p>";
    }
    cardString =
      cardString +
      "<a href='" +
      data[i].link +
      "' class=' btn btn-primary card-link text-blue'>Link to the article</a>" +
      "<a href='#' data-id='" +
      data[i]._id +
      "' class=' btn btn-primary card-link text-blue createNote'>Create Note</a>" +
      "</div>" +
      "<div class='card-footer'>Scraped on " +
      data[i].date +
      "</div>" +
      "</div>";

    $("#articles").append(cardString);
  }
  if (data.length === 0) {
    $("#articles").append(
      "<div class='card mb-2' >" +
        "<div class='card-header'><h5>" +
        "No News Articles have been scraped today" +
        "</h5></div>" +
        "<div class='card-body scrapeArticles'>" +
        "<p>" +
        "Please get the latest articles" +
        "</p>" +
        "<p><button class='btn btn-lg btn-primary scrapeNow'>Get latest articles now</button></p>" +
        "</div>" +
        "</div>"
    );
  }
});

// (function ($) {
//   "use strict"; // Start of use strict

//   // Smooth scrolling using jQuery easing
//   $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
//     if (
//       location.pathname.replace(/^\//, "") ==
//         this.pathname.replace(/^\//, "") &&
//       location.hostname == this.hostname
//     ) {
//       var target = $(this.hash);
//       target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
//       if (target.length) {
//         $("html, body").animate(
//           {
//             scrollTop: target.offset().top - 72,
//           },
//           1000,
//           "easeInOutExpo"
//         );
//         return false;
//       }
//     }
//   });

// Closes responsive menu when a scroll trigger link is clicked
// $(".js-scroll-trigger").click(function() {
//     $(".navbar-collapse").collapse("hide");
// });

// Activate scrollspy to add active class to navbar items on scroll
// $("body").scrollspy({
//     target: "#mainNav",
//     offset: 75,
// });

// Collapse Navbar
// var navbarCollapse = function() {
//     if ($("#mainNav").offset().top > 100) {
//         $("#mainNav").addClass("navbar-scrolled");
//     } else {
//         $("#mainNav").removeClass("navbar-scrolled");
//     }
// };
// // Collapse now if page is not at top
// navbarCollapse();
// // Collapse the navbar when page is scrolled
// $(window).scroll(navbarCollapse);
//})(jQuery); // End of use strict

// $(document).on("click", "#home", function () {
//   window.scrollTo(0, document.getElementById("#homeSection").offsetTop);
// });

$(document).on("click", ".scrapeNow", function () {
  debugger;
  console.log("inside scrape ");
  // Now make a call for scraping
  $.getJSON("/scrape", function (data) {
    console.log(data);
    if (data.length > 0) {
      $(".scrapeArticles").emmpty();
      $(".scrapeArticles").append(
        "<p>Scraped " +
          data[0].ArticlesScraped +
          " Articles</p>" +
          "<p><button class='btn btn-lg btn-primary readArticles'>Show Articles</button></p>"
      );
    }
  });
});
// Whenever someone clicks on the card
$(document).on("click", ".createNote", function () {
  debugger;
  console.log("inside create note");
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      let notecard_str =
        "<div class='card mb-2 noteCard'  >" +
        "<div class='card-body'><h5 class='card-title'>'" +
        data.title +
        "'</h5>";

      // The title of the article
      $("#notes").append(notecard_str);
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append(
        "<button data-id='" +
          data._id +
          "' id='savenote'>Save Note</button></div></div>"
      );

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

$(document).on("click", ".clearOldArticles", function () {
  // Empty the articles
  $("#notes").empty();
  $("#articles").empty();
  // Save the id from the p tag

  // Now make an ajax call to clear previous data
  $.ajax({
    method: "POST",
    url: "/clearOldArticles",
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(`Resturned value ${data}`);
      if (data.length > 0 && data.message === "Articles cleared") {
        var elmnt = document.getElementById("articlesSection");
        elmnt.scrollIntoView();
        $("#articles").empty();
        $("#articles").append(
          "<div class='card mb-2' >" +
            "<div class='card-header'><h5>" +
            "All old Articles have been cleared" +
            "</h5></div>" +
            "<div class='card-body scrapeArticles'>" +
            "<p>" +
            "Would you like to get the latest news?" +
            "</p>" +
            "<p><button class='btn btn-lg btn-primary scrapeNow'>Get latest articles now</button></p>" +
            "</div>" +
            "</div>"
        );
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  debugger;
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),
    },
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

//switch to read article view
$(document).on("click", ".readArticles", function () {
  debugger;
  var elmnt = document.getElementById("articlesSection");
  elmnt.scrollIntoView();
  $("#article").empty();
  $.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      console.log(data[i]);
      //build the string to append
      let cardString =
        "<div class='card mb-2 newsCard' data-id='" + data[i]._id + "'>";
      if (data[i].image) {
        cardString =
          cardString +
          "<img src='" +
          data[i].image +
          "' class='card-img-top' ></img>";
      }
      cardString =
        cardString +
        "<div class='card-header'><h5>" +
        data[i].title +
        "</h5></div>" +
        "<div class='card-body'>";
      if (data[i].summary) {
        cardString = cardString + "<p>" + data[i].summary + "</p>";
      }
      if (data[i].timestamp) {
        cardString =
          cardString + "<p class='text-muted'>" + data[i].timestamp + "</p>";
      }
      cardString =
        cardString +
        "<a href='" +
        data[i].link +
        "' class=' btn btn-primary card-link text-blue'>Link to the article</a>" +
        "<a href='#' class=' btn btn-primary card-link text-blue createNote'>Create Note</a>" +
        "</div>" +
        "<div class='card-footer'>Scraped on " +
        data[i].date +
        "</div>" +
        "</div>";

      $("#articles").append(cardString);
    }
  });
});
