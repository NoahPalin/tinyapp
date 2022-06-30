const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// Homepage.
app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// View user login page (currently is a registrattion page).
app.get("/login", (req, res) => {  
  //console.log(users[req.cookies.user_id]);
  const templateVars = { user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_login", templateVars);
});

// Login.//////////////////
app.post("/login", (req, res) => {
  for (let key in users) {
    if (req.body.email === users[key].email && req.body.password === users[key].password) {
      // console.log(req.body.email);
      // console.log(findID(req.body.email));
      res.cookie("user_id", findID(req.body.email));
      res.redirect("/urls");
      return;
    }
  }
  res.send("ERROR 403");
});

// Used to find a user ID with their matching email.
const findID = function (email) {
  for (let id in users) {
    //console.log(id);
    if (email === users[id].email) {
      //console.log("LOOK HERE: " + id);
      return id;
    }
  }
}

// Logout.
app.post("/logout", (req, res) => {
  //console.log(users[req.cookies.user_id]);
  res.clearCookie("user_id");
  res.redirect("/urls");
});


// View new user registration page.
app.get("/register", (req, res) => {

  const templateVars = { user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_register", templateVars)
});

// Register a new user.
app.post("/register", (req, res) => {
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.send("ERROR 400: The email and/or password were not entered.");
  } else if (emailChecker(req.body.email) === true) {
    res.send("ERROR 400: The entered email has already been used.");
  } else {
    let newID = generateRandomString();
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    };
  }
  res.redirect("/login");
  //console.log(users);
});

// Creates a new short URL.
app.post("/urls", (req, res) => {
  shortURL = generateRandomString(); // Generates a random 6 character string for the short URL.
  urlDatabase[shortURL] = `http://www.${req.body.longURL}`; //Adds the new key-value pair to the URL database.
  res.redirect(`/urls/${shortURL}`);
});

// Generates a random 6-character string for the new short URL.
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return str;
};

// Checks if an email is already attached to a user in the "database".
const emailChecker = function (newEmail) {
  for (let key in users) {
    if (users[key].email === newEmail) {
      return true;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  //console.log(req.cookies.user_id);
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/u/:shortURL/edit", (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = `http://www.${req.body.editURL}`
  res.redirect(`/urls`);
});

///////////////////////////////////////////////////
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});