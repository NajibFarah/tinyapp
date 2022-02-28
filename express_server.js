const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["Key1", "Key2"],
  })
);

const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

//functions and databases
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

const urlDatabase = {};

const usersDatabase = {};

//POST REQUESTS

//using user_id so only logged in users can create new tiny URLs.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userId = req.session.userId;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

//allows logged in users to edit their own urls
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  const loggedIn = req.session.userId;

  if (loggedIn === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = { longURL: newURL, userID: loggedIn };
    res.redirect("/urls");
  } else {
    res
      .status(403)
      .send(
        "You are not authorized to edit this URL. Consider making your own 😃"
      );
  }
});

//logged in users can delete their own urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const loggedIn = req.session.userId;

  if (loggedIn === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// create a user after registration and saves their id as user_id in cookies
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, usersDatabase);

  if (!email || !password) {
    return res
      .status(400)
      .send("Both Email and Password need to be filled to register.");
  }
  if (user) {
    return res
      .status(403)
      .send(
        "An account is already associated with this email try the login page."
      );
  }
  const id = generateRandomString();
  usersDatabase[id] = { id, email, password: hashedPassword };
  req.session.userId = id;
  res.redirect("/urls");
});

//Sets cookie named user_id  at login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, usersDatabase);

  if (!email || !password) {
    return res
      .status(403)
      .send("Both Email and Password need to be filled to login.");
  }

  if (!user) {
    return res.status(403).send("There is no user with that email");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    console.log(user[password]);
    return res.status(403).send("You have entered an incorrect password");
  }

  req.session.userId = user.id;
  res.redirect("/urls");
});

//logout and remove cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//GET REQUESTS

//redirects to the longURL from the shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    res
      .status(404)
      .send(
        "It appears that URL does not exist. Consider checking My URLs again or making a tinyURL for that website!"
      );
  } else {
    const longUrl = urlDatabase[shortURL].longURL;
    res.redirect(longUrl);
  }
});

app.get("/", (req, res) => {
  const loggedIn = req.session.userId;
  if (!loggedIn) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

//display URLs only if user is logged in
app.get("/urls", (req, res) => {
  const loggedIn = req.session.userId;
  if (!loggedIn) {
    return res
      .status(403)
      .send("Login or Register to view your shortened URLs");
  }

  const displayedURLS = urlsForUser(loggedIn, urlDatabase);

  const templateVars = {
    urls: displayedURLS,
    user: usersDatabase[req.session.userId],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//webpage to create new URL if logged in
app.get("/urls/new", (req, res) => {
  const loggedIn = req.session.userId;
  if (!loggedIn) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: usersDatabase[req.session.userId],
  };
  res.render("urls_new", templateVars);
});

// access to editing the shortURLs
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const loggedIn = req.session.userId;
  if (!loggedIn) {
    return res.status(401).send("You are not authorized to use this link");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const user = usersDatabase[loggedIn];
  const templateVars = { shortURL, longURL, user };
  if (longURL === undefined) {
    return res.status(404).send("Url does not exist");
  }
  if (loggedIn !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You are not authorized to use this link");
  }
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const loggedIn = req.session.userId;
  if (loggedIn) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: usersDatabase[req.session.userId],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const loggedIn = req.session.userId;
  if (loggedIn) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: usersDatabase[req.session.userId],
  };
  res.render("login", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
