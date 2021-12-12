const express = require("express");
const app = express();
const PORT = 8080;
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user2RandomID: {
    id: "Najib Farah",
    email: "muhammed.najib.farah@gmail.com",
    password: "najib",
  },
};

app.set("view engine", "ejs");

const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

const getUserByEmail = function (email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const getUserById = function (userID) {
  for (const id in users) {
    const user = users[id];
    if (user.id === userID) {
      return user;
    }
  }
  return null;
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: getUserById(req.cookies["user_ID"]),
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: getUserById(req.cookies["user_ID"]) };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: long,
    user: req.cookies["user_ID"],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: getUserById(req.cookies["user_ID"]) };
  res.render("register", templateVars);
});

app.post("/register", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || (email === "" && !password) || password === "") {
    res.sendStatus(400);
  } else {
    const user = getUserByEmail(email);

    if (user) {
      return res.status(400).send("Email already in use.");
    }

    let id = generateRandomString();
    console.log(`${email} ${password}`);
    users[id] = {
      id: id,
      email: email,
      password: password,
    };

    res.cookie("user_ID", id);
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.send("ok");
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserById(req.cookies["user_ID"]),
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (!user) {
    return res.status(401).send("Issue with email or password.");
  }
  if (req.body.password !== user.password) {
    return res.status(401).send("Issue with email or password.");
  }

  res.cookie("user_ID", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
});

app.get("/urls/login", (req, res) => {
  res.render("urls_index");
});

/* app.post("/urls/login", (req, res) => {
  const user = req.body.username;
  res.cookie("user_ID", user);
  res.redirect("/urls");
}); */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
