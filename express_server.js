const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const generateRandomString = function() {
    return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };
  
  const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({extended: true}));
  
  
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
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
  
  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });
  
  
  app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`urls/${shortURL}`);
  });
  
  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });
  
  app.get("/urls/:shortURL", (req, res) => {
    const long = urlDatabase[req.params.shortURL];
    const templateVars = { shortURL: req.params.shortURL, longURL: long} ;
    res.render("urls_show", templateVars);
  });
  
  app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    let templateVars = { shortURL, longURL: urlDatabase[shortURL]};
    res.render("urls_show", templateVars);
  });
  
  
  app.post("/urls/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect("/urls");
  }); 
  
  
  app.post("/urls/:shortURL/delete", (req, res) => {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL]
    res.redirect("/urls");
  });
  
  app.post("/urls/:shortURL/edit", ( req, res) => {
      res.send("ok")
  })

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
  