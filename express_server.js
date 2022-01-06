const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const users = {};

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

const urlsForUser = (name, database) => {
  let userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === name) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
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

const urlDatabase = {};

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
  const user_ID = req.cookies.user_ID;
  const userUrls = urlsForUser(user_ID, urlDatabase); //using the newly created urlsForUser function
  const templateVars = { urls: userUrls, user: users[user_ID] };

  if (!user_ID) {
    return res.redirect("/login");
  }

  const user = users[user_ID];
  if (!user) {
    return res.redirect("/login");
  }

  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let user_ID = req.cookies.user_ID;
  if (!urlDatabase[shortURL] || !user_ID) {
    res.send("Please try again! You don't have permission to view");
  }
  if (urlDatabase[shortURL].userID != user_ID) {
    res.send("Please try again! You don't have permission to view");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const id = req.cookies["user_ID"];
  const user = users[id];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_ID"],
  };
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const { user_ID } = req.cookies;
  if (!user_ID) {
    return res.redirect("/login");
  }

  const user = users[user_ID];
  if (!user) {
    return res.redirect("/login");
  }

  let templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: long.longURL,
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
  const { user_ID } = req.cookies;
  if (user_ID) {
    return res.redirect("/urls");
  }

  const templateVars = { user: null };
  res.render("register", templateVars);
});

app.post("/register", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || (email === "" && !password) || password === "") {
    res.sendStatus(400);
  } else {
    const user = getUserByEmail(email);

    if (user) {
      return res
        .status(400)
        .send(
          "Email already in use. Please <a href= '/register'>try again</a>."
        );
    }

    let id = generateRandomString();
    console.log(`${email} ${hashedPassword}`);
    users[id] = {
      id: id,
      email: email,
      password: hashedPassword,
    };

    res.cookie("user_ID", id);
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["user_ID"];
  let shortURL = req.params.shortURL;
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];

    res.redirect("/urls");
  } else if (userID) {
    res.status(403).send("You are not the owner of this shortURL");
  } else {
    res.status(401).send("Please <a href= '/login'>login</a>");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.send("ok");
});

app.get("/login", (req, res) => {
  const { user_ID } = req.cookies;
  if (user_ID) {
    return res.redirect("/urls");
  }

  const templateVars = { user: null };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(req.body.email);
  if (!user) {
    return res
      .status(401)
      .send(
        "Issue with email or password. Please <a href= '/login'>try again</a>"
      );
  }
  // runs when authentication fails
  if (!bcrypt.compareSync(password, user.password)) {
    console.log(user[password]);
    return res
      .status(401)
      .send(
        "Issue with email or password. Please <a href= '/login'>try again</a>"
      );
  }

  console.log(user);

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
