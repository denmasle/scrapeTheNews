const axios = require("axios");
const cheerio = require("cheerio");
const Article = require("../models/Article");
const Note = require("../models/Note");

module.exports = router => {
    router.get("/", (req, res) => {
        Article.find({
            saved: false
        }, (err, doc) => {
            if (err) {
                res.send(err);
            }
            else {
                res.render("home", { article: doc });
            }
        });
    });

    //render handlebars page
    router.get("/saved", (req, res) => {
        Article.find({ saved: true }).populate("notes", "body").exec((err, doc) => {
            if (err) {
                res.send(err);
            }
            else {
                res.render("saved", { saved: doc });
            }
        });
    });

    //axios grab
    router.get("/scrape", (req, res) => {
        axios.get("https://www.mmafighting.com/latest-news/").then(function (response) {
            const $ = cheerio.load(response.data);
            $(".c-entry-box--compact__title").each(function (i, element) {
                const result = {};
                result.title = $(this).children("a").text();
                result.link = $(this).children("a").attr("href");
                const entry = new Article(result);
                entry.save((err, doc) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(doc);
                    }
                });
            });
        });
        res.redirect("/");
    });

    //saved to true
    router.post("/saved/:id", (req, res) => {
        Article.update({ _id: req.params.id }, { $set: { saved: true } }, (err, doc) => {
            if (err) {
                res.send(err);
            }
            else {
                res.redirect("/");
            }
        });
    });

    //delete saved articles
    router.post("/delete/:id", (req, res) => {
        Article.update({ _id: req.params.id }, { $set: { saved: false } }, (err, doc) => {
            if (err) {
                res.send(err);
            }
            else {
                res.redirect("/saved");
            }
        });
    });

    //note route
    router.post("/saved/notes/:id", (req, res) => {
        const newNote = new Note(req.body);
        console.log("new note" + newNote);
        newNote.save((error, doc) => {
            if (error) {
                res.send(error);
            }
            else {
                Article.findOneAndUpdate({ _id: req.params.id }, { $push: { "notes": doc._id } }, { new: true }).exec((err, newdoc) => {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.redirect("/saved");
                    }
                });
            }
        });
    });

    //delete the note
    router.post("/saved/delete/:id", (req, res) => {
        Note.remove({ _id: req.params.id }, (err, doc) => {
            if (err) {
                res.send(err);
            }
            else {
                res.redirect("/saved");
            }
        });
    });
};