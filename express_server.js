const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { shallowCopy } = require("ejs/lib/utils");
const {findURLbyID, findID, generateRandomString, emailChecker} = require("./helpers");

const PORT = 8080;
const app = express();

//////////////////////////////////////////////////////////////////////////////////////////////
// Middleware.
//////////////////////////////////////////////////////////////////////////////////////////////

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["blueMonkey"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours.
}));

//////////////////////////////////////////////////////////////////////////////////////////////
// Listener.
//////////////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

//////////////////////////////////////////////////////////////////////////////////////////////
// Datebase.
//////////////////////////////////////////////////////////////////////////////////////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "example@gmail.com",
    password: "123"
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////
// Routes
//////////////////////////////////////////////////////////////////////////////////////////////

// Display homepage.
app.get("/urls", (req, res) => {
  const userURLs = findURLbyID(req.session.user_id, urlDatabase);
  const templateVars = { user: users[req.session.user_id], urls: userURLs };
  res.render("urls_index", templateVars);
});

// View user login page.
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("urls_login", templateVars);
});

// Login and saves user information as a cookie.
app.post("/login", (req, res) => {
  for (let key in users) {
    if (bcrypt.compareSync(req.body.password, users[key].password)) {
      if (req.body.email === users[key].email) {
        req.session.user_id = findID(req.body.email, users);
        res.redirect("/urls");
        return;
      }
    }
  }
  res.send("ERROR 403");
});

// Logout.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// View new user registration page.
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("urls_register", templateVars);
});

// Register a new user.
app.post("/register", (req, res) => {
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.send("ERROR 400: The email and/or password were not entered.");
  } else if (emailChecker(req.body.email, users) === true) {
    res.send("ERROR 400: The entered email has already been used.");
  } else {
    const unhashedPassword = req.body.password;
    const hashedPassword = bcrypt.hashSync(unhashedPassword, 10);
    let newID = generateRandomString();
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPassword
    };
  }
  res.redirect("/login");
});

// Create a new short URL.
app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString(); // Generates a random 6 character string for the short URL.
  urlDatabase[shortURL] = {longURL: `http://www.${req.body.longURL}`, userID: req.session.user_id}; // Adds the new key-value pair to the URL database.
  res.redirect(`/urls/${shortURL}`);
});

// Display page for creating a new short URL.
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    const templateVars = {user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// View the short URL just made by the user.
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// Edit an existing URL.
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = `http://www.${req.body.editURL}`;
    res.redirect(`/urls`);
    return;
  } else {
    res.status(403).send("That URL does not belong to your account.");
  }
});

// Delete an existing URL.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
    return;
  } else {
    res.status(403).send("That URL does not belong to your account or does not exist."); // add more of these messages to other errors.
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});