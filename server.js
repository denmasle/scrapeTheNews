//dependencies
const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");

//set up Express
const app = express();
const router = express.Router();

require("./controller/controller")(router);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(router);
app.use(methodOverride("_method"));

//mongoose database
mongoose.Promise = Promise;

const db = mongoose.connection;

db.on("error", error => {
  console.log("Mongoose Error: ", error);
});
db.once("open", () => {
  console.log("Mongoose connection successful!");
});

if (process.env.MONGODB_URI) {
	//executes in heroku
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect("mongodb://localhost/mmaScrape1")
}

//handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//start app
const port = process.env.PORT || 3000;

app.listen(port, () =>
{
  console.log("Running on port: " + port);
});