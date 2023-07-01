//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

console.log(process.env.API_KEY);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      email: email, // corrected variable name
      password: hashedPassword,
    });

    await newUser.save();
    res.render("secrets");
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
});


app.post("/login", async function (req, res) {
  const username = req.body.email;
  const password = req.body.password;
  try {
    const foundUser = await User.findOne({ email: username });
    if (foundUser) {
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (passwordMatch) {
        res.render("secrets");
        return; // Exit the function after successful login
      }
    }
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
